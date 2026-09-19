// ═══════════════════════════════════════════════════════════════
// Anasayfa kürasyon blokları — tema editörü + sunucu çözümleme
// ═══════════════════════════════════════════════════════════════

export type HomeCuratedOrderBy = 'popular' | 'newest' | 'name'

export interface HomeCuratedBlockConfig {
  enabled: boolean
  eyebrow: string
  title: string
  description: string
  viewAllHref: string
  viewAllLabel: string
  categorySlug: string
  limit: number
  orderBy: HomeCuratedOrderBy
  /** Doluysa kategori yerine bu sırayla ürünler gösterilir */
  productIds: string[]
}

export interface HomeSignatureBlockConfig extends HomeCuratedBlockConfig {
  /** Signature grid — koyu kart stili (tema editöründen) */
  darkCards: boolean
  /** Başlık/eyebrow için HTML lang */
  titleLang: 'en' | 'tr'
}

export interface HomeCuratedSettings {
  /** Eski CMS mock feed bölümü */
  legacyFeedEnabled: boolean
  mostPreferred: HomeCuratedBlockConfig
  signature: HomeSignatureBlockConfig
}
