import type { HomeCuratedSettings } from '@/types/home-curated'

export const defaultHomeCuratedSettings: HomeCuratedSettings = {
  legacyFeedEnabled: false,
  mostPreferred: {
    enabled: true,
    eyebrow: 'Keşfet · Seçki',
    title: 'En Çok Tercih Edilenler',
    description:
      'Ham bal koleksiyonundan en çok sipariş edilen hasatlar — Saitabat yayla ve orman balları.',
    viewAllHref: '/kategori/bal',
    viewAllLabel: 'Tüm ham ballar',
    categorySlug: 'bal',
    limit: 8,
    orderBy: 'popular',
    productIds: [],
  },
  signature: {
    enabled: true,
    eyebrow: 'Signature Series',
    title: 'Signature Series',
    description: '',
    viewAllHref: '/kategori/signature',
    viewAllLabel: 'View collection',
    categorySlug: 'signature',
    limit: 8,
    orderBy: 'popular',
    productIds: [],
    darkCards: false,
    titleLang: 'en',
  },
}
