// ═══════════════════════════════════════════════════════════════
// Telegram Bot komut işleyicileri
// ─ Webhook'a gelen update'lerde komut → handler eşleştirir
// ─ Yetki: TELEGRAM_CHAT_ID veya TELEGRAM_ADMIN_IDS (virgüllü liste)
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import { formatPrice } from '@/types'
import { escapeHtml, orderStatusLabel, paymentMethodLabel, paymentStatusLabel, sendTelegramMessage, answerCallbackQuery } from './telegram'
import {
  getLedgerSummary,
  getPlateHistory,
  listEmployees,
  listLedgerEntries,
  normalizePlate,
  isValidPlate,
} from './ledger'
import { formatTimeTR, istanbulDayStartIso, mondayOf, shiftDateKey, todayKeyTR } from './datetime'
import { canWrite, claimTelegramUpdate, getLatestSession, isAuthorizedChat } from './telegram-state'
import { continueSaleWizard, handleSaleCallback, saveSaleFromArgs } from './telegram-sale'
import { continueShipPrompt, handleOpsCallback } from './telegram-actions'

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
  callback_query?: {
    id: string
    from: TelegramUser
    data?: string
    message?: {
      message_id: number
      chat: TelegramChat
    }
  }
}

/** Update'i işle, gerekirse yanıt at */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const claimed = await claimTelegramUpdate(update.update_id)
  if (!claimed) return

  if (update.callback_query) {
    await handleCallback(update)
    return
  }

  const msg = update.message
  if (!msg || !msg.text) return

  const chatId = msg.chat.id
  if (!isAuthorizedChat(chatId)) {
    const name = msg.from?.first_name ?? 'arkadaş'
    await sendTelegramMessage(
      [
        `⛔ <b>Yetkin yok ${escapeHtml(name)}.</b>`,
        '',
        `<b>Senin chat ID'n:</b> <code>${chatId}</code>`,
        msg.from?.id != null ? `<b>Kullanıcı ID'n:</b> <code>${msg.from.id}</code>` : '',
        '',
        `Yetki almak için yöneticiye bu ID'leri gönder.`,
        `Sohbet: <code>TELEGRAM_ADMIN_IDS</code> · Yazma: <code>TELEGRAM_WRITER_IDS</code>`,
      ].join('\n'),
      { chatId: String(chatId) }
    )
    return
  }

  const text = msg.text.trim()
  const userId = String(msg.from?.id ?? chatId)
  const fromLabel = msg.from?.username ? `@${msg.from.username}` : msg.from?.first_name ?? 'telegram'

  if (!text.startsWith('/')) {
    const session = await getLatestSession(String(chatId), userId)
    if (session?.kind === 'ship' && session.payload && typeof session.payload === 'object' && 'orderId' in session.payload) {
      if (!canWrite({ chatId, chatType: msg.chat.type, userId: msg.from?.id })) {
        await denyWrite(chatId, msg.from?.id)
        return
      }
      await continueShipPrompt(chatId, userId, text, String((session.payload as { orderId: string }).orderId))
      return
    }
    if (session?.kind === 'sale') {
      if (!canWrite({ chatId, chatType: msg.chat.type, userId: msg.from?.id })) {
        await denyWrite(chatId, msg.from?.id)
        return
      }
      const consumed = await continueSaleWizard(chatId, userId, text)
      if (consumed) return
    }
  }

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

      // ─── DEFTER KOMUTLARI ──────────────────────────────────
      case '/defter':
      case '/bugun':
        await handleDefterBugun(chatId)
        break
      case '/hafta':
        await handleDefterHafta(chatId)
        break
      case '/satis':
      case '/rsatis':
        if (!canWrite({ chatId, chatType: msg.chat.type, userId: msg.from?.id })) {
          await denyWrite(chatId, msg.from?.id)
          break
        }
        await saveSaleFromArgs(chatId, userId, args, cmd === '/rsatis', fromLabel)
        break
      case '/araba':
      case '/plaka':
        await handleAraba(chatId, args[0])
        break
      case '/calisanlar':
        await handleCalisanlar(chatId)
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
    '<u>SİPARİŞLER (online)</u>',
    '<b>/yeni</b>           Bugünün son 5 siparişi',
    '<b>/durum DS-XXXX</b>  Belirli siparişin detayı',
    '<b>/stok SLUG</b>      Ürün stok durumu',
    '<b>/ozet</b>           Bugünkü ciro ve sipariş özeti',
    '',
    '<u>DEFTER (saha satışları)</u>',
    '<b>/defter</b> veya <b>/bugun</b>   Bugünkü defter kayıtları',
    '<b>/hafta</b>                       Bu hafta özeti',
    '<b>/satis</b>          Adım adım kayıt (veya tek satır)',
    '<b>/rsatis</b>         Rehberli kayıt, komisyon çalışanın oranı',
    'Tek satır: <code>/satis PLAKA TUTAR kart|nakit çalışan</code>',
    '<b>/araba PLAKA</b>    Plakanın ziyaret geçmişi',
    '<b>/calisanlar</b>     Aktif çalışan listesi',
    '<b>/yardim</b>         Bu mesaj',
  ].join('\n')
  await sendTelegramMessage(text, { chatId: String(chatId) })
}

// ─── /yeni ──────────────────────────────────────────────────
async function denyWrite(chatId: number, userId?: number) {
  await sendTelegramMessage(
    [
      '<b>Bu işlem için yazma yetkin yok.</b>',
      'Grupta satış, ödeme onayı ve kargo yalnızca <code>TELEGRAM_WRITER_IDS</code> listesindeki kişilerde.',
      userId != null ? `Kullanıcı ID: <code>${userId}</code>` : '',
    ].filter(Boolean).join('\n'),
    { chatId: String(chatId) }
  )
}

async function handleCallback(update: TelegramUpdate) {
  const cb = update.callback_query
  if (!cb?.message) return
  const chatId = cb.message.chat.id
  if (!isAuthorizedChat(chatId)) {
    await answerCallbackQuery(cb.id, 'Yetkin yok')
    return
  }
  if (!canWrite({ chatId, chatType: cb.message.chat.type, userId: cb.from.id })) {
    await answerCallbackQuery(cb.id, 'Yazma yetkin yok')
    await denyWrite(chatId, cb.from.id)
    return
  }
  const data = cb.data ?? ''
  const userId = String(cb.from.id)
  const fromLabel = cb.from.username ? `@${cb.from.username}` : cb.from.first_name ?? 'telegram'
  const sale = await handleSaleCallback(data, chatId, userId, fromLabel)
  if (sale) {
    await answerCallbackQuery(cb.id)
    return
  }
  const ops = await handleOpsCallback(data, chatId, userId, cb.id)
  if (!ops) await answerCallbackQuery(cb.id, 'Bilinmeyen işlem')
}

async function handleYeni(chatId: number) {
  const supabase = getSupabaseAdmin()

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, customer_name, total_amount, status, created_at')
    .gte('created_at', istanbulDayStartIso())
    .order('created_at', { ascending: false })
    .limit(5)

  if (!orders || orders.length === 0) {
    await sendTelegramMessage('Bugün henüz sipariş yok.', { chatId: String(chatId) })
    return
  }

  const lines = ['<b>📋 Bugünün son siparişleri</b>', '']
  for (const o of orders) {
    const time = formatTimeTR(o.created_at)
    lines.push(`<b>${escapeHtml(o.order_number)}</b> · ${time}`)
    lines.push(`${escapeHtml(o.customer_name)} — ${formatPrice(Number(o.total_amount))} · <i>${escapeHtml(orderStatusLabel(o.status))}</i>`)
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
  lines.push(`Durum: <i>${escapeHtml(orderStatusLabel(order.status))}</i> · Ödeme: <i>${escapeHtml(paymentStatusLabel(order.payment_status))}</i> · ${escapeHtml(paymentMethodLabel(order.payment_method))}`)
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
  const q = query.trim().replace(/[%_\\,]/g, '')
  const select = `
      slug, name, stock_quantity,
      variants:product_variants(label, variant_value, stock_quantity, is_active)
    `
  const [{ data: bySlug }, { data: byName }] = await Promise.all([
    supabase.from('products').select(select).eq('slug', q).limit(5),
    supabase.from('products').select(select).ilike('name', `%${q}%`).limit(5),
  ])
  const seen = new Set<string>()
  const products = [...(bySlug ?? []), ...(byName ?? [])].filter((p) => {
    if (seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  }).slice(0, 5)

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

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status, payment_status')
    .gte('created_at', istanbulDayStartIso())

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

// ═══════════════════════════════════════════════════════════════
// DEFTER KOMUTLARI
// ═══════════════════════════════════════════════════════════════

// ─── /defter , /bugun ─────────────────────────────────────────
async function handleDefterBugun(chatId: number) {
  const date = todayKeyTR()
  const [summary, listing] = await Promise.all([
    getLedgerSummary(date),
    listLedgerEntries({ date, limit: 12 }),
  ])

  const lines: string[] = []
  lines.push(`<b>📖 Defter — Bugün</b>`)
  lines.push('')
  lines.push(`<b>Kayıt:</b> ${summary.entryCount}`)
  lines.push(`<b>Toplam:</b> ${formatPrice(summary.totalSale)}`)
  if (summary.guideCommissionTotal > 0) {
    const net = summary.totalSale - summary.guideCommissionTotal
    lines.push(`<b>Net:</b> ${formatPrice(net)}  <i>(rehber −${formatPrice(summary.guideCommissionTotal)})</i>`)
  }
  lines.push(`<b>Kart:</b> ${formatPrice(summary.cardSale)}  ·  <b>Nakit:</b> ${formatPrice(summary.cashSale)}`)
  if (summary.unpaidCustomers > 0 || summary.unpaidGuides > 0) {
    lines.push(`<b>Ödenmemiş:</b> ${summary.unpaidCustomers}m / ${summary.unpaidGuides}r`)
  }

  if (listing.entries.length > 0) {
    lines.push('')
    lines.push(`<b>Son kayıtlar:</b>`)
    for (const e of listing.entries.slice(0, 8)) {
      const t = e.entry_time?.slice(0, 5) ?? ''
      const pay = e.payment_method === 'card' ? 'K' : 'N'
      const reh = e.has_guide ? ' · 👤' : ''
      lines.push(`<code>${t}</code> ${escapeHtml(e.plate)} ${pay} ${formatPrice(Number(e.sale_amount))}${reh}`)
    }
  }

  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}

// ─── /hafta ───────────────────────────────────────────────────
async function handleDefterHafta(chatId: number) {
  const today = todayKeyTR()
  const monday = mondayOf(today)
  const sunday = shiftDateKey(monday, 6)
  const supabase = getSupabaseAdmin()

  const { data } = await supabase
    .from('ledger_entries')
    .select('entry_date, payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
    .gte('entry_date', monday)
    .lte('entry_date', sunday)

  type Row = {
    entry_date: string
    payment_method: string
    sale_amount: number | string
    has_guide: boolean
    guide_commission: number | string | null
    customer_paid: boolean
    guide_paid: boolean
  }
  const rows = (data ?? []) as Row[]

  let entryCount = 0, total = 0, cash = 0, card = 0, guide = 0, unpaidC = 0, unpaidG = 0
  for (const r of rows) {
    entryCount++
    const a = Number(r.sale_amount ?? 0)
    total += a
    if (r.payment_method === 'cash') cash += a
    else if (r.payment_method === 'card') card += a
    if (r.has_guide && r.guide_commission != null) guide += Number(r.guide_commission)
    if (!r.customer_paid) unpaidC++
    if (r.has_guide && !r.guide_paid) unpaidG++
  }

  const TR_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  const byDay = new Map<string, { count: number; total: number }>()
  for (const r of rows) {
    const slot = byDay.get(r.entry_date) ?? { count: 0, total: 0 }
    slot.count++
    slot.total += Number(r.sale_amount ?? 0)
    byDay.set(r.entry_date, slot)
  }

  const lines: string[] = []
  lines.push(`<b>📅 Defter — Bu Hafta</b>`)
  lines.push(`<i>${monday.slice(8)} − ${sunday.slice(8)}</i>`)
  lines.push('')
  lines.push(`<b>Kayıt:</b> ${entryCount}`)
  lines.push(`<b>Toplam:</b> ${formatPrice(total)}`)
  if (guide > 0) {
    lines.push(`<b>Net:</b> ${formatPrice(total - guide)}  <i>(rehber −${formatPrice(guide)})</i>`)
  }
  lines.push(`<b>Kart:</b> ${formatPrice(card)}  ·  <b>Nakit:</b> ${formatPrice(cash)}`)
  if (unpaidC > 0 || unpaidG > 0) {
    lines.push(`<b>Ödenmemiş:</b> ${unpaidC}m / ${unpaidG}r`)
  }
  lines.push('')
  lines.push(`<b>Günlük:</b>`)
  for (let i = 0; i < 7; i++) {
    const d = shiftDateKey(monday, i)
    const slot = byDay.get(d)
    const dayName = TR_DAYS[i]
    if (slot && slot.count > 0) {
      lines.push(`${dayName} ${d.slice(8)} — ${slot.count} kayıt, ${formatPrice(slot.total)}`)
    } else {
      lines.push(`<i>${dayName} ${d.slice(8)} — boş</i>`)
    }
  }

  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}


// ─── /araba PLAKA ─────────────────────────────────────────────
async function handleAraba(chatId: number, plateRaw: string | undefined) {
  if (!plateRaw) {
    await sendTelegramMessage(`Kullanım: <code>/araba 34BRK1234</code>`, { chatId: String(chatId) })
    return
  }
  const plate = normalizePlate(plateRaw)
  if (!plate || !isValidPlate(plate)) {
    await sendTelegramMessage(`❌ Geçersiz plaka: <code>${escapeHtml(plateRaw)}</code>`, { chatId: String(chatId) })
    return
  }

  const entries = await getPlateHistory(plate, 12)
  if (entries.length === 0) {
    await sendTelegramMessage(`<b>${escapeHtml(plate)}</b> için kayıt bulunamadı.`, { chatId: String(chatId) })
    return
  }

  const total = entries.reduce((s, e) => s + Number(e.sale_amount ?? 0), 0)
  const lines: string[] = []
  lines.push(`<b>🚗 ${escapeHtml(plate)}</b>`)
  lines.push(`<b>Ziyaret:</b> ${entries.length} · <b>Toplam:</b> ${formatPrice(total)}`)
  lines.push('')

  for (const e of entries.slice(0, 10)) {
    const pay = e.payment_method === 'card' ? 'K' : 'N'
    const dateLabel = `${e.entry_date.slice(8)}/${e.entry_date.slice(5, 7)}`
    const reh = e.has_guide ? ' 👤' : ''
    lines.push(`<code>${dateLabel}</code> ${pay} ${formatPrice(Number(e.sale_amount))}${reh}`)
  }

  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}

// ─── /calisanlar ──────────────────────────────────────────────
async function handleCalisanlar(chatId: number) {
  const emps = await listEmployees({ activeOnly: true })
  if (emps.length === 0) {
    await sendTelegramMessage(`Henüz aktif çalışan kayıtlı değil.`, { chatId: String(chatId) })
    return
  }

  const lines: string[] = []
  lines.push(`<b>👥 Aktif Çalışanlar</b>`)
  lines.push('')
  for (const e of emps) {
    lines.push(`• ${escapeHtml(e.name)}${e.role ? ` <i>(${escapeHtml(e.role)})</i>` : ''}`)
  }
  await sendTelegramMessage(lines.join('\n'), { chatId: String(chatId) })
}
