// ═══════════════════════════════════════════════════════════════
// Sipariş stok hareketleri — düşüm + iade (idempotent)
// ─ Yalnız sunucu tarafı. RLS bypass için service_role kullanılır.
// ─ Her sipariş için tek seferlik düşüm: orders.stock_decremented_at
//   damgalandıktan sonra ikinci çağrı no-op.
// ─ Restore yalnız düşüm yapılmış sipariş için çalışır; çağrı sonrası
//   stock_decremented_at NULL'lanır (tekrar düşüm imkanı bırakır).
// ─ Kupon konsumpsiyon idempotency: consumeCouponForOrder atomic
//   güncellemeyle yarış durumlarını çözer.
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import { incrementCouponUsage } from './coupons'
import type { Order, OrderItem } from '@/types'

const LOG_PREFIX = '[stock]'

// ─── Atomic stamp helpers — yarış-güvenli geçişler ──────────────

/**
 * stock_decremented_at NULL ise NOW() yap; aksi halde no-op.
 * @returns Bu çağrı stamp'i set ettiyse true.
 */
async function tryClaimDecrement(orderId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .update({ stock_decremented_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('stock_decremented_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error(`${LOG_PREFIX} claim decrement hata:`, error.message)
    return false
  }
  return Boolean(data)
}

/**
 * stock_decremented_at NOT NULL ise NULL'la; aksi halde no-op.
 * @returns Bu çağrı NULL'ladıysa true.
 */
async function tryClaimRestore(orderId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .update({ stock_decremented_at: null })
    .eq('id', orderId)
    .not('stock_decremented_at', 'is', null)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error(`${LOG_PREFIX} claim restore hata:`, error.message)
    return false
  }
  return Boolean(data)
}

// ─── Düşük seviye: per-item stok hareketi ───────────────────────

async function applyDelta(
  items: OrderItem[],
  direction: 'decrement' | 'increment'
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const variantRpc = direction === 'decrement' ? 'decrement_variant_stock' : 'increment_variant_stock'
  const productRpc = direction === 'decrement' ? 'decrement_product_stock' : 'increment_product_stock'

  for (const item of items) {
    if (item.variant_id) {
      const { error } = await supabase.rpc(variantRpc, {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
      if (error) {
        console.error(`${LOG_PREFIX} ${direction} variant ${item.variant_id}:`, error.message)
      }
    } else if (item.product_id) {
      const { error } = await supabase.rpc(productRpc, {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
      if (error) {
        console.error(`${LOG_PREFIX} ${direction} product ${item.product_id}:`, error.message)
      }
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────

export interface StockMutationResult {
  applied: boolean   // bu çağrı stok hareketi yaptıysa true (idempotent guard)
}

/**
 * Sipariş kalemleri için stoğu düşür. Aynı sipariş için ikinci çağrı no-op.
 */
export async function decrementOrderStock(
  order: Pick<Order, 'id' | 'stock_decremented_at'>,
  items: OrderItem[]
): Promise<StockMutationResult> {
  // Halihazırda düşüm yapılmışsa atla (cache'lenmiş satıra göre erken çık)
  if (order.stock_decremented_at) return { applied: false }

  const claimed = await tryClaimDecrement(order.id)
  if (!claimed) return { applied: false }

  await applyDelta(items, 'decrement')
  return { applied: true }
}

/**
 * Sipariş kalemleri için stoğu geri ekle. Düşüm yapılmamış siparişte no-op.
 */
export async function restoreOrderStock(
  order: Pick<Order, 'id' | 'stock_decremented_at'>,
  items: OrderItem[]
): Promise<StockMutationResult> {
  if (!order.stock_decremented_at) return { applied: false }

  const claimed = await tryClaimRestore(order.id)
  if (!claimed) return { applied: false }

  await applyDelta(items, 'increment')
  return { applied: true }
}

// ─── Kupon konsumpsiyonu (sipariş bazlı, yarış-güvenli) ─────────

/**
 * orders.coupon_code dolu ve coupon_consumed_at NULL ise atomic olarak
 * stamp'le; kuponun used_count'unu bir kez artır. İkinci çağrı no-op.
 *
 * Hem PayTR success'i hem admin paid PATCH'i bunu çağırabilir — yarış
 * durumunda yalnızca biri kazanır.
 */
export async function consumeCouponForOrder(orderId: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .update({ coupon_consumed_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('coupon_consumed_at', null)
    .not('coupon_code', 'is', null)
    .select('coupon_code')
    .maybeSingle()

  if (error) {
    console.error(`${LOG_PREFIX} consume coupon hata:`, error.message)
    return
  }
  const code = (data as { coupon_code?: string } | null)?.coupon_code
  if (!code) return

  await incrementCouponUsage(code).catch((err) => {
    console.error(`${LOG_PREFIX} kupon sayacı artırılamadı:`, err)
  })
}
