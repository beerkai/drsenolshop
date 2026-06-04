// ═══════════════════════════════════════════════════════════════
// PayTR bildirim (callback) işleyicisi — sunucu tarafı
// ═══════════════════════════════════════════════════════════════

import { verifyPaytrCallback, isPaytrConfigured } from '@/lib/paytr'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusUpdate } from '@/lib/email'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'
import { formatPrice } from '@/types'
import type { Order, OrderItem } from '@/types'

function plain(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } })
}

async function decrementOrderStock(orderId: string, items: OrderItem[]) {
  const supabase = getSupabaseAdmin()
  for (const item of items) {
    if (item.variant_id) {
      const { error } = await supabase.rpc('decrement_variant_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
      if (error) {
        console.error('[paytr/callback] variant stok düşürülemedi:', item.variant_id, error.message)
      }
    } else if (item.product_id) {
      const { error } = await supabase.rpc('decrement_product_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
      if (error) {
        console.error('[paytr/callback] ürün stok düşürülemedi:', item.product_id, error.message)
      }
    }
  }
}

async function findOrderByMerchantOid(merchantOid: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  const supabase = getSupabaseAdmin()

  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .or(`order_number.eq.${merchantOid},payment_ref.eq.${merchantOid}`)
    .maybeSingle()

  let order: Order | null = (orderRow as Order | null) ?? null

  if (!order) {
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

  if (!order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  return { order, items: (items ?? []) as OrderItem[] }
}

/** PayTR form-urlencoded POST gövdesini işler; yanıt "OK" plain text olmalı */
export async function handlePaytrCallback(request: Request): Promise<Response> {
  if (!isPaytrConfigured()) {
    return plain('OK', 200)
  }

  const text = await request.text()
  const params = new URLSearchParams(text)
  const form: Record<string, string> = {}
  params.forEach((v, k) => { form[k] = v })

  if (!verifyPaytrCallback(form)) {
    console.error('[paytr/callback] hash doğrulanamadı', { merchant_oid: form.merchant_oid })
    return plain('PAYTR notification failed: bad hash', 400)
  }

  const merchantOid = form.merchant_oid
  const status = form.status
  const totalAmount = form.total_amount
  const failReasonCode = form.failed_reason_code
  const failReasonMsg = form.failed_reason_msg

  if (!merchantOid) return plain('OK', 200)

  const lookup = await findOrderByMerchantOid(merchantOid)
  if (!lookup) {
    console.error('[paytr/callback] sipariş bulunamadı', { merchantOid })
    return plain('OK', 200)
  }

  const { order, items } = lookup
  const supabase = getSupabaseAdmin()

  if (order.payment_status === 'captured' && status === 'success') {
    return plain('OK', 200)
  }

  if (status === 'success') {
    const paytrMeta = {
      total_amount: totalAmount,
      payment_amount: form.payment_amount,
      installment_count: form.installment_count,
      currency: form.currency,
    }

    const { data: updated } = await supabase
      .from('orders')
      .update({
        payment_status: 'captured',
        status: 'paid',
        payment_ref: merchantOid,
        paid_at: new Date().toISOString(),
        paytr_response: paytrMeta,
      })
      .eq('id', order.id)
      .select()
      .maybeSingle()

    const next = (updated as Order | null) ?? order

    await decrementOrderStock(order.id, items)

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
        paytr_response: {
          failed_reason_code: failReasonCode,
          failed_reason_msg: failReasonMsg,
          total_amount: totalAmount,
        },
        notes: [order.notes, `PayTR fail: ${failReasonCode} ${failReasonMsg}`].filter(Boolean).join(' · '),
      })
      .eq('id', order.id)
    console.warn('[paytr/callback] payment failed', { merchantOid, code: failReasonCode, msg: failReasonMsg })
  }

  return plain('OK', 200)
}
