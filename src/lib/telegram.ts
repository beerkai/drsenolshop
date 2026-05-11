// ═══════════════════════════════════════════════════════════════
// Telegram Bot API — yeni sipariş bildirimi + komut yanıtları
// ─ Server-only. TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID env'de.
// ─ Env yoksa sessiz başarısızlık (no-op) — bildirim olmazsa
//   sipariş akışı kırılmasın.
// ═══════════════════════════════════════════════════════════════

import type { Order, OrderItem } from '@/types'
import { formatPrice } from '@/types'

interface TelegramSendResult {
  ok: boolean
  description?: string
}

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) return null
  return { token, chatId }
}

export function isTelegramConfigured(): boolean {
  return getConfig() !== null
}

/** Düşük seviye sendMessage — Markdown V2 safe escape ile */
export async function sendTelegramMessage(
  text: string,
  opts: { chatId?: string; parseMode?: 'Markdown' | 'HTML' } = {}
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
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      console.error('[telegram] gönderim hatası:', data)
      return { ok: false, description: data?.description ?? 'Telegram API hatası' }
    }
    return { ok: true }
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

/** Yeni sipariş bildirimi */
export async function notifyNewOrder(order: Order, items: OrderItem[]): Promise<void> {
  if (!isTelegramConfigured()) return

  const lines: string[] = []
  lines.push(`<b>🐝 Yeni sipariş — ${escapeHtml(order.order_number)}</b>`)
  lines.push(``)
  lines.push(`<b>Müşteri:</b> ${escapeHtml(order.customer_name)}`)
  lines.push(`<b>E-mail:</b> ${escapeHtml(order.customer_email)}`)
  if (order.customer_phone) lines.push(`<b>Telefon:</b> ${escapeHtml(order.customer_phone)}`)
  lines.push(``)
  lines.push(`<b>Ürünler:</b>`)
  for (const it of items) {
    const variant = it.variant_label ? ` (${it.variant_label})` : ''
    lines.push(`• ${escapeHtml(it.product_name)}${escapeHtml(variant)} × ${it.quantity} — ${formatPrice(Number(it.subtotal))}`)
  }
  lines.push(``)
  lines.push(`<b>Ara toplam:</b> ${formatPrice(Number(order.subtotal))}`)
  lines.push(`<b>KDV:</b> ${formatPrice(Number(order.tax_amount ?? 0))}`)
  lines.push(`<b>Kargo:</b> ${Number(order.shipping_cost ?? 0) > 0 ? formatPrice(Number(order.shipping_cost)) : 'Ücretsiz'}`)
  lines.push(`<b>Toplam:</b> ${formatPrice(Number(order.total_amount))}`)
  lines.push(``)
  lines.push(`<b>Ödeme:</b> ${order.payment_method === 'bank_transfer' ? 'Havale / EFT' : escapeHtml(order.payment_method ?? '')}`)
  lines.push(`<b>Durum:</b> ${escapeHtml(order.status)}`)

  await sendTelegramMessage(lines.join('\n'))
}
