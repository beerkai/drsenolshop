// ═══════════════════════════════════════════════════════════════
// Defter (ledger) — sunucu DB helper'ları
// ─ Sadece sunucu tarafı, service_role
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'
import { todayKeyTR, nowTimeTR, daysBetween, dateKeyTR } from './datetime'

// ─── Tipler ─────────────────────────────────────────────────────
export interface Employee {
  id: string
  name: string
  role: string | null
  is_active: boolean
  display_order: number | null
  created_at: string
  updated_at: string | null
}

export interface LedgerEntry {
  id: string
  entry_date: string         // YYYY-MM-DD
  entry_time: string         // HH:MM:SS
  plate: string              // 34BED961
  employee_id: string | null
  employee_name: string | null
  payment_method: 'cash' | 'card'
  sale_amount: number
  has_guide: boolean
  guide_commission: number | null
  customer_paid: boolean
  guide_paid: boolean
  notes: string | null
  created_by_email: string | null
  created_at: string
  updated_at: string | null
}

export interface LedgerSummary {
  entryCount: number
  totalSale: number
  cashSale: number
  cardSale: number
  guideCommissionTotal: number
  unpaidCustomers: number
  unpaidGuides: number
}

// ─── Plaka / Etiket Normalize ───────────────────────────────────
// İki tip kabul edilir:
//   1) Geleneksel TR plakası: 34BRK1234 (2 rakam, 1-3 harf, 1-4 rakam)
//   2) Serbest etiket (tur şirketi-rehber): MERCAN-KADIR
//      → harf+rakam segmentleri tire ile bağlanır
// Boşluk + .,!? gibi özel karakterler atılır, sadece A-Z, 0-9, - kalır.
// Türkçe karakterler ASCII'ye: İ→I, Ş→S, Ğ→G, Ü→U, Ö→O, Ç→C
const PLATE_REGEX = /^(?:[0-9]{2}[A-Z]{1,3}[0-9]{1,4}|[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)$/

const TR_TO_ASCII: Record<string, string> = {
  'İ': 'I',
  'Ş': 'S',
  'Ğ': 'G',
  'Ü': 'U',
  'Ö': 'O',
  'Ç': 'C',
}

export function normalizePlate(raw: string): string {
  if (!raw) return ''
  let s = raw.toLocaleUpperCase('tr-TR')
  s = s.replace(/[İŞĞÜÖÇ]/g, (c) => TR_TO_ASCII[c] ?? c)
  // Sadece A-Z, 0-9, - kalsın
  s = s.replace(/[^A-Z0-9-]/g, '')
  // Çoklu tire → tek; başta/sonda tire kaldır
  s = s.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  return s
}

export function isValidPlate(plate: string): boolean {
  return PLATE_REGEX.test(plate)
}

// ─── Employees ──────────────────────────────────────────────────

export async function listEmployees(opts: { activeOnly?: boolean } = {}): Promise<Employee[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()
  let q = supabase
    .from('employees')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (opts.activeOnly !== false) q = q.eq('is_active', true)
  const { data } = await q
  return ((data ?? []) as Employee[])
}

export async function createEmployee(name: string, role: string | null = 'satış'): Promise<Employee | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const trimmed = name.trim()
  if (!trimmed) return null
  const { data } = await supabase
    .from('employees')
    .insert({ name: trimmed, role: role?.trim() || null, is_active: true })
    .select()
    .single()
  return (data as Employee) ?? null
}

export async function updateEmployee(id: string, patch: Partial<Pick<Employee, 'name' | 'role' | 'is_active' | 'display_order'>>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('employees').update(patch).eq('id', id)
  return !error
}

// ─── Ledger Entries ─────────────────────────────────────────────

export interface ListLedgerOptions {
  date?: string             // YYYY-MM-DD (verilmezse bugün)
  dateFrom?: string         // dateTo ile birlikte aralık
  dateTo?: string
  plate?: string            // tam veya prefix
  employeeId?: string
  paymentMethod?: 'cash' | 'card'
  unpaidCustomerOnly?: boolean
  unpaidGuideOnly?: boolean
  search?: string           // notes ICONTAINS
  limit?: number
  offset?: number
}

export async function listLedgerEntries(opts: ListLedgerOptions = {}): Promise<{ entries: LedgerEntry[]; total: number }> {
  if (!isSupabaseConfigured()) return { entries: [], total: 0 }
  const supabase = getSupabaseAdmin()
  const { limit = 200, offset = 0 } = opts

  // Count
  let countQuery = supabase.from('ledger_entries').select('id', { count: 'exact', head: true })
  countQuery = applyFilters(countQuery, opts) as typeof countQuery
  const { count } = await countQuery

  // Data
  let q = supabase.from('ledger_entries').select('*')
  q = applyFilters(q, opts) as typeof q
  // Eklenme sırasına göre (kronolojik): en eski üstte, en yeni en altta.
  // Defter mantığı — yeni kayıt en sona düşer.
  q = q.order('entry_date', { ascending: false })
       .order('entry_time', { ascending: true })
       .order('created_at', { ascending: true })
       .range(offset, offset + limit - 1)

  const { data } = await q
  return { entries: (data ?? []) as LedgerEntry[], total: count ?? 0 }
}

// PostgrestFilterBuilder generic'i karmaşık; runtime'da yeterince tip-güvenli.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(q: any, opts: ListLedgerOptions): any {
  if (opts.date) q = q.eq('entry_date', opts.date)
  if (opts.dateFrom) q = q.gte('entry_date', opts.dateFrom)
  if (opts.dateTo) q = q.lte('entry_date', opts.dateTo)
  if (opts.plate) {
    const p = normalizePlate(opts.plate)
    if (p.length >= 2) q = q.like('plate', `${p}%`)
  }
  if (opts.employeeId) q = q.eq('employee_id', opts.employeeId)
  if (opts.paymentMethod) q = q.eq('payment_method', opts.paymentMethod)
  if (opts.unpaidCustomerOnly) q = q.eq('customer_paid', false)
  if (opts.unpaidGuideOnly) q = q.eq('guide_paid', false).eq('has_guide', true)
  if (opts.search) q = q.ilike('notes', `%${opts.search}%`)
  return q
}

export async function getLedgerSummary(date: string): Promise<LedgerSummary> {
  if (!isSupabaseConfigured()) return emptySummary()
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('ledger_entries')
    .select('payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
    .eq('entry_date', date)

  return summarize((data ?? []) as Pick<LedgerEntry, 'payment_method' | 'sale_amount' | 'has_guide' | 'guide_commission' | 'customer_paid' | 'guide_paid'>[])
}

function summarize(rows: Pick<LedgerEntry, 'payment_method' | 'sale_amount' | 'has_guide' | 'guide_commission' | 'customer_paid' | 'guide_paid'>[]): LedgerSummary {
  const s = emptySummary()
  for (const r of rows) {
    s.entryCount++
    const amt = Number(r.sale_amount ?? 0)
    s.totalSale += amt
    if (r.payment_method === 'cash') s.cashSale += amt
    else if (r.payment_method === 'card') s.cardSale += amt
    if (r.has_guide && r.guide_commission != null) s.guideCommissionTotal += Number(r.guide_commission)
    if (!r.customer_paid) s.unpaidCustomers++
    if (r.has_guide && !r.guide_paid) s.unpaidGuides++
  }
  return s
}

function emptySummary(): LedgerSummary {
  return {
    entryCount: 0,
    totalSale: 0,
    cashSale: 0,
    cardSale: 0,
    guideCommissionTotal: 0,
    unpaidCustomers: 0,
    unpaidGuides: 0,
  }
}

// ─── Yeni kayıt ─────────────────────────────────────────────────
export interface CreateLedgerInput {
  entry_date?: string         // YYYY-MM-DD; default bugün
  entry_time?: string         // HH:MM; default şimdi
  plate: string               // ham (normalize edilecek)
  employee_id?: string | null
  payment_method: 'cash' | 'card'
  sale_amount: number
  has_guide?: boolean
  guide_commission?: number | null
  customer_paid?: boolean
  guide_paid?: boolean
  notes?: string | null
}

export type CreateLedgerResult =
  | { ok: true; entry: LedgerEntry }
  | { ok: false; code: 'INVALID_INPUT' | 'INVALID_PLATE' | 'DB_ERROR' | 'NO_CONFIG'; message: string; details?: unknown }

export async function createLedgerEntry(input: CreateLedgerInput, createdByEmail: string): Promise<CreateLedgerResult> {
  if (!isSupabaseConfigured()) return { ok: false, code: 'NO_CONFIG', message: 'Supabase yapılandırılmamış.' }

  const errors: string[] = []
  const plate = normalizePlate(input.plate ?? '')
  if (!plate) errors.push('Plaka gerekli.')
  else if (!isValidPlate(plate)) errors.push('Plaka/etiket formatı geçersiz. Örn: 34BRK1234 veya MERCAN-KADIR')

  const sale = Number(input.sale_amount)
  if (!Number.isFinite(sale) || sale < 0) errors.push('Satış miktarı geçersiz.')

  if (input.payment_method !== 'cash' && input.payment_method !== 'card') {
    errors.push('Ödeme yöntemi geçersiz.')
  }

  const hasGuide = Boolean(input.has_guide)
  let guideCommission: number | null = null
  if (hasGuide) {
    const c = input.guide_commission != null ? Number(input.guide_commission) : NaN
    if (!Number.isFinite(c) || c < 0) errors.push('Rehber komisyonu geçersiz.')
    else guideCommission = c
  }

  if (errors.length > 0) {
    if (errors.some((e) => e.includes('format'))) {
      return { ok: false, code: 'INVALID_PLATE', message: errors.join(' ') }
    }
    return { ok: false, code: 'INVALID_INPUT', message: errors.join(' ') }
  }

  // Çalışan snapshot ismi
  let employeeName: string | null = null
  if (input.employee_id) {
    const supabase = getSupabaseAdmin()
    const { data: emp } = await supabase.from('employees').select('name').eq('id', input.employee_id).maybeSingle()
    employeeName = emp?.name ?? null
  }

  // Tarih ve saat Türkiye saat dilimine kilitli — UTC sunucu drift'ini önler
  const dateKey = input.entry_date ?? todayKeyTR()
  const timeKey = input.entry_time ?? nowTimeTR()

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('ledger_entries')
    .insert({
      entry_date: dateKey,
      entry_time: timeKey,
      plate,
      employee_id: input.employee_id ?? null,
      employee_name: employeeName,
      payment_method: input.payment_method,
      sale_amount: sale,
      has_guide: hasGuide,
      guide_commission: guideCommission,
      customer_paid: Boolean(input.customer_paid),
      guide_paid: Boolean(input.guide_paid),
      notes: input.notes?.trim() || null,
      created_by_email: createdByEmail,
    })
    .select()
    .single()

  if (error || !data) {
    return { ok: false, code: 'DB_ERROR', message: 'Kayıt oluşturulamadı.', details: error?.message }
  }
  return { ok: true, entry: data as LedgerEntry }
}

// ─── Güncelle / Sil ─────────────────────────────────────────────
export type UpdateLedgerInput = Partial<{
  customer_paid: boolean
  guide_paid: boolean
  notes: string | null
  sale_amount: number
  guide_commission: number | null
  has_guide: boolean
  payment_method: 'cash' | 'card'
  employee_id: string | null
  entry_time: string
}>

export async function updateLedgerEntry(id: string, patch: UpdateLedgerInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('ledger_entries').update(patch).eq('id', id)
  return !error
}

export async function deleteLedgerEntry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('ledger_entries').delete().eq('id', id)
  return !error
}

// ─── Arşiv özetleri (yıl/ay/gün) ────────────────────────────
export interface PeriodSummary {
  key: string
  label: string
  entryCount: number
  totalSale: number
  cashSale: number
  cardSale: number
  guideTotal: number
  unpaidCustomers: number
  unpaidGuides: number
}

function rangeForYear(year: number): [string, string] {
  return [`${year}-01-01`, `${year}-12-31`]
}
function rangeForMonth(year: number, month: number): [string, string] {
  const last = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return [`${year}-${mm}-01`, `${year}-${mm}-${String(last).padStart(2, '0')}`]
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export async function listArchiveYears(): Promise<PeriodSummary[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()

  const { data: firstRow } = await supabase
    .from('ledger_entries')
    .select('entry_date')
    .order('entry_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstRow) return []
  const firstYear = Number((firstRow.entry_date as string).slice(0, 4))
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= firstYear; y--) years.push(y)

  return Promise.all(years.map(async (y) => {
    const [from, to] = rangeForYear(y)
    const { data } = await supabase
      .from('ledger_entries')
      .select('payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
      .gte('entry_date', from)
      .lte('entry_date', to)
    return buildSummary(String(y), String(y), (data ?? []) as PeriodRow[])
  }))
}

export async function listArchiveMonths(year: number): Promise<PeriodSummary[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()

  const summaries: PeriodSummary[] = []
  for (let m = 12; m >= 1; m--) {
    const [from, to] = rangeForMonth(year, m)
    const { data } = await supabase
      .from('ledger_entries')
      .select('payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
      .gte('entry_date', from)
      .lte('entry_date', to)
    if (!data || data.length === 0) continue
    summaries.push(buildSummary(`${year}-${String(m).padStart(2, '0')}`, `${MONTHS[m - 1]} ${year}`, data as PeriodRow[]))
  }
  return summaries
}

/**
 * Verilen tarih aralığındaki HER GÜN için PeriodSummary döndür.
 * Boş günler de dahil (entryCount = 0 olur). Haftalık görünüm için ideal.
 */
export async function listDaysInRange(from: string, to: string): Promise<PeriodSummary[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()

  const { data: rows } = await supabase
    .from('ledger_entries')
    .select('entry_date, payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
    .gte('entry_date', from)
    .lte('entry_date', to)

  type Row = PeriodRow & { entry_date: string }
  const byDate = new Map<string, Row[]>()
  for (const r of (rows ?? []) as Row[]) {
    const arr = byDate.get(r.entry_date) ?? []
    arr.push(r)
    byDate.set(r.entry_date, arr)
  }

  return daysBetween(from, to).map((date) => {
    const rs = byDate.get(date) ?? []
    const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'short',
    })
    return buildSummary(date, dayLabel, rs)
  })
}

export async function listArchiveDays(year: number, month: number): Promise<PeriodSummary[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()

  const [from, to] = rangeForMonth(year, month)
  const { data: rows } = await supabase
    .from('ledger_entries')
    .select('entry_date, payment_method, sale_amount, has_guide, guide_commission, customer_paid, guide_paid')
    .gte('entry_date', from)
    .lte('entry_date', to)

  if (!rows || rows.length === 0) return []

  type Row = PeriodRow & { entry_date: string }
  const byDate = new Map<string, Row[]>()
  for (const r of rows as Row[]) {
    const arr = byDate.get(r.entry_date) ?? []
    arr.push(r)
    byDate.set(r.entry_date, arr)
  }

  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, rs]) => {
      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short' })
      const label = `${date.slice(8)} ${MONTHS[month - 1]} · ${dayName}`
      return buildSummary(date, label, rs)
    })
}

interface PeriodRow {
  payment_method: string
  sale_amount: number | string
  has_guide: boolean
  guide_commission: number | string | null
  customer_paid: boolean
  guide_paid: boolean
}

function buildSummary(key: string, label: string, rows: PeriodRow[]): PeriodSummary {
  const s: PeriodSummary = {
    key, label,
    entryCount: 0, totalSale: 0, cashSale: 0, cardSale: 0, guideTotal: 0,
    unpaidCustomers: 0, unpaidGuides: 0,
  }
  for (const r of rows) {
    s.entryCount++
    const amt = Number(r.sale_amount ?? 0)
    s.totalSale += amt
    if (r.payment_method === 'cash') s.cashSale += amt
    else if (r.payment_method === 'card') s.cardSale += amt
    if (r.has_guide && r.guide_commission != null) s.guideTotal += Number(r.guide_commission)
    if (!r.customer_paid) s.unpaidCustomers++
    if (r.has_guide && !r.guide_paid) s.unpaidGuides++
  }
  return s
}

// ─── Plakaya göre tüm geçmiş kayıtlar ────────────────────────
export async function getPlateHistory(plate: string, limit = 50): Promise<LedgerEntry[]> {
  if (!isSupabaseConfigured()) return []
  const norm = normalizePlate(plate)
  if (!isValidPlate(norm)) return []
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('plate', norm)
    .order('entry_date', { ascending: false })
    .order('entry_time', { ascending: false })
    .limit(limit)
  return (data ?? []) as LedgerEntry[]
}
