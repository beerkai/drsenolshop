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
  return {
    hero: { ...defaultHomeContent.hero, ...(stored.hero ?? {}) },
    curationStrip: { ...defaultHomeContent.curationStrip, ...(stored.curationStrip ?? {}) },
    editorial: {
      ...defaultHomeContent.editorial,
      ...(stored.editorial ?? {}),
      footer: {
        ...defaultHomeContent.editorial.footer,
        ...(stored.editorial?.footer ?? {}),
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
