// ═══════════════════════════════════════════════════════════════
// Editorial Minimal anasayfa — CMS prop sözleşmeleri
// ═══════════════════════════════════════════════════════════════

export interface EditorialImage {
  src: string
  alt: string
}

export interface EditorialLink {
  label: string
  href: string
}

export interface EditorialNavItem extends EditorialLink {
  id: string
  /** İngilizce etiketler: CSS uppercase Türkçe i→İ yapmasın */
  lang?: 'en' | 'tr'
}

export interface EditorialHeaderContent {
  announcement: string
  announcementAccent?: string
  /**
   * Gerçek logo görseli. Verilmezse tipografik wordmark (EditorialWordmark)
   * kullanılır — admin panelinden görsel yüklendiğinde burası dolar.
   */
  logo?: EditorialImage
  /** Tipografik wordmark metni (logo görseli yokken) */
  wordmark?: { text: string; year?: string }
  nav: EditorialNavItem[]
  searchLabel: string
  accountLabel: string
  cartLabel: string
}

export interface EditorialMobileNavItem extends EditorialLink {
  id: string
  icon: 'explore' | 'grid' | 'book' | 'bag' | 'account'
}

export interface HomeHarvestMetricCell {
  label: string
  value: string
  detail: string
  detailAccent?: boolean
}

export interface EditorialFeedHeader {
  eyebrow: string
  title: string
  aside: string
}

export type EditorialFeedItem =
  | {
      type: 'product'
      id: string
      href: string
      image: EditorialImage
      badge?: { text: string; position: 'left' | 'right'; variant?: 'dark' | 'light' }
      category: string
      title: string
      price: string
      ctaLabel: string
      subtitle?: string
    }
  | {
      type: 'product-dark'
      id: string
      href: string
      image: EditorialImage
      badge?: string
      category: string
      title: string
      description: string
      price: string
      ctaLabel: string
    }
  | {
      type: 'atmosphere-square'
      id: string
      image: EditorialImage
      overlayKicker: string
      overlayTitle: string
      footerLeft: string
      footerRight: string
    }
  | {
      type: 'editorial-square'
      id: string
      image: EditorialImage
      kicker: string
      title: string
      description?: string
    }
  | {
      type: 'quote'
      id: string
      quote: string
      author: string
      note: string
    }
  | {
      type: 'atmosphere-portrait'
      id: string
      image: EditorialImage
      kicker: string
      title: string
      meta: string
    }
  | {
      type: 'square-caption'
      id: string
      image: EditorialImage
      leftCaption: string
      rightCaption: string
    }
  | {
      type: 'feature-wide'
      id: string
      eyebrow: string
      title: string
      description: string
      price: string
      stockNote: string
      ctaLabel: string
      href: string
    }

export interface EditorialJournalContent {
  image: EditorialImage
  certificate: { title: string; body: string }
  breadcrumb: [string, string]
  title: string
  paragraphs: string[]
  metrics: { value: string; label: string; accent?: boolean }[]
  primaryCta: EditorialLink
  secondaryCta: EditorialLink
}

export interface GoldyliumProductCard {
  id: string
  href: string
  image: EditorialImage
  phaseBadge: string
  category: string
  title: string
  description: string
  price: string
  ctaLabel: string
}

export interface GoldyliumSpotlightContent {
  eyebrow: string
  title: string
  intro: string
  products: GoldyliumProductCard[]
  assurance: string
  collectionLink: EditorialLink
}

export interface InstagramTile {
  id: string
  image: EditorialImage
  href?: string
  hoverLabel: string
}

export interface EditorialNewsletterContent {
  eyebrow: string
  title: string
  description: string
  placeholder: string
  submitLabel: string
  disclaimer: string
}

export interface InstagramCommunityContent {
  eyebrow: string
  title: string
  followLink: EditorialLink
  tiles: InstagramTile[]
  newsletter: EditorialNewsletterContent
}

export interface HomeValueCell {
  label: string
  value: string
}

export interface EditorialFooterColumn {
  title: string
  body?: string
  labCode?: string
  links?: EditorialLink[]
}

export interface EditorialFooterContactEmail {
  label: string
  address: string
}

export interface EditorialFooterContent {
  columns: EditorialFooterColumn[]
  footerNewsletter: { placeholder: string; submitLabel: string }
  /** Alt şerit — KVKK, iade, çerez vb. */
  legalLinks: EditorialLink[]
  contactEmails: EditorialFooterContactEmail[]
  copyright: string
  instagramHandle: EditorialLink
  currency: { enabled: boolean; primary: string; secondary: string }
  tagline: string
}

export interface EditorialHomeContent {
  header: EditorialHeaderContent
  mobileNav: EditorialMobileNavItem[]
  harvestMetrics: HomeHarvestMetricCell[]
  feed: { header: EditorialFeedHeader; items: EditorialFeedItem[] }
  journal: EditorialJournalContent
  goldylium: GoldyliumSpotlightContent
  instagram: InstagramCommunityContent
  values: HomeValueCell[]
  footer: EditorialFooterContent
}
