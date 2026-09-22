// ═══════════════════════════════════════════════════════════════
// Admin navigasyon — Sidebar, mobil drawer ve alt tab bar tek kaynak
// ═══════════════════════════════════════════════════════════════

export interface AdminNavItem {
  href: string
  label: string
  /** /admin için exact match */
  exact?: boolean
}

export const ADMIN_NAV_PRIMARY: AdminNavItem[] = [
  { href: '/admin', label: 'Pano', exact: true },
  { href: '/admin/siparisler', label: 'Siparişler' },
  { href: '/admin/urunler', label: 'Ürünler' },
  { href: '/admin/kategoriler', label: 'Kategoriler' },
  { href: '/admin/musteriler', label: 'Müşteriler' },
  { href: '/admin/analitik', label: 'Analitik' },
  { href: '/admin/stok', label: 'Stok' },
  { href: '/admin/gunluk', label: 'Günlük' },
  { href: '/admin/defter', label: 'Defter' },
]

export const ADMIN_NAV_SECONDARY: AdminNavItem[] = [
  { href: '/admin/analizler', label: 'Analizler' },
  { href: '/admin/tema', label: 'Tema' },
  { href: '/admin/seritler', label: 'Şeritler' },
  { href: '/admin/epostalar', label: 'E-postalar' },
  { href: '/admin/yorumlar', label: 'Yorumlar' },
  { href: '/admin/kuponlar', label: 'Kuponlar' },
  { href: '/admin/ayarlar', label: 'Ayarlar' },
]

/** Mobil alt tab bar — en sık kullanılan rotalar */
export const ADMIN_MOBILE_TAB_BAR = [
  { id: 'pano', href: '/admin', label: 'Pano', exact: true },
  { id: 'siparisler', href: '/admin/siparisler', label: 'Sipariş' },
  { id: 'defter', href: '/admin/defter', label: 'Defter' },
  { id: 'stok', href: '/admin/stok', label: 'Stok' },
  { id: 'menu', href: '', label: 'Menü', action: 'menu' as const },
] as const

export type AdminMobileTab = (typeof ADMIN_MOBILE_TAB_BAR)[number]

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact || item.href === '/admin') {
    return pathname === '/admin'
  }
  return pathname.startsWith(item.href)
}
