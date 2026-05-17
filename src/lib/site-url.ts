// ═══════════════════════════════════════════════════════════════
// Site origin tek kaynak
// ─ NEXT_PUBLIC_SITE_URL env'inden okur, yoksa drsenolnaturalhoney.shop
// ─ Tüm metadataBase, sitemap, robots, JSON-LD, legal-info bunu kullanır
// ─ Domain değişirse sadece env değiştir
// ═══════════════════════════════════════════════════════════════

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://drsenolnaturalhoney.shop').replace(/\/$/, '')
}
