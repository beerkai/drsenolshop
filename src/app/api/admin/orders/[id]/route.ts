// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/orders/[id] — sipariş alanları güncelleme
// ─ Admin yetkisi zorunlu (middleware + endpoint kontrolü)
// ─ status, payment_status, tracking_number güncellenir
// ─ status='shipped' set edilirse shipped_at otomatik
// ─ Stok geçişleri (paid/captured → düşüm, cancelled/refunded → iade)
//   src/lib/stock.ts üzerinden idempotent yürütülür.
// ─ Kupon konsumpsiyonu: paid/captured geçişinde tek seferlik artırılır.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import { decrementOrderStock, restoreOrderStock, consumeCouponForOrder } from '@/lib/stock'
import type { Order, OrderItem } from '@/types'

type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatusEnum = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

interface PatchBody {
  status?: OrderStatus
  payment_status?: PaymentStatusEnum
  tracking_number?: string | null
  notes?: string | null
}

const VALID_STATUS: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded']
const VALID_PAYMENT_STATUS: PaymentStatusEnum[] = ['pending', 'authorized', 'captured', 'failed', 'refunded']

// Stoğun "düşük" olması beklenen durumlar
const STOCK_DOWN_STATUSES: ReadonlyArray<OrderStatus> = ['paid', 'preparing', 'shipped', 'delivered']
// Stoğun iade edilmesi gereken durumlar
const STOCK_RESTORE_STATUSES: ReadonlyArray<OrderStatus> = ['cancelled', 'refunded']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params

  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ ok: false, message: 'Geçersiz status' }, { status: 400 })
    }
    updates.status = body.status
    // Otomatik zaman damgaları
    if (body.status === 'shipped')   updates.shipped_at   = new Date().toISOString()
    if (body.status === 'delivered') updates.delivered_at = new Date().toISOString()
    if (body.status === 'cancelled') updates.cancelled_at = new Date().toISOString()
  }

  if (body.payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUS.includes(body.payment_status)) {
      return NextResponse.json({ ok: false, message: 'Geçersiz payment_status' }, { status: 400 })
    }
    updates.payment_status = body.payment_status
    // payment_status captured oldu ama paid_at boşsa şimdi damgala
    if (body.payment_status === 'captured') {
      updates.paid_at = new Date().toISOString()
    }
  }

  if (body.tracking_number !== undefined) {
    updates.tracking_number = body.tracking_number?.trim() || null
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes?.trim() || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: 'Güncellenecek alan yok' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Stok hareketi için kalemleri (snapshot) önceden çek
  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { ok: false, message: 'Güncelleme başarısız', details: error?.message },
      { status: 500 }
    )
  }

  const order = data as Order
  const items = (itemRows ?? []) as OrderItem[]

  // Stok geçişleri (idempotent; stock.ts kendi içinde state kontrolü yapar)
  const wantsRestore = STOCK_RESTORE_STATUSES.includes(order.status)
  const wantsDecrement =
    !wantsRestore &&
    (order.payment_status === 'captured' || STOCK_DOWN_STATUSES.includes(order.status))

  if (wantsDecrement) {
    await decrementOrderStock(order, items)
    // Ödeme tamamlandığında kupon sayacını tek seferlik artır
    await consumeCouponForOrder(order.id)
  }
  if (wantsRestore) {
    await restoreOrderStock(order, items)
  }

  // Status değiştiyse e-posta bildirimi (fire-and-forget)
  if (body.status !== undefined && ['paid', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(body.status)) {
    ;(async () => {
      try {
        const mail = await sendOrderStatusUpdate({
          order,
          newStatus: body.status as Order['status'],
          trackingNumber: order.tracking_number,
        })
        if (!mail.ok && mail.error !== 'not_configured' && mail.error !== 'no_template') {
          console.error('[api/admin/orders] status mail hatası:', mail.error)
        }
      } catch (err) {
        console.error('[api/admin/orders] mail gönderim hatası:', err)
      }
    })()
  }

  return NextResponse.json({ ok: true, order: data })
}
