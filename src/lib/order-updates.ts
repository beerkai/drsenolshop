// ═══════════════════════════════════════════════════════════════
// Sipariş alan güncellemesi — admin paneli ve Telegram ortak
// ─ status, payment_status, tracking_number
// ─ stok ve kupon geçişleri idempotent
// ─ durum maili after() ile, fonksiyon erken kesilse de gider
// ═══════════════════════════════════════════════════════════════

import { after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import { decrementOrderStock, restoreOrderStock, consumeCouponForOrder } from '@/lib/stock'
import type { Order, OrderItem, OrderStatus } from '@/types'

export type PaymentStatusEnum = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

export interface OrderPatch {
  status?: OrderStatus
  payment_status?: PaymentStatusEnum
  tracking_number?: string | null
  notes?: string | null
}

const VALID_STATUS: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded']
const VALID_PAYMENT_STATUS: PaymentStatusEnum[] = ['pending', 'authorized', 'captured', 'failed', 'refunded']
const STOCK_DOWN_STATUSES: ReadonlyArray<OrderStatus> = ['paid', 'preparing', 'shipped', 'delivered']
const STOCK_RESTORE_STATUSES: ReadonlyArray<OrderStatus> = ['cancelled', 'refunded']
const MAIL_STATUSES: ReadonlyArray<OrderStatus> = ['paid', 'preparing', 'shipped', 'delivered', 'cancelled']

export type ApplyOrderPatchResult =
  | { ok: true; order: Order }
  | { ok: false; message: string }

export async function applyOrderPatch(orderId: string, body: OrderPatch): Promise<ApplyOrderPatchResult> {
  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) return { ok: false, message: 'Geçersiz durum.' }
    updates.status = body.status
    if (body.status === 'shipped') updates.shipped_at = new Date().toISOString()
    if (body.status === 'delivered') updates.delivered_at = new Date().toISOString()
    if (body.status === 'cancelled') updates.cancelled_at = new Date().toISOString()
  }

  if (body.payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUS.includes(body.payment_status)) return { ok: false, message: 'Geçersiz ödeme durumu.' }
    updates.payment_status = body.payment_status
    if (body.payment_status === 'captured') updates.paid_at = new Date().toISOString()
  }

  if (body.tracking_number !== undefined) {
    updates.tracking_number = body.tracking_number?.trim() || null
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes?.trim() || null
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, message: 'Güncellenecek alan yok.' }
  }

  const supabase = getSupabaseAdmin()
  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .maybeSingle()

  if (error || !data) {
    console.error('[applyOrderPatch] hata:', error?.message)
    return { ok: false, message: 'Güncelleme başarısız.' }
  }

  const order = data as Order
  const items = (itemRows ?? []) as OrderItem[]
  const wantsRestore = STOCK_RESTORE_STATUSES.includes(order.status)
  const wantsDecrement =
    !wantsRestore &&
    (order.payment_status === 'captured' || STOCK_DOWN_STATUSES.includes(order.status))

  if (wantsDecrement) {
    await decrementOrderStock(order, items)
    await consumeCouponForOrder(order.id)
  }
  if (wantsRestore) {
    await restoreOrderStock(order, items)
  }

  if (body.status !== undefined && MAIL_STATUSES.includes(body.status)) {
    const status = body.status
    after(async () => {
      try {
        const mail = await sendOrderStatusUpdate({
          order,
          newStatus: status,
          trackingNumber: order.tracking_number,
        })
        if (!mail.ok && mail.error !== 'not_configured' && mail.error !== 'no_template') {
          console.error('[applyOrderPatch] status mail hatası:', mail.error)
        }
      } catch (err) {
        console.error('[applyOrderPatch] mail gönderim hatası:', err)
      }
    })
  }

  return { ok: true, order }
}
