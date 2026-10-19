// ═══════════════════════════════════════════════════════════════
// Site origin tek kaynak
// ─ NEXT_PUBLIC_SITE_URL env'inden okur, yoksa https://drsenol.shop (canonical)
// ─ Eski alan adları (ör. drsenolnaturalhoney.shop) kullanılmaz; Vercel redirect ile yönlendirilir
// ─ Tüm metadataBase, sitemap, robots, JSON-LD, legal-info bunu kullanır
// ─ Domain değişirse sadece env değiştir
// ═══════════════════════════════════════════════════════════════

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://drsenol.shop').replace(/\/$/, '')
}

const DEFAULT_ADMIN_ORIGIN = 'https://lab.drsenol.shop'

/**
 * Yönetim paneli origin'i. Mağaza (drsenol.shop) /admin isteğini ana sayfaya
 * çevirir; panel yalnız ADMIN_HOSTS'taki host'ta açılır. Telegram "Panelde aç"
 * bu adresi kullanır. ADMIN_HOSTS virgüllüyse ilk host esas alınır.
 */
export function getAdminUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || process.env.ADMIN_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const firstHost = process.env.ADMIN_HOSTS
    ?.split(',')
    .map((host) => host.trim())
    .find(Boolean)

  if (!firstHost) return DEFAULT_ADMIN_ORIGIN
  if (firstHost.startsWith('http://') || firstHost.startsWith('https://')) {
    return firstHost.replace(/\/$/, '')
  }
  return `https://${firstHost}`
}
