// ═══════════════════════════════════════════════════════════════
// POST /api/orders/[order_number]/cancel — müşteri siparişini iptal eder
// ─ Yalnız status='pending' siparişler iptal edilebilir
// ─ Logged-in müşteri kendi siparişini (email/user_id match) iptal eder
// ─ Misafir checkout için: order_number + email gönderilir (knowledge gating)
// ─ Telegram + e-posta bildirimi
// ─ Paid/preparing/shipped → admin manuel iptal etmeli (refund konusu)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'
import { formatPrice, type Order } from '@/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ order_number: string }> }
) {
  const { order_number } = await params
  let body: { email?: string }
  try {
    body = await request.json().catch(() => ({}))
  } catch {
    body = {}
  }

  const admin = getSupabaseAdmin()
  const { data: orderRow } = await admin
    .from('orders')
    .select('*')
    .eq('order_number', order_number)
    .maybeSingle()

  if (!orderRow) {
    return NextResponse.json({ ok: false, message: 'Sipariş bulunamadı.' }, { status: 404 })
  }
  const order = orderRow as Order

  // Yetki kontrolü — şu üçünden biri doğru olmalı:
  //   a) Logged-in user'ın email'i = sipariş email'i
  //   b) Logged-in user'ın id'si = order.user_id
  //   c) İstekte body.email gönderilmiş ve sipariş email'iyle eşleşiyor (misafir)
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const reqEmail = body.email?.trim().toLowerCase()
  const orderEmail = order.customer_email.toLowerCase()
  const authorized =
    (user && user.email && user.email.toLowerCase() === orderEmail) ||
    (user && order.user_id && user.id === order.user_id) ||
    (reqEmail && reqEmail === orderEmail)

  if (!authorized) {
    return NextResponse.json({ ok: false, message: 'Bu işlem için yetkiniz yok.' }, { status: 403 })
  }

  // Yalnız pending iptal edilebilir
  if (order.status !== 'pending') {
    return NextResponse.json(
      {
        ok: false,
        message:
          order.status === 'cancelled'
            ? 'Bu sipariş zaten iptal edilmiş.'
            : 'Bu sipariş artık iptal edilemez. Lütfen bizimle iletişime geçin.',
      },
      { status: 409 }
    )
  }

  const { data: updated, error } = await admin
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      notes: [order.notes, '[Müşteri tarafından iptal edildi]'].filter(Boolean).join(' · '),
    })
    .eq('id', order.id)
    .select()
    .maybeSingle()

  if (error || !updated) {
    return NextResponse.json(
      { ok: false, message: 'İptal işlemi başarısız.', details: error?.message },
      { status: 500 }
    )
  }

  const next = updated as Order

  // Bildirimler (fire-and-forget)
  if (isTelegramConfigured()) {
    sendTelegramMessage(
      `<b>❌ Sipariş iptal edildi</b>\n` +
      `Sipariş: <code>${escapeHtml(next.order_number)}</code>\n` +
      `Tutar: ${escapeHtml(formatPrice(next.total_amount))}\n` +
      `Müşteri: ${escapeHtml(next.customer_name)} · ${escapeHtml(next.customer_email)}\n` +
      `<i>Müşteri tarafından iptal</i>`
    ).catch(() => {})
  }

  ;(async () => {
    try {
      await sendOrderStatusUpdate({ order: next, newStatus: 'cancelled', trackingNumber: null })
    } catch (err) {
      console.error('[orders/cancel] mail hatası:', err)
    }
  })()

  return NextResponse.json({ ok: true })
}
