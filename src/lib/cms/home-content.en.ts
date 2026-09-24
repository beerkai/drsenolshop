// ═══════════════════════════════════════════════════════════════
// İngilizce (EN) statik varsayılan içerik — yalnızca header, footer,
// mobileNav ve productLabels. Admin tema editörü TR-only olduğu için
// bu alanlar DB'den asla override edilmez (getHomeContent locale='en'
// olduğunda bunları doğrudan kullanır, merge() sonucunu ezer).
//
// Kapsam dışı (hero, curationStrip, curated, feed, journal, goldylium,
// instagram, values, harvestMetrics) EN'de de TR içerik gösterir —
// bilinçli bir sonraki-pass kararı, bkz. ROADMAP.md v0.8.
// ═══════════════════════════════════════════════════════════════

import type {
  EditorialHeaderContent,
  EditorialFooterContent,
  EditorialMobileNavItem,
} from '@/types/editorial-home'
import type { ProductLabels } from './product-labels'

export const enHeaderContent: EditorialHeaderContent = {
  announcement: "Since 1985, from Saitabat's floral richness to your table",
  announcementAccent: 'Free Special Delivery',
  wordmark: { text: 'Dr. Şenol', year: '1985' },
  nav: [
    { id: 'koleksiyon', label: 'Collection', href: '/en/koleksiyon' },
    { id: 'aricilik', label: 'Apiculture & Heritage', href: '/en/hikaye' },
    { id: 'signature', label: 'Signature Series', href: '/en/kategori/signature', lang: 'en' },
    { id: 'goldylium', label: 'Goldylium Cosmetics', href: '/en/goldylium', lang: 'en' },
    { id: 'iletisim', label: 'Contact', href: '/en/iletisim' },
  ],
  searchLabel: 'Search',
  accountLabel: 'Account',
  cartLabel: 'Cart',
}

export const enMobileNav: EditorialMobileNavItem[] = [
  { id: 'kesfet', label: 'Discover', href: '/en', icon: 'explore' },
  { id: 'koleksiyon', label: 'Collection', href: '/en/koleksiyon', icon: 'grid' },
  { id: 'miras', label: 'Heritage', href: '/en/hikaye', icon: 'book' },
  { id: 'canta', label: 'Bag', href: '/en/odeme', icon: 'bag' },
  { id: 'hesap', label: 'Account', href: '/en/hesabim', icon: 'account' },
]

export const enFooterContent: EditorialFooterContent = {
  columns: [
    {
      title: 'Saitabat Heritage & Laboratory',
      body: "Boutique beekeeping since 1985 in the endemic flora of Saitabat Village, at the foot of Mount Uludağ — lab-certified raw honey and biotechnological apitherapy formulas.",
    },
    {
      title: 'Collection & Brand',
      links: [
        { label: 'Full Collection', href: '/en/koleksiyon' },
        { label: 'Goldylium Perfume', href: '/en/goldylium' },
        { label: 'Lab Analyses', href: '/en/analizler' },
        { label: 'Our Story', href: '/en/hikaye' },
        { label: 'Saitabat Village', href: '/en/saitabat-koyu' },
        { label: 'Our Scientific Approach', href: '/en/bilim-yaklasimimiz' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { label: 'Order & Shipment Tracking', href: '/en/siparis-takibi' },
        { label: 'Shipping Policy', href: '/en/kargo-teslimat' },
        { label: 'Returns & Exchanges', href: '/iade-degisim' },
        { label: 'FAQ', href: '/en/sikca-sorulanlar' },
        { label: 'Contact', href: '/en/iletisim' },
      ],
    },
    {
      title: 'Editorial Notes',
      body: 'Subscribe for harvest bulletins and limited-batch announcements. For general questions, write to hello@drsenol.shop.',
    },
  ],
  footerNewsletter: { placeholder: 'Your email address', submitLabel: 'Subscribe' },
  // Hukuki/sözleşme sayfaları yalnızca TR — bilinçli olarak /en prefix'siz
  // (bkz. AGENTS.md karar: EN kullanıcı TR metni görür, çeviri yok).
  legalLinks: [
    { label: 'KVKK Disclosure (TR)', href: '/kvkk-aydinlatma' },
    { label: 'Privacy Policy (TR)', href: '/gizlilik-politikasi' },
    { label: 'Cookie Policy (TR)', href: '/cerez-politikasi' },
    { label: 'Returns & Exchanges (TR)', href: '/iade-degisim' },
    { label: 'Shipment Tracking (TR)', href: '/siparis-takibi' },
    { label: 'Shipping Policy (TR)', href: '/kargo-teslimat' },
    { label: 'Distance Sales Agreement (TR)', href: '/mesafeli-satis-sozlesmesi' },
    { label: 'Pre-Information Form (TR)', href: '/on-bilgilendirme-formu' },
  ],
  contactEmails: [
    { label: 'General', address: 'hello@drsenol.shop' },
    { label: 'Support', address: 'destek@drsenol.shop' },
    { label: 'Orders', address: 'siparis@drsenol.shop' },
  ],
  copyright: '© 1985–2026 Dr. Şenol Natural Honey. Saitabat, Bursa, Türkiye.',
  instagramHandle: { label: '@drsenol.shop', href: 'https://instagram.com/drsenol.shop' },
  currency: { enabled: false, primary: 'TRY (₺)', secondary: 'EUR (€)' },
  tagline: 'Quiet Luxury & Pure Nature',
}

export const enProductLabels: ProductLabels = {
  addToCart: 'Add to Cart',
  addedToCart: 'Added to Cart ✓',
  outOfStock: 'Sold Out',
  variantPricePlaceholder: 'Varies by option',
  variantHeading: 'Weight / Size',
  variantNote: 'Limited Batch',
  variantSelected: 'Selected',
  variantAvailable: 'Available',
  emptyTitle: 'No products match these filters.',
  emptyHint: 'Clear the filters and try again.',
}
