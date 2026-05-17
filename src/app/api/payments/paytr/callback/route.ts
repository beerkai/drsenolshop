// ═══════════════════════════════════════════════════════════════
// POST /api/payments/paytr/callback — PayTR asenkron bildirim
// ─ PayTR sunucusundan form-encoded POST gelir
// ─ Hash doğrulanır, başarılıysa order.payment_status='captured', status='paid'
// ─ Yanıt mutlaka "OK" plain text olmalı; aksi halde PayTR tekrar gönderir
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { verifyPaytrCallback, isPaytrConfigured } from '@/lib/paytr'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'
import { formatPrice } from '@/types'
import type { Order } from '@/types'

function plain(body: string, status = 200) {
  return new NextResponse(body, { status, headers: { 'Content-Type': 'text/plain' } })
}

export async function POST(request: Request) {
  if (!isPaytrConfigured()) {
    return plain('OK', 200) // sessizce kabul et — env yoksa kayıt zaten yok
  }

  // PayTR application/x-www-form-urlencoded gönderir
  const text = await request.text()
  const params = new URLSearchParams(text)
  const form: Record<string, string> = {}
  params.forEach((v, k) => { form[k] = v })

  // Hash doğrula
  if (!verifyPaytrCallback(form)) {
    console.error('[paytr/callback] hash doğrulanamadı', { merchant_oid: form.merchant_oid })
    return plain('PAYTR notification failed: bad hash', 200)
  }

  const merchantOid = form.merchant_oid
  const status = form.status              // 'success' | 'failed'
  const totalAmount = form.total_amount   // kuruş cinsinden string
  const failReasonCode = form.failed_reason_code
  const failReasonMsg = form.failed_reason_msg

  if (!merchantOid) return plain('OK', 200)

  const supabase = getSupabaseAdmin()

  // merchant_oid → order_number (alphanumeric stripping). Bizde "DS20260001"
  // gibi olabilir; orijinal order_number "DS-2026-0001". Hem strip hem aslıyla
  // ara — esnek olalım.
  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .or(`order_number.eq.${merchantOid},payment_ref.eq.${merchantOid}`)
    .maybeSingle()

  // İlk arama başarısız olduysa: order_number'dan '-' temizleyip eşleştir
  let order: Order | null = (orderRow as Order | null) ?? null
  if (!order) {
    // Manuel scan — küçük ölçek için kabul edilebilir
    const { data: candidates } = await supabase
      .from('orders')
      .select('*')
      .like('order_number', 'DS-%')
      .order('created_at', { ascending: false })
      .limit(200)
    const found = (candidates ?? []).find(
      (o: Order) => o.order_number.replace(/[^a-zA-Z0-9]/g, '') === merchantOid
    )
    if (found) order = found as Order
  }

  if (!order) {
    console.error('[paytr/callback] sipariş bulunamadı', { merchantOid })
    return plain('OK', 200)
  }

  // Idempotency — zaten paid ise tekrar işlem yapma
  if (order.payment_status === 'captured' && status === 'success') {
    return plain('OK', 200)
  }

  if (status === 'success') {
    const { data: updated } = await supabase
      .from('orders')
      .update({
        payment_status: 'captured',
        status: 'paid',
        payment_ref: merchantOid,
      })
      .eq('id', order.id)
      .select()
      .maybeSingle()

    const next = (updated as Order | null) ?? order
    // Bildirimler (fire-and-forget) — admin'in haberi olsun
    if (isTelegramConfigured()) {
      sendTelegramMessage(
        `<b>💳 PayTR · Ödeme alındı</b>\n` +
        `Sipariş: <code>${escapeHtml(next.order_number)}</code>\n` +
        `Tutar: <b>${escapeHtml(formatPrice(next.total_amount))}</b>\n` +
        `Müşteri: ${escapeHtml(next.customer_name)} · ${escapeHtml(next.customer_email)}`
      ).catch(() => {})
    }
    ;(async () => {
      try {
        await sendOrderStatusUpdate({ order: next, newStatus: 'paid', trackingNumber: null })
      } catch (err) {
        console.error('[paytr/callback] paid mail hatası:', err)
      }
    })()
  } else {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        notes: [order.notes, `PayTR fail: ${failReasonCode} ${failReasonMsg}`].filter(Boolean).join(' · '),
      })
      .eq('id', order.id)
    console.warn('[paytr/callback] payment failed', { merchantOid, code: failReasonCode, msg: failReasonMsg, total: totalAmount })
  }

  return plain('OK', 200)
}
