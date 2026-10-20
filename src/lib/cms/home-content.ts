// ═══════════════════════════════════════════════════════════════
// Anasayfa içeriği — DB (site_settings) + statik varsayılan
//
// Tema editörü (/admin/tema) site_settings tablosundaki 'home_content'
// anahtarına yazar. Kayıt yoksa veya Supabase yapılandırılmamışsa
// statik varsayılana düşer — build ve preview asla kırılmaz.
//
// SUNUCU TARAFI: getHomeContent() Server Component'lerden çağrılır.
// ═══════════════════════════════════════════════════════════════

import { cache } from 'react'
import type { HeroProps } from '@/types/hero'
import type { EditorialHomeContent } from '@/types/editorial-home'
import { getSiteSetting, setSiteSetting } from '@/lib/site-settings'
import {
  editorialHomeContent as defaultEditorialContent,
  homeHeroProps as defaultHeroProps,
  homeCurationStrip as defaultCurationStrip,
} from './home-page'
import { defaultHomeCuratedSettings } from './home-curated-defaults'
import type { HomeCuratedSettings } from '@/types/home-curated'
import { getLocale } from '@/lib/i18n/locale'
import { enHeaderContent, enFooterContent, enMobileNav, enProductLabels } from './home-content.en'
import { defaultProductLabels, type ProductLabels } from './product-labels'
import {
  HEADER_ANNOUNCEMENT_TR,
  LEGACY_HEADER_ACCENT,
  LEGACY_HEADER_ANNOUNCEMENT,
} from '@/lib/shipping-policy'
import { normalizeLegacyCopy } from './legacy-copy'

export { defaultProductLabels, type ProductLabels } from './product-labels'

export const HOME_CONTENT_KEY = 'home_content'

/** Tema editörünün yönettiği tüm anasayfa içeriği */
export interface HomeContent {
  hero: HeroProps
  curationStrip: typeof defaultCurationStrip
  editorial: EditorialHomeContent
  /** Hero altı canlı ürün blokları (En çok tercih edilenler, Signature) */
  curated: HomeCuratedSettings
  /** Ürün kartı / buton / etiket metinleri (katalog geneli) */
  productLabels: ProductLabels
}

/** Yanlışlıkla kaydedilmiş ürün CDN path'i (editoryal yer tutucu değil) */
function isLikelyProductCdnEditorialSrc(src: string | undefined): boolean {
  if (!src) return false
  const v = src.trim()
  if (v.startsWith('http://') || v.startsWith('https://')) return false
  if (v.includes('/design-preview/stitch-')) return false
  if (v.startsWith('/')) return false
  // Admin yüklemesi: products/editorial/… — ürün CDN path'i değil
  if (v.startsWith('editorial/')) return false
  return /^[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/i.test(v)
}

function pickEditorialImageSrc(stored: string | undefined, defaultSrc: string): string {
  if (stored && !isLikelyProductCdnEditorialSrc(stored)) return stored
  return defaultSrc
}

/** DB'deki hatalı ürün CDN görsellerini kod varsayılanına (stitch → Google) döndürür */
function restoreEditorialImageDefaults(content: HomeContent): HomeContent {
  const d = defaultHomeContent
  const editorial = content.editorial
  const defEd = d.editorial

  const feedItems = editorial.feed.items.map((item) => {
    const defItem = defEd.feed.items.find((x) => x.id === item.id)
    if (!defItem || !('image' in item) || !('image' in defItem)) return item
    return {
      ...item,
      image: {
        ...item.image,
        src: pickEditorialImageSrc(item.image.src, defItem.image.src),
      },
    }
  })

  const goldyProducts = editorial.goldylium.products.map((p) => {
    const defP = defEd.goldylium.products.find((x) => x.id === p.id)
    if (!defP) return p
    return {
      ...p,
      image: {
        ...p.image,
        src: pickEditorialImageSrc(p.image.src, defP.image.src),
      },
    }
  })

  const igTiles = editorial.instagram.tiles.map((t) => {
    const defT = defEd.instagram.tiles.find((x) => x.id === t.id)
    if (!defT) return t
    return {
      ...t,
      image: {
        ...t.image,
        src: pickEditorialImageSrc(t.image.src, defT.image.src),
      },
    }
  })

  return {
    ...content,
    hero: {
      ...content.hero,
      image: {
        ...content.hero.image,
        src: pickEditorialImageSrc(content.hero.image.src, d.hero.image.src),
      },
      ...(content.hero.imageMobile || d.hero.imageMobile
        ? {
            imageMobile: {
              ...(content.hero.imageMobile ?? d.hero.imageMobile!),
              src: pickEditorialImageSrc(
                content.hero.imageMobile?.src,
                d.hero.imageMobile?.src ?? d.hero.image.src,
              ),
            },
          }
        : {}),
    },
    editorial: {
      ...editorial,
      feed: { ...editorial.feed, items: feedItems },
      journal: {
        ...editorial.journal,
        image: {
          ...editorial.journal.image,
          src: pickEditorialImageSrc(editorial.journal.image.src, defEd.journal.image.src),
        },
      },
      goldylium: { ...editorial.goldylium, products: goldyProducts },
      instagram: { ...editorial.instagram, tiles: igTiles },
    },
  }
}

/** Kod içindeki statik varsayılan — DB boşken kullanılır */
export const defaultHomeContent: HomeContent = {
  hero: defaultHeroProps,
  curationStrip: defaultCurationStrip,
  editorial: defaultEditorialContent,
  curated: defaultHomeCuratedSettings,
  productLabels: defaultProductLabels,
}

/**
 * Eski şerit (“1985'ten beri…” + “Ücretsiz Özel Teslimat”) kargo
 * kuralıyla çelişiyor. O kayıt duruyorsa kodun duyurusu geçer.
 * Başka bir duyuru yazıldıysa ona dokunulmaz.
 */
function resolveHeaderAnnouncement(
  stored: { announcement?: string; announcementAccent?: string } | undefined,
): { announcement: string; announcementAccent?: string } {
  const fallback = HEADER_ANNOUNCEMENT_TR
  const storedAnnouncement = stored?.announcement?.trim()
  const announcement =
    !storedAnnouncement || storedAnnouncement === LEGACY_HEADER_ANNOUNCEMENT
      ? fallback
      : storedAnnouncement

  const storedAccent = stored?.announcementAccent?.trim()
  const dropAccent =
    announcement === fallback ||
    !storedAccent ||
    storedAccent === LEGACY_HEADER_ACCENT

  return dropAccent
    ? { announcement, announcementAccent: undefined }
    : { announcement, announcementAccent: storedAccent }
}

/**
 * Kısmi DB kaydını varsayılanla birleştirir.
 * Admin yalnızca bir alanı değiştirdiyse gerisi varsayılandan gelir;
 * ayrıca tip genişlediğinde eski kayıtlar kırılmaz.
 */
function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback
}

function merge(stored: Partial<HomeContent> | null): HomeContent {
  if (!stored) return defaultHomeContent
  const d = defaultHomeContent
  const storedJournal = stored.editorial?.journal
  const merged: HomeContent = {
    hero: {
      ...d.hero,
      ...(stored.hero ?? {}),
      image: { ...d.hero.image, ...(stored.hero?.image ?? {}) },
      cta: { ...d.hero.cta, ...(stored.hero?.cta ?? {}) },
    },
    curationStrip: { ...d.curationStrip, ...(stored.curationStrip ?? {}) },
    editorial: {
      ...d.editorial,
      ...(stored.editorial ?? {}),
      header: {
        ...d.editorial.header,
        ...(stored.editorial?.header ?? {}),
        // Menü kodda tanımlı; eski tema kaydı üst navı ezmesin
        nav: d.editorial.header.nav,
        // Eski “ücretsiz özel teslimat” şeridi kargo kuralıyla çelişiyor
        ...resolveHeaderAnnouncement(stored.editorial?.header),
      },
      feed: {
        ...d.editorial.feed,
        ...(stored.editorial?.feed ?? {}),
        header: {
          ...d.editorial.feed.header,
          ...(stored.editorial?.feed?.header ?? {}),
        },
        // Kısmi DB kaydı items'ı silmesin — tema editörü crash olmasın
        items:
          Array.isArray(stored.editorial?.feed?.items) && stored.editorial.feed.items.length > 0
            ? stored.editorial.feed.items
            : d.editorial.feed.items,
      },
      journal: {
        ...d.editorial.journal,
        ...(storedJournal ?? {}),
        image: { ...d.editorial.journal.image, ...(storedJournal?.image ?? {}) },
        paragraphs: asArray(storedJournal?.paragraphs, d.editorial.journal.paragraphs),
        metrics: asArray(storedJournal?.metrics, d.editorial.journal.metrics),
        primaryCta: { ...d.editorial.journal.primaryCta, ...(storedJournal?.primaryCta ?? {}) },
        secondaryCta: { ...d.editorial.journal.secondaryCta, ...(storedJournal?.secondaryCta ?? {}) },
      },
      instagram: {
        ...d.editorial.instagram,
        ...(stored.editorial?.instagram ?? {}),
        tiles: asArray(stored.editorial?.instagram?.tiles, d.editorial.instagram.tiles),
      },
      goldylium: {
        ...d.editorial.goldylium,
        ...(stored.editorial?.goldylium ?? {}),
        products: asArray(stored.editorial?.goldylium?.products, d.editorial.goldylium.products),
      },
      footer: {
        ...d.editorial.footer,
        ...(stored.editorial?.footer ?? {}),
        instagramHandle: {
          ...d.editorial.footer.instagramHandle,
          ...(stored.editorial?.footer?.instagramHandle ?? {}),
        },
        currency: {
          ...d.editorial.footer.currency,
          ...(stored.editorial?.footer?.currency ?? {}),
        },
      },
    },
    curated: {
      ...d.curated,
      ...(stored.curated ?? {}),
      mostPreferred: {
        ...d.curated.mostPreferred,
        ...(stored.curated?.mostPreferred ?? {}),
        productIds: asArray(
          stored.curated?.mostPreferred?.productIds,
          d.curated.mostPreferred.productIds,
        ),
      },
      signature: {
        ...d.curated.signature,
        ...(stored.curated?.signature ?? {}),
        productIds: asArray(stored.curated?.signature?.productIds, d.curated.signature.productIds),
      },
    },
    productLabels: { ...d.productLabels, ...(stored.productLabels ?? {}) },
  }
  return normalizeLegacyCopy(restoreEditorialImageDefaults(merged))
}

/**
 * locale='en' olduğunda header/footer/mobileNav/productLabels'ı statik
 * EN içerikle değiştirir. Admin tema editörü TR-only olduğu için DB
 * override'ları bu alanlara asla karışmaz. Kapsam dışı bölümler
 * (hero, feed, journal, goldylium, instagram, values, harvestMetrics,
 * curated, curationStrip) bilinçli olarak TR kalır — bkz. ROADMAP.md v0.8.
 */
function applyEnglishOverrides(content: HomeContent): HomeContent {
  return {
    ...content,
    editorial: {
      ...content.editorial,
      header: enHeaderContent,
      footer: enFooterContent,
      mobileNav: enMobileNav,
    },
    productLabels: enProductLabels,
  }
}

/**
 * Anasayfa içeriğini getirir (DB → yoksa statik varsayılan).
 * React cache() ile istek başına tek okuma — layout, Header ve Footer
 * aynı render'da çağırdığında Supabase'e tek gidiş olur.
 */
export const getHomeContent = cache(async function getHomeContent(): Promise<HomeContent> {
  const [stored, locale] = await Promise.all([
    getSiteSetting<Partial<HomeContent>>(HOME_CONTENT_KEY),
    getLocale(),
  ])
  const merged = merge(stored)
  return locale === 'en' ? applyEnglishOverrides(merged) : merged
})

/** Yalnızca ürün etiketlerini getirir (katalog sayfaları için hafif okuma) */
export async function getProductLabels(): Promise<ProductLabels> {
  const content = await getHomeContent()
  return content.productLabels
}

/** Tema editörü kaydı — admin API'den çağrılır (service_role) */
export async function setHomeContent(content: HomeContent): Promise<boolean> {
  return setSiteSetting(HOME_CONTENT_KEY, content as unknown as Record<string, unknown>)
}
