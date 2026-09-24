// ═══════════════════════════════════════════════════════════════
// Telegram Bot API — yeni sipariş bildirimi + komut yanıtları
// ─ Server-only. TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID env'de.
// ─ Env yoksa sessiz başarısızlık (no-op) — bildirim olmazsa
//   sipariş akışı kırılmasın.
// ═══════════════════════════════════════════════════════════════

import type { Order, OrderItem } from '@/types'
import { formatPrice } from '@/types'

import type { OrderStatus, PaymentMethod } from '@/types'
import { getSiteUrl } from '@/lib/site-url'

interface TelegramSendResult {
  ok: boolean
  description?: string
  messageId?: number
}

export interface InlineButton {
  text: string
  callback_data?: string
  url?: string
}

export type InlineKeyboard = InlineButton[][]

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) return null
  return { token, chatId }
}

export function isTelegramConfigured(): boolean {
  return getConfig() !== null
}

/**
 * TELEGRAM_CHAT_ID + TELEGRAM_ADMIN_IDS'i birleştirip tekilleştirir.
 * Bildirim/duyuru gönderilecek tüm yetkili chat ID'lerini döner.
 */
export function getBroadcastChatIds(): string[] {
  const ids = new Set<string>()
  const primary = process.env.TELEGRAM_CHAT_ID?.trim()
  if (primary) ids.add(primary)
  const extra = process.env.TELEGRAM_ADMIN_IDS?.trim()
  if (extra) {
    extra.split(',').forEach((s) => {
      const v = s.trim()
      if (v) ids.add(v)
    })
  }
  return Array.from(ids)
}

/**
 * Aynı mesajı tüm yetkili chat ID'lere paralel gönderir.
 * Bir alıcıda hata olsa diğerleri devam eder (allSettled).
 */
export async function broadcastTelegramMessage(
  text: string,
  opts: { parseMode?: 'Markdown' | 'HTML'; replyMarkup?: { inline_keyboard: InlineKeyboard } } = {}
): Promise<{ ok: boolean; sent: number; failed: number }> {
  const ids = getBroadcastChatIds()
  if (ids.length === 0) {
    console.warn('[telegram broadcast] hiç chat ID yapılandırılmamış')
    return { ok: false, sent: 0, failed: 0 }
  }

  const results = await Promise.allSettled(
    ids.map((chatId) => sendTelegramMessage(text, { ...opts, chatId }))
  )

  let sent = 0
  let failed = 0
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.ok) sent++
    else failed++
  }

  return { ok: sent > 0, sent, failed }
}

/** Düşük seviye sendMessage — Markdown V2 safe escape ile */
export async function sendTelegramMessage(
  text: string,
  opts: { chatId?: string; parseMode?: 'Markdown' | 'HTML'; replyMarkup?: { inline_keyboard: InlineKeyboard } } = {}
): Promise<TelegramSendResult> {
  const cfg = getConfig()
  if (!cfg) {
    console.warn('[telegram] config eksik, mesaj atılmadı')
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN/CHAT_ID eksik' }
  }

  const chatId = opts.chatId ?? cfg.chatId

  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: opts.parseMode ?? 'HTML',
        disable_web_page_preview: true,
        ...(opts.replyMarkup ? { reply_markup: opts.replyMarkup } : {}),
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      console.error('[telegram] gönderim hatası:', data)
      return { ok: false, description: data?.description ?? 'Telegram API hatası' }
    }
    return { ok: true, messageId: data?.result?.message_id }
  } catch (err) {
    console.error('[telegram] network hatası:', err)
    return { ok: false, description: 'Ağ hatası' }
  }
}

/** HTML escape — Telegram parse_mode=HTML için */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const ORDER_STATUS_TR: Record<OrderStatus, string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
  refunded: 'İade',
}

const PAYMENT_METHOD_TR: Record<PaymentMethod, string> = {
  bank_transfer: 'Havale',
  paytr: 'Kart',
  iyzico: 'Kart',
  stripe: 'Kart',
  cash_on_delivery: 'Kapıda ödeme',
}

const PAYMENT_STATUS_TR: Record<string, string> = {
  pending: 'Bekliyor',
  authorized: 'Onay bekliyor',
  captured: 'Alındı',
  failed: 'Başarısız',
  refunded: 'İade',
}

export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return ORDER_STATUS_TR[status as OrderStatus] ?? status
}

export function paymentMethodLabel(method: string | null | undefined): string {
  if (!method) return '—'
  return PAYMENT_METHOD_TR[method as PaymentMethod] ?? method
}

export function paymentStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return PAYMENT_STATUS_TR[status] ?? status
}

export function orderAdminUrl(orderNumber: string): string {
  return `${getSiteUrl()}/admin/siparisler/${encodeURIComponent(orderNumber)}`
}

/** Sipariş mesajının altına kapanabilir iş butonları */
export function orderActionKeyboard(order: Pick<Order, 'id' | 'order_number' | 'status' | 'payment_method' | 'payment_status'>): InlineKeyboard {
  const rows: InlineKeyboard = []
  const canConfirm =
    order.payment_method === 'bank_transfer' &&
    order.payment_status !== 'captured' &&
    order.status === 'pending'
  if (canConfirm) {
    rows.push([{ text: 'Ödemeyi onayla', callback_data: `ord:pay:${order.id}` }])
  }
  if (order.status === 'paid' || order.status === 'preparing') {
    rows.push([{ text: 'Kargoya ver', callback_data: `ord:ship:${order.id}` }])
  }
  rows.push([{ text: 'Panelde aç', url: orderAdminUrl(order.order_number) }])
  return rows
}

/** Yeni sipariş bildirimi — telefon ve e-posta yok; /durum ile açılır */
export async function notifyNewOrder(order: Order, items: OrderItem[]): Promise<void> {
  if (!isTelegramConfigured()) return

  const lines: string[] = []
  lines.push(`<b>🐝 Yeni sipariş — ${escapeHtml(order.order_number)}</b>`)
  lines.push('')
  lines.push(`<b>Müşteri:</b> ${escapeHtml(order.customer_name)}`)
  lines.push('')
  lines.push('<b>Ürünler:</b>')
  for (const it of items) {
    const variant = it.variant_label ? ` (${it.variant_label})` : ''
    lines.push(`• ${escapeHtml(it.product_name)}${escapeHtml(variant)} × ${it.quantity} — ${formatPrice(Number(it.subtotal))}`)
  }
  lines.push('')
  lines.push(`<b>Toplam:</b> ${formatPrice(Number(order.total_amount))}`)
  lines.push(`<b>Ödeme:</b> ${escapeHtml(paymentMethodLabel(order.payment_method))}`)
  lines.push(`<b>Durum:</b> ${escapeHtml(orderStatusLabel(order.status))}`)

  await broadcastTelegramMessage(lines.join('\n'), {
    replyMarkup: { inline_keyboard: orderActionKeyboard(order) },
  })
}

export async function answerCallbackQuery(callbackId: string, text?: string): Promise<void> {
  const cfg = getConfig()
  if (!cfg) return
  try {
    await fetch(`https://api.telegram.org/bot${cfg.token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: Boolean(text) }),
    })
  } catch (err) {
    console.error('[telegram] callback yanıtı atılamadı:', err)
  }
}

export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboard }
): Promise<void> {
  const cfg = getConfig()
  if (!cfg) return
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      console.error('[telegram] mesaj düzenleme hatası:', data)
    }
  } catch (err) {
    console.error('[telegram] mesaj düzenleme ağı:', err)
  }
}
