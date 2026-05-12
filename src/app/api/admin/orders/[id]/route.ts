// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/orders/[id] — sipariş alanları güncelleme
// ─ Admin yetkisi zorunlu (middleware + endpoint kontrolü)
// ─ status, payment_status, tracking_number güncellenir
// ─ status='shipped' set edilirse shipped_at otomatik
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import type { Order } from '@/types'

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

  // Status değiştiyse e-posta bildirimi (fire-and-forget)
  if (body.status !== undefined && ['paid', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(body.status)) {
    const order = data as Order
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
