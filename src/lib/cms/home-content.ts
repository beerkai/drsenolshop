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

export interface ProductLabels {
  /** Ürün detay birincil buton */
  addToCart: string
  addedToCart: string
  /** Kart ve detayda stok dışı rozeti */
  outOfStock: string
  /** Fiyat yalnızca varyanttan geliyorsa kartta gösterilen metin */
  variantPricePlaceholder: string
  /** Varyant seçim başlığı ve sağdaki not */
  variantHeading: string
  variantNote: string
  /** Varyant düğmesi durumları */
  variantSelected: string
  variantAvailable: string
  /** Koleksiyon sayfası boş durum */
  emptyTitle: string
  emptyHint: string
}

export const defaultProductLabels: ProductLabels = {
  addToCart: 'Sepete Ekle',
  addedToCart: 'Sepete Eklendi ✓',
  outOfStock: 'Tükendi',
  variantPricePlaceholder: 'Varyantta',
  variantHeading: 'Gramaj / Boyut',
  variantNote: 'Sınırlı Dolum',
  variantSelected: 'Seçili',
  variantAvailable: 'Mevcut',
  emptyTitle: 'Bu filtrelerle ürün bulunamadı.',
  emptyHint: 'Filtreleri temizleyip tekrar deneyin.',
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
 * Kısmi DB kaydını varsayılanla birleştirir.
 * Admin yalnızca bir alanı değiştirdiyse gerisi varsayılandan gelir;
 * ayrıca tip genişlediğinde eski kayıtlar kırılmaz.
 */
function merge(stored: Partial<HomeContent> | null): HomeContent {
  if (!stored) return defaultHomeContent
  const merged: HomeContent = {
    hero: { ...defaultHomeContent.hero, ...(stored.hero ?? {}) },
    curationStrip: { ...defaultHomeContent.curationStrip, ...(stored.curationStrip ?? {}) },
    editorial: {
      ...defaultHomeContent.editorial,
      ...(stored.editorial ?? {}),
      header: {
        ...defaultHomeContent.editorial.header,
        ...(stored.editorial?.header ?? {}),
        // Menü kodda tanımlı; eski tema kaydı üst navı ezmesin
        nav: defaultHomeContent.editorial.header.nav,
      },
      feed: {
        ...defaultHomeContent.editorial.feed,
        ...(stored.editorial?.feed ?? {}),
        header: {
          ...defaultHomeContent.editorial.feed.header,
          ...(stored.editorial?.feed?.header ?? {}),
        },
        // Kısmi DB kaydı items'ı silmesin — tema editörü crash olmasın
        items:
          Array.isArray(stored.editorial?.feed?.items) && stored.editorial.feed.items.length > 0
            ? stored.editorial.feed.items
            : defaultHomeContent.editorial.feed.items,
      },
      journal: {
        ...defaultHomeContent.editorial.journal,
        ...(stored.editorial?.journal ?? {}),
      },
      footer: {
        ...defaultHomeContent.editorial.footer,
        ...(stored.editorial?.footer ?? {}),
        currency: {
          ...defaultHomeContent.editorial.footer.currency,
          ...(stored.editorial?.footer?.currency ?? {}),
        },
      },
    },
    curated: {
      ...defaultHomeContent.curated,
      ...(stored.curated ?? {}),
      mostPreferred: {
        ...defaultHomeContent.curated.mostPreferred,
        ...(stored.curated?.mostPreferred ?? {}),
      },
      signature: {
        ...defaultHomeContent.curated.signature,
        ...(stored.curated?.signature ?? {}),
      },
    },
    productLabels: { ...defaultHomeContent.productLabels, ...(stored.productLabels ?? {}) },
  }
  return restoreEditorialImageDefaults(merged)
}

/**
 * Anasayfa içeriğini getirir (DB → yoksa statik varsayılan).
 * React cache() ile istek başına tek okuma — layout, Header ve Footer
 * aynı render'da çağırdığında Supabase'e tek gidiş olur.
 */
export const getHomeContent = cache(async function getHomeContent(): Promise<HomeContent> {
  const stored = await getSiteSetting<Partial<HomeContent>>(HOME_CONTENT_KEY)
  return merge(stored)
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
