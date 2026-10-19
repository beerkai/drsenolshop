// ═══════════════════════════════════════════════════════════════
// Kargo politikası — tek kaynak
// ─ 2000 TL altı: sabit 250 TL
// ─ 2000 TL ve üzeri: ücretsiz
// ─ Eşik, kargo hariç ürün ara toplamıdır (KDV dahil)
// ═══════════════════════════════════════════════════════════════

export const SHIPPING_FLAT_FEE = 250
export const SHIPPING_FREE_THRESHOLD = 2000

/** Üst şerit. Eski “Ücretsiz Özel Teslimat” vaadinin yerini alır. */
export const HEADER_ANNOUNCEMENT_TR = '2000 TL ve üzeri siparişlerinizde ücretsiz kargo'
export const HEADER_ANNOUNCEMENT_EN = 'Free shipping on orders of 2,000 TL and above'

/** Tema kaydında duran eski şerit. Yeni metin bunu ezer. */
export const LEGACY_HEADER_ANNOUNCEMENT = "1985'ten beri Saitabat'ın flora zenginliğinden sofranıza"
export const LEGACY_HEADER_ACCENT = 'Ücretsiz Özel Teslimat'
