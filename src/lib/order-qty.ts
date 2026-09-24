/** Müşterinin tek kalemde seçebileceği üst adet. Stok daha düşükse stok kadar. */
export const MAX_CUSTOMER_ORDER_QTY = 150

export function customerOrderCap(stock: number): number {
  const available = Math.max(0, Math.floor(stock))
  return Math.min(available, MAX_CUSTOMER_ORDER_QTY)
}
