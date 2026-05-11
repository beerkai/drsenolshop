// ═══════════════════════════════════════════════════════════════
// Sepet toplam hesaplamaları
// ─ Fiyatlar KDV DAHİL varsayılır (Türkiye e-ticaret standardı)
// ─ tax_rate ürün başına (gıda %1, kozmetik %20 vs.)
// ═══════════════════════════════════════════════════════════════

export interface CheckoutLine {
  productId: string
  variantId: string | null
  name: string
  slug: string
  image: string | null
  variantLabel: string | null
  unitPrice: number      // KDV dahil, TL
  taxRate: number        // yüzde, ör. 1 veya 20
  quantity: number
}

export interface CartTotals {
  subtotal: number       // KDV dahil ürün toplamı
  taxAmount: number      // ürünlerin içindeki toplam KDV
  shippingCost: number   // şimdilik her zaman 0
  discountAmount: number // ileride kupon için
  total: number          // ödenecek tutar
}

const FREE_SHIPPING = 0

/** Bir satırın net + KDV bileşeni (KDV dahil fiyattan ayrıştırma) */
export function computeLineTax(unitPrice: number, taxRate: number, quantity: number) {
  const lineGross = unitPrice * quantity
  const lineTax = taxRate > 0
    ? lineGross * taxRate / (100 + taxRate)
    : 0
  return { lineGross, lineTax }
}

export function calculateTotals(
  items: CheckoutLine[],
  opts: { shippingCost?: number; discountAmount?: number } = {}
): CartTotals {
  let subtotal = 0
  let taxAmount = 0

  for (const item of items) {
    const { lineGross, lineTax } = computeLineTax(item.unitPrice, item.taxRate, item.quantity)
    subtotal += lineGross
    taxAmount += lineTax
  }

  const shippingCost = opts.shippingCost ?? FREE_SHIPPING
  const discountAmount = opts.discountAmount ?? 0
  const total = Math.max(0, subtotal + shippingCost - discountAmount)

  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    shippingCost: round2(shippingCost),
    discountAmount: round2(discountAmount),
    total: round2(total),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
