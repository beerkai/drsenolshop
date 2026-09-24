// ═══════════════════════════════════════════════════════════════
// Telegram'dan kapanan işler: havale onayı, kargo, yorum
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import { applyOrderPatch } from './order-updates'
import { updateAdminReview } from './reviews-admin'
import { formatPrice } from '@/types'
import {
  answerCallbackQuery,
  escapeHtml,
  orderActionKeyboard,
  orderAdminUrl,
  orderStatusLabel,
  paymentMethodLabel,
  sendTelegramMessage,
} from './telegram'
import { clearSession, setSession } from './telegram-state'
import { getSiteUrl } from './site-url'

const UUID = /^[0-9a-f-]{36}$/i
const SHIP_TTL_MS = 10 * 60 * 1000

export async function handleOpsCallback(data: string, chatId: number, userId: string, callbackId: string): Promise<boolean> {
  const id = String(chatId)

  if (data.startsWith('ord:pay:')) {
    await confirmPayment(id, data.slice('ord:pay:'.length))
    await answerCallbackQuery(callbackId, 'Ödeme işlendi')
    return true
  }
  if (data.startsWith('ord:ship:')) {
    const orderId = data.slice('ord:ship:'.length)
    if (!UUID.test(orderId)) {
      await answerCallbackQuery(callbackId, 'Geçersiz sipariş')
      return true
    }
    const ok = await setSession(id, userId, 'ship', { orderId }, SHIP_TTL_MS)
    await answerCallbackQuery(callbackId)
    await sendTelegramMessage(
      ok
        ? 'Takip numarasını yazın. Vazgeçmek için <code>iptal</code>.'
        : 'Kargo adımı kaydedilemedi. 0026 migration gerekli.',
      { chatId: id }
    )
    return true
  }
  if (data.startsWith('rev:ok:')) {
    await moderateReview(id, data.slice('rev:ok:'.length), true)
    await answerCallbackQuery(callbackId, 'Yorum onaylandı')
    return true
  }
  if (data.startsWith('rev:no:')) {
    const reviewId = data.slice('rev:no:'.length)
    await answerCallbackQuery(callbackId)
    await sendTelegramMessage('Yorum silinsin mi? Bu geri alınamaz.', {
      chatId: id,
      replyMarkup: {
        inline_keyboard: [[
          { text: 'Sil', callback_data: `rev:del:${reviewId}` },
          { text: 'Vazgeç', callback_data: 'rev:keep' },
        ]],
      },
    })
    return true
  }
  if (data.startsWith('rev:del:')) {
    await deleteReview(id, data.slice('rev:del:'.length))
    await answerCallbackQuery(callbackId, 'Yorum silindi')
    return true
  }
  if (data === 'rev:keep') {
    await answerCallbackQuery(callbackId, 'Yorum duruyor')
    await sendTelegramMessage('Yorum beklemeye devam ediyor.', { chatId: id })
    return true
  }
  return false
}

export async function continueShipPrompt(chatId: number, userId: string, text: string, orderId: string): Promise<void> {
  const id = String(chatId)
  const raw = text.trim()
  if (raw.toLocaleLowerCase('tr-TR') === 'iptal') {
    await clearSession(id, userId, 'ship')
    await sendTelegramMessage('Kargo adımı iptal edildi.', { chatId: id })
    return
  }
  if (raw.startsWith('/') || raw.length > 64) {
    await sendTelegramMessage('Takip numarası bu mesaja sığmalı. Örnek: <code>1234567890</code>', { chatId: id })
    return
  }
  const result = await applyOrderPatch(orderId, { status: 'shipped', tracking_number: raw })
  await clearSession(id, userId, 'ship')
  if (!result.ok) {
    await sendTelegramMessage(escapeHtml(result.message), { chatId: id })
    return
  }
  await sendTelegramMessage(
    [
      `<b>Kargoya verildi — ${escapeHtml(result.order.order_number)}</b>`,
      `Takip: <code>${escapeHtml(raw)}</code>`,
      `<a href="${orderAdminUrl(result.order.order_number)}">Panelde aç</a>`,
    ].join('\n'),
    { chatId: id }
  )
}

async function confirmPayment(chatId: string, orderId: string) {
  if (!UUID.test(orderId)) {
    await sendTelegramMessage('Geçersiz sipariş.', { chatId })
    return
  }
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('orders').select('id, order_number, status, payment_status, payment_method, total_amount, customer_name').eq('id', orderId).maybeSingle()
  if (!data) {
    await sendTelegramMessage('Sipariş bulunamadı.', { chatId })
    return
  }
  if (data.payment_status === 'captured' || data.status === 'paid') {
    await sendTelegramMessage(`<b>${escapeHtml(data.order_number)}</b> zaten ödendi.`, {
      chatId,
      replyMarkup: { inline_keyboard: orderActionKeyboard(data) },
    })
    return
  }
  const result = await applyOrderPatch(orderId, { status: 'paid', payment_status: 'captured' })
  if (!result.ok) {
    await sendTelegramMessage(escapeHtml(result.message), { chatId })
    return
  }
  await sendTelegramMessage(
    [
      `<b>Ödeme onaylandı — ${escapeHtml(result.order.order_number)}</b>`,
      `${escapeHtml(result.order.customer_name)} · ${formatPrice(Number(result.order.total_amount))}`,
      `${escapeHtml(paymentMethodLabel(result.order.payment_method))} · ${escapeHtml(orderStatusLabel(result.order.status))}`,
    ].join('\n'),
    { chatId, replyMarkup: { inline_keyboard: orderActionKeyboard(result.order) } }
  )
}

async function moderateReview(chatId: string, reviewId: string, approved: boolean) {
  if (!UUID.test(reviewId)) {
    await sendTelegramMessage('Geçersiz yorum.', { chatId })
    return
  }
  const result = await updateAdminReview(reviewId, { is_approved: approved })
  await sendTelegramMessage(result.ok ? 'Yorum onaylandı.' : escapeHtml(result.message), { chatId })
}

async function deleteReview(chatId: string, reviewId: string) {
  if (!UUID.test(reviewId)) {
    await sendTelegramMessage('Geçersiz yorum.', { chatId })
    return
  }
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId)
  await sendTelegramMessage(error ? 'Yorum silinemedi.' : 'Yorum silindi.', { chatId })
}

export function reviewNotice(input: { id: string; rating: number; customerName: string; title: string | null }): { text: string; keyboard: { inline_keyboard: { text: string; callback_data?: string; url?: string }[][] } } {
  const stars = '★'.repeat(input.rating) + '☆'.repeat(Math.max(0, 5 - input.rating))
  const text = [
    '<b>Yeni yorum — moderasyon bekliyor</b>',
    `Puan: ${stars}`,
    `Müşteri: ${escapeHtml(input.customerName)}`,
    `Başlık: ${escapeHtml(input.title ?? '—')}`,
  ].join('\n')
  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: 'Onayla', callback_data: `rev:ok:${input.id}` },
          { text: 'Reddet', callback_data: `rev:no:${input.id}` },
        ],
        [{ text: 'Panelde aç', url: `${getSiteUrl()}/admin/yorumlar` }],
      ],
    },
  }
}
