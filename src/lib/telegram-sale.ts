// ═══════════════════════════════════════════════════════════════
// Defter satış sihirbazı — adım adım veya tek satır
// ─ Belirsiz çalışan seçtirilir, yakın mükerrer kayıt sorulur
// ─ Kayıt 2 dakika geri alınabilir
// ─ Rehber komisyonu çalışanın oranından
// ═══════════════════════════════════════════════════════════════

import { formatPrice } from '@/types'
import {
  createLedgerEntry,
  deleteLedgerEntry,
  guideCommissionRate,
  isValidPlate,
  listEmployees,
  normalizePlate,
  type Employee,
} from './ledger'
import { getSupabaseAdmin } from './supabase'
import { escapeHtml, sendTelegramMessage, type InlineKeyboard } from './telegram'
import { clearSession, getSession, setSession } from './telegram-state'

const SALE_TTL_MS = 15 * 60 * 1000
const UNDO_MS = 2 * 60 * 1000
const DUP_MS = 10 * 60 * 1000

export interface SaleDraft {
  step: 'plate' | 'amount' | 'payment' | 'employee' | 'guide' | 'confirm' | 'duplicate'
  plate?: string
  amount?: number
  payment_method?: 'cash' | 'card'
  employee_id?: string | null
  employee_name?: string | null
  has_guide?: boolean
  force_guide?: boolean
  candidates?: Array<{ id: string; name: string }>
}

function chat(chatId: number | string) {
  return String(chatId)
}

export async function beginSaleWizard(chatId: number, userId: string, forceGuide: boolean): Promise<void> {
  const draft: SaleDraft = { step: 'plate', force_guide: forceGuide, has_guide: forceGuide }
  const ok = await setSession(chat(chatId), userId, 'sale', draft, SALE_TTL_MS)
  if (!ok) {
    await sendTelegramMessage(
      'Satış adımı kaydedilemedi. Veritabanında <code>telegram_sessions</code> tablosu yoksa 0026 migration çalıştırın.',
      { chatId: chat(chatId) }
    )
    return
  }
  await sendTelegramMessage(
    [
      forceGuide ? '<b>Rehberli satış</b>' : '<b>Satış kaydı</b>',
      'Plakayı yazın.',
      '<i>Örnek: 34BRK1234 veya MERCAN-KADIR</i>',
      'Vazgeçmek için <code>iptal</code>',
    ].join('\n'),
    { chatId: chat(chatId) }
  )
}

export async function continueSaleWizard(chatId: number, userId: string, text: string): Promise<boolean> {
  const session = await getSession<SaleDraft>(chat(chatId), userId, 'sale')
  if (!session) return false
  const raw = text.trim()
  if (raw.toLocaleLowerCase('tr-TR') === 'iptal') {
    await clearSession(chat(chatId), userId, 'sale')
    await sendTelegramMessage('Satış kaydı iptal edildi.', { chatId: chat(chatId) })
    return true
  }

  const draft = session.payload
  if (draft.step === 'plate') {
    const plate = normalizePlate(raw)
    if (!plate || !isValidPlate(plate)) {
      await sendTelegramMessage(`Geçersiz plaka: <code>${escapeHtml(raw)}</code>`, { chatId: chat(chatId) })
      return true
    }
    draft.plate = plate
    draft.step = 'amount'
    await setSession(chat(chatId), userId, 'sale', draft, SALE_TTL_MS)
    await sendTelegramMessage(`<b>${escapeHtml(plate)}</b>\nTutarı yazın. Örnek: <code>2500</code>`, { chatId: chat(chatId) })
    return true
  }

  if (draft.step === 'amount') {
    const amount = parseAmount(raw)
    if (amount == null) {
      await sendTelegramMessage(`Geçersiz tutar: <code>${escapeHtml(raw)}</code>`, { chatId: chat(chatId) })
      return true
    }
    draft.amount = amount
    draft.step = 'payment'
    await setSession(chat(chatId), userId, 'sale', draft, SALE_TTL_MS)
    await sendTelegramMessage(`${formatPrice(amount)} — ödeme yöntemi?`, {
      chatId: chat(chatId),
      replyMarkup: { inline_keyboard: [[{ text: 'Kart', callback_data: 'sale:pay:card' }, { text: 'Nakit', callback_data: 'sale:pay:cash' }]] },
    })
    return true
  }

  await sendTelegramMessage('Alttaki butonlardan birini seçin, ya da <code>iptal</code> yazın.', { chatId: chat(chatId) })
  return true
}

export async function handleSaleCallback(
  data: string,
  chatId: number,
  userId: string,
  fromLabel: string
): Promise<boolean> {
  if (!data.startsWith('sale:') && !data.startsWith('led:undo:')) return false
  const id = chat(chatId)

  if (data.startsWith('led:undo:')) {
    await undoEntry(id, data.slice('led:undo:'.length))
    return true
  }

  const session = await getSession<SaleDraft>(id, userId, 'sale')
  if (!session) {
    await sendTelegramMessage('Bu satış adımının süresi doldu. /satis ile yeniden başlayın.', { chatId: id })
    return true
  }
  const draft = session.payload

  if (data === 'sale:cancel') {
    await clearSession(id, userId, 'sale')
    await sendTelegramMessage('Satış kaydı iptal edildi.', { chatId: id })
    return true
  }

  if (data === 'sale:pay:card' || data === 'sale:pay:cash') {
    draft.payment_method = data.endsWith('card') ? 'card' : 'cash'
    draft.step = 'employee'
    await setSession(id, userId, 'sale', draft, SALE_TTL_MS)
    await askEmployee(id, userId, draft)
    return true
  }

  if (data.startsWith('sale:emp:')) {
    const picked = data.slice('sale:emp:'.length)
    if (picked === 'none') {
      draft.employee_id = null
      draft.employee_name = null
    } else {
      const emps = await listEmployees({ activeOnly: true })
      const emp = emps.find((e) => e.id === picked)
      if (!emp) {
        await sendTelegramMessage('Çalışan bulunamadı. Tekrar seçin.', { chatId: id })
        return true
      }
      draft.employee_id = emp.id
      draft.employee_name = emp.name
    }
    await afterEmployee(id, userId, draft)
    return true
  }

  if (data === 'sale:guide:1' || data === 'sale:guide:0') {
    draft.has_guide = data.endsWith('1')
    draft.step = 'confirm'
    await setSession(id, userId, 'sale', draft, SALE_TTL_MS)
    await showConfirm(id, userId, draft)
    return true
  }

  if (data === 'sale:dup:no') {
    await clearSession(id, userId, 'sale')
    await sendTelegramMessage('Kayıt eklenmedi.', { chatId: id })
    return true
  }

  if (data === 'sale:dup:yes' || data === 'sale:save') {
    await commitDraft(id, userId, draft, fromLabel)
    return true
  }

  return false
}

/** Tek satır: /satis PLAKA TUTAR kart|nakit [çalışan] */
export async function saveSaleFromArgs(
  chatId: number,
  userId: string,
  args: string[],
  withGuide: boolean,
  fromLabel: string
): Promise<void> {
  const id = chat(chatId)
  if (args.length < 3) {
    await beginSaleWizard(chatId, userId, withGuide)
    return
  }

  const plate = normalizePlate(args[0])
  if (!plate || !isValidPlate(plate)) {
    await sendTelegramMessage(`Geçersiz plaka: <code>${escapeHtml(args[0])}</code>`, { chatId: id })
    return
  }
  const amount = parseAmount(args[1])
  if (amount == null) {
    await sendTelegramMessage(`Geçersiz tutar: <code>${escapeHtml(args[1])}</code>`, { chatId: id })
    return
  }
  const odeme = args[2].toLocaleLowerCase('tr-TR')
  if (!['kart', 'nakit', 'card', 'cash'].includes(odeme)) {
    await sendTelegramMessage('Ödeme yöntemi <code>kart</code> veya <code>nakit</code> olmalı.', { chatId: id })
    return
  }

  const draft: SaleDraft = {
    step: 'confirm',
    plate,
    amount,
    payment_method: odeme === 'kart' || odeme === 'card' ? 'card' : 'cash',
    force_guide: withGuide,
    has_guide: withGuide,
  }

  const name = args.slice(3).join(' ').trim()
  if (name) {
    const emps = await listEmployees({ activeOnly: true })
    const matches = matchEmployees(name, emps)
    if (matches.length === 0) {
      await sendTelegramMessage(`Çalışan bulunamadı: <b>${escapeHtml(name)}</b>\n/calisanlar`, { chatId: id })
      return
    }
    if (matches.length > 1) {
      draft.step = 'employee'
      draft.candidates = matches.slice(0, 8).map((e) => ({ id: e.id, name: e.name }))
      await setSession(id, userId, 'sale', draft, SALE_TTL_MS)
      await askEmployee(id, userId, draft)
      return
    }
    draft.employee_id = matches[0].id
    draft.employee_name = matches[0].name
  }

  const dup = await findRecentDuplicate(plate, amount)
  if (dup) {
    draft.step = 'duplicate'
    await setSession(id, userId, 'sale', draft, SALE_TTL_MS)
    await askDuplicate(id, plate, amount)
    return
  }

  await commitDraft(id, userId, draft, fromLabel)
}

async function afterEmployee(chatId: string, userId: string, draft: SaleDraft) {
  if (draft.force_guide) {
    draft.has_guide = true
    draft.step = 'confirm'
    await setSession(chatId, userId, 'sale', draft, SALE_TTL_MS)
    await showConfirm(chatId, userId, draft)
    return
  }
  draft.step = 'guide'
  await setSession(chatId, userId, 'sale', draft, SALE_TTL_MS)
  await sendTelegramMessage('Rehber var mı?', {
    chatId,
    replyMarkup: {
      inline_keyboard: [[
        { text: 'Rehber var', callback_data: 'sale:guide:1' },
        { text: 'Rehber yok', callback_data: 'sale:guide:0' },
      ]],
    },
  })
}

async function askEmployee(chatId: string, userId: string, draft: SaleDraft) {
  const list = draft.candidates ?? (await listEmployees({ activeOnly: true })).slice(0, 8).map((e) => ({ id: e.id, name: e.name }))
  const rows: InlineKeyboard = list.map((e) => [{ text: e.name, callback_data: `sale:emp:${e.id}` }])
  rows.push([{ text: 'Çalışan yok', callback_data: 'sale:emp:none' }])
  await sendTelegramMessage('Çalışanı seçin.', { chatId, replyMarkup: { inline_keyboard: rows } })
  void userId
}

async function showConfirm(chatId: string, userId: string, draft: SaleDraft) {
  if (!draft.plate || draft.amount == null) return
  const dup = await findRecentDuplicate(draft.plate, draft.amount)
  if (dup) {
    draft.step = 'duplicate'
    await setSession(chatId, userId, 'sale', draft, SALE_TTL_MS)
    await askDuplicate(chatId, draft.plate, draft.amount)
    return
  }
  const rate = await rateFor(draft.employee_id)
  const lines = [
    '<b>Kayıt özeti</b>',
    `<b>Plaka:</b> <code>${escapeHtml(draft.plate)}</code>`,
    `<b>Tutar:</b> ${formatPrice(draft.amount)} (${draft.payment_method === 'card' ? 'Kart' : 'Nakit'})`,
  ]
  if (draft.employee_name) lines.push(`<b>Çalışan:</b> ${escapeHtml(draft.employee_name)}`)
  if (draft.has_guide) lines.push(`<b>Rehber:</b> ${formatPrice(draft.amount * rate)} (${Math.round(rate * 100)}%)`)
  await sendTelegramMessage(lines.join('\n'), {
    chatId,
    replyMarkup: {
      inline_keyboard: [[
        { text: 'Kaydet', callback_data: 'sale:save' },
        { text: 'Vazgeç', callback_data: 'sale:cancel' },
      ]],
    },
  })
}

async function askDuplicate(chatId: string, plate: string, amount: number) {
  await sendTelegramMessage(
    `Son 10 dakikada <b>${escapeHtml(plate)}</b> için ${formatPrice(amount)} zaten var. Yine de kaydedilsin mi?`,
    {
      chatId,
      replyMarkup: {
        inline_keyboard: [[
          { text: 'Yine de kaydet', callback_data: 'sale:dup:yes' },
          { text: 'Vazgeç', callback_data: 'sale:dup:no' },
        ]],
      },
    }
  )
}

async function commitDraft(chatId: string, userId: string, draft: SaleDraft, fromLabel: string) {
  if (!draft.plate || draft.amount == null || !draft.payment_method) {
    await sendTelegramMessage('Kayıt eksik. /satis ile yeniden başlayın.', { chatId })
    return
  }
  const rate = draft.has_guide ? await rateFor(draft.employee_id) : 0
  const result = await createLedgerEntry(
    {
      plate: draft.plate,
      sale_amount: draft.amount,
      payment_method: draft.payment_method,
      employee_id: draft.employee_id ?? null,
      has_guide: Boolean(draft.has_guide),
      guide_commission: draft.has_guide ? Math.round(draft.amount * rate * 100) / 100 : null,
      customer_paid: true,
      guide_paid: false,
    },
    `tg:${userId}:${fromLabel}`
  )
  await clearSession(chatId, userId, 'sale')
  if (!result.ok) {
    await sendTelegramMessage(`Kayıt başarısız: ${escapeHtml(result.message)}`, { chatId })
    return
  }
  const lines = [
    '<b>Defter kaydı eklendi</b>',
    `<b>Plaka:</b> <code>${escapeHtml(result.entry.plate)}</code>`,
    `<b>Tutar:</b> ${formatPrice(Number(result.entry.sale_amount))} (${result.entry.payment_method === 'card' ? 'Kart' : 'Nakit'})`,
  ]
  if (result.entry.employee_name) lines.push(`<b>Çalışan:</b> ${escapeHtml(result.entry.employee_name)}`)
  if (result.entry.has_guide && result.entry.guide_commission != null) {
    lines.push(`<b>Rehber:</b> ${formatPrice(Number(result.entry.guide_commission))}`)
  }
  lines.push('<i>2 dakika içinde geri alınabilir.</i>')
  await sendTelegramMessage(lines.join('\n'), {
    chatId,
    replyMarkup: { inline_keyboard: [[{ text: 'Geri al', callback_data: `led:undo:${result.entry.id}` }]] },
  })
}

async function undoEntry(chatId: string, entryId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(entryId)) {
    await sendTelegramMessage('Geçersiz kayıt.', { chatId })
    return
  }
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('ledger_entries').select('id, created_at, plate').eq('id', entryId).maybeSingle()
  if (!data) {
    await sendTelegramMessage('Kayıt bulunamadı.', { chatId })
    return
  }
  const age = Date.now() - new Date(data.created_at).getTime()
  if (age > UNDO_MS) {
    await sendTelegramMessage('Geri alma süresi doldu. Düzeltme admin panelden.', { chatId })
    return
  }
  const ok = await deleteLedgerEntry(entryId)
  await sendTelegramMessage(ok ? `<b>${escapeHtml(data.plate)}</b> kaydı geri alındı.` : 'Geri alınamadı.', { chatId })
}

async function findRecentDuplicate(plate: string, amount: number): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const since = new Date(Date.now() - DUP_MS).toISOString()
  const { count } = await supabase
    .from('ledger_entries')
    .select('id', { count: 'exact', head: true })
    .eq('plate', plate)
    .eq('sale_amount', amount)
    .gte('created_at', since)
  return (count ?? 0) > 0
}

async function rateFor(employeeId: string | null | undefined): Promise<number> {
  if (!employeeId) return 0.5
  const emps = await listEmployees({ activeOnly: false })
  return guideCommissionRate(emps.find((e) => e.id === employeeId))
}

function matchEmployees(name: string, emps: Employee[]): Employee[] {
  const lower = name.toLocaleLowerCase('tr-TR')
  const starts = emps.filter((e) => e.name.toLocaleLowerCase('tr-TR').startsWith(lower))
  if (starts.length > 0) return starts
  return emps.filter((e) => e.name.toLocaleLowerCase('tr-TR').includes(lower))
}

export function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/\s/g, '')
  if (!s) return null
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100) / 100
}
