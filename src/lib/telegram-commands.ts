// ═══════════════════════════════════════════════════════════════
// Telegram Bot komut işleyicileri
// ─ Webhook'a gelen update'lerde komut → handler eşleştirir
// ─ Yetki: TELEGRAM_CHAT_ID veya TELEGRAM_ADMIN_IDS (virgüllü liste)
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import { formatPrice } from '@/types'
import { escapeHtml, sendTelegramMessage } from './telegram'

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name?: string
  username?: string
}

interface TelegramChat {
  id: number
  type: string
}

export interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: TelegramUser
    chat: TelegramChat
    date: number
    text?: string
  }
}

/** Yetkili chat ID listesi — env'den okur */
function getAuthorizedChatIds(): Set<string> {
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
  return ids
}

function isAuthorized(chatId: number): boolean {
  return getAuthorizedChatIds().has(String(chatId))
}

/** Update'i işle, gerekirse yanıt at */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const msg = update.message
  if (!msg || !msg.text) return

  const chatId = msg.chat.id
  if (!isAuthorized(chatId)) {
    await sendTelegramMessage(
      '⛔ Bu komutu kullanma yetkin yok.',
      { chatId: String(chatId) }
    )
    return
  }

  const text = msg.text.trim()
  // Komutu ayrıştır: "/yeni" veya "/durum DS-2026-0001"
  const [cmdRaw, ...args] = text.split(/\s+/)
  // /command@botname formatını da destekle
  const cmd = cmdRaw.split('@')[0].toLowerCase()

  try {
    switch (cmd) {
      case '/start':
      case '/yardim':
      case '/help':
        await handleHelp(chatId)
        break
      case '/yeni':
        await handleYeni(chatId)
        break
      case '/durum':
        await handleDurum(chatId, args[0])
        break
      case '/stok':
        await handleStok(chatId, args.join(' '))
        break
      case '/ozet':
        await handleOzet(chatId)
        break
      default:
        if (cmd.startsWith('/')) {
          await sendTelegramMessage(
            `Bilinmeyen komut: <code>${escapeHtml(cmd)}</code>\n/yardim ile listele.`,
            { chatId: String(chatId) }
          )
        }
    }
  } catch (err) {
    console.error('[telegram] komut hatası:', err)
    await sendTelegramMessage(
      '❌ Komut işlenirken bir hata oluştu.',
      { chatId: String(chatId) }
    )
  }
}

// ─── /yardim ──────────────────────────────────────────────────
async function handleHelp(chatId: number) {
  const text = [
    '<b>🐝 Dr. Şenol Bot — Komutlar</b>',
    '',
    '<b>/yeni</b>           Bugünün son 5 siparişi',
    '<b>/durum DS-XXXX</b>  Belirli siparişin detayı',
    '<b>/stok SLUG</b>      Ürün stok durumu (slug veya isim)',
    '<b>/ozet</b>           Bugünkü ciro ve sipariş özeti',
    '<b>/yardim</b>         Bu mesaj',
  ].join('\n')
  await sendTelegramMessage(text, { chatId: String(chatId) })
}

// ─── /yeni ──────────────────────────────────────────────────
async function handleYeni(chatId: number) {
  const supabase = getSupabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, customer_name, total_amount, status, created_at')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (!orders || orders.length === 0) {
    await sendTelegramMessage('Bugün henüz sipariş yok.', { chatId: String(chatId) })
    return
  }

  const lines = ['<b>📋 Bugünün son siparişleri</b>', '']
  for (const o of orders) {
    const time = new Date(o.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    lines.push(`<b>${escapeHtml(o.order_number)}</b> · ${time}`)
    lines.push(`${escapeHtml(o.customer_name)} — ${formatPrice(Number(o.total_amount))} · <i>${escapeHtml(o.status)}</i>`)
    lines.push('')
  }
  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}

// ─── /durum DS-XXXX ──────────────────────────────────────────
async function handleDurum(chatId: number, orderNumber?: string) {
  if (!orderNumber) {
    await sendTelegramMessage('Kullanım: <code>/durum DS-2026-0001</code>', { chatId: String(chatId) })
    return
  }

  const supabase = getSupabaseAdmin()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber.trim().toUpperCase())
    .maybeSingle()

  if (!order) {
    await sendTelegramMessage(`Sipariş bulunamadı: <code>${escapeHtml(orderNumber)}</code>`, { chatId: String(chatId) })
    return
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, variant_label, quantity, subtotal')
    .eq('order_id', order.id)

  const lines: string[] = []
  lines.push(`<b>📦 ${escapeHtml(order.order_number)}</b>`)
  lines.push(`Durum: <i>${escapeHtml(order.status)}</i> · Ödeme: <i>${escapeHtml(order.payment_status)}</i>`)
  lines.push('')
  lines.push(`<b>Müşteri:</b> ${escapeHtml(order.customer_name)}`)
  lines.push(`<b>E-mail:</b> ${escapeHtml(order.customer_email)}`)
  if (order.customer_phone) lines.push(`<b>Telefon:</b> ${escapeHtml(order.customer_phone)}`)
  lines.push('')
  if (items && items.length > 0) {
    lines.push('<b>Ürünler:</b>')
    for (const it of items) {
      const v = it.variant_label ? ` (${it.variant_label})` : ''
      lines.push(`• ${escapeHtml(it.product_name)}${escapeHtml(v)} × ${it.quantity} — ${formatPrice(Number(it.subtotal))}`)
    }
    lines.push('')
  }
  lines.push(`<b>Toplam:</b> ${formatPrice(Number(order.total_amount))}`)
  if (order.tracking_number) lines.push(`<b>Kargo:</b> <code>${escapeHtml(order.tracking_number)}</code>`)

  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}

// ─── /stok SLUG_VEYA_ISIM ────────────────────────────────────
async function handleStok(chatId: number, query?: string) {
  if (!query?.trim()) {
    await sendTelegramMessage('Kullanım: <code>/stok kestane-bali</code> veya <code>/stok kestane</code>', { chatId: String(chatId) })
    return
  }

  const supabase = getSupabaseAdmin()
  // Slug tam eşleşme ya da isim ilike
  const { data: products } = await supabase
    .from('products')
    .select(`
      slug, name, stock_quantity,
      variants:product_variants(label, variant_value, stock_quantity, is_active)
    `)
    .or(`slug.eq.${query.trim()},name.ilike.%${query.trim()}%`)
    .limit(5)

  if (!products || products.length === 0) {
    await sendTelegramMessage(`Ürün bulunamadı: <code>${escapeHtml(query)}</code>`, { chatId: String(chatId) })
    return
  }

  const lines: string[] = []
  for (const p of products) {
    lines.push(`<b>${escapeHtml(p.name)}</b>`)
    const variants = (p.variants ?? []) as Array<{ label: string | null; variant_value: string | null; stock_quantity: number | null; is_active: boolean | null }>
    if (variants.length === 0) {
      const q = p.stock_quantity ?? 0
      const emoji = q === 0 ? '❌' : q <= 5 ? '⚠️' : '✅'
      lines.push(`${emoji} Stok: <b>${q}</b>`)
    } else {
      for (const v of variants) {
        if (v.is_active === false) continue
        const label = v.label ?? v.variant_value ?? '—'
        const q = v.stock_quantity ?? 0
        const emoji = q === 0 ? '❌' : q <= 5 ? '⚠️' : '✅'
        lines.push(`${emoji} ${escapeHtml(label)}: <b>${q}</b>`)
      }
    }
    lines.push('')
  }
  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}

// ─── /ozet ─────────────────────────────────────────────────────
async function handleOzet(chatId: number) {
  const supabase = getSupabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status, payment_status')
    .gte('created_at', todayStart.toISOString())

  const total = orders?.length ?? 0
  const cancelled = (orders ?? []).filter((o) => o.status === 'cancelled' || o.status === 'refunded').length
  const pending = (orders ?? []).filter((o) => o.status === 'pending').length
  const revenue = (orders ?? [])
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0)

  const lines = [
    '<b>📊 Bugünün Özeti</b>',
    '',
    `<b>Toplam sipariş:</b> ${total}`,
    `<b>Bekleyen:</b> ${pending}`,
    `<b>İptal/iade:</b> ${cancelled}`,
    `<b>Ciro:</b> ${formatPrice(revenue)}`,
  ]
  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}
