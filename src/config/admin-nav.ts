// ═══════════════════════════════════════════════════════════════
// Admin navigasyon — masaüstü, mobil çekmece ve alt sekme tek kaynak
// Günlük iş üstte. Site araçları /admin/site kapısından açılır.
// ═══════════════════════════════════════════════════════════════

export interface AdminNavItem {
  href: string
  label: string
  /** /admin için exact match */
  exact?: boolean
}

export interface AdminNavGroup {
  id: string
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'is',
    label: 'İşler',
    items: [
      { href: '/admin', label: 'Pano', exact: true },
      { href: '/admin/siparisler', label: 'Siparişler' },
      { href: '/admin/stok', label: 'Stok' },
      { href: '/admin/defter', label: 'Defter' },
      { href: '/admin/musteriler', label: 'Müşteriler' },
      { href: '/admin/gunluk', label: 'Günlük' },
    ],
  },
  {
    id: 'katalog',
    label: 'Katalog',
    items: [
      { href: '/admin/urunler', label: 'Ürünler' },
      { href: '/admin/kategoriler', label: 'Kategoriler' },
      { href: '/admin/vitrin', label: 'Vitrin sırası' },
    ],
  },
  {
    id: 'site',
    label: 'Site',
    items: [
      { href: '/admin/site', label: 'Site' },
      { href: '/admin/yorumlar', label: 'Yorumlar' },
      { href: '/admin/kuponlar', label: 'Kuponlar' },
    ],
  },
  {
    id: 'sistem',
    label: 'Sistem',
    items: [
      { href: '/admin/analitik', label: 'Analitik' },
      { href: '/admin/epostalar', label: 'E-postalar' },
      { href: '/admin/ayarlar', label: 'Ayarlar' },
    ],
  },
]

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

/** Eski iki liste — komut ve kısayol tüketicileri için düz görünüm */
export const ADMIN_NAV_PRIMARY: AdminNavItem[] = ADMIN_NAV_GROUPS[0].items
export const ADMIN_NAV_SECONDARY: AdminNavItem[] = ADMIN_NAV_GROUPS.slice(1).flatMap((group) => group.items)

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
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
