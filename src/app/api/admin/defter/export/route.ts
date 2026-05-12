// ═══════════════════════════════════════════════════════════════
// GET /api/admin/defter/export?from=YYYY-MM-DD&to=YYYY-MM-DD
// ─ Defter kayıtlarını UTF-8 BOM'lu CSV olarak indirir
// ─ Excel/Numbers ile Türkçe karakter sorunu olmasın diye BOM eklenir
// ═══════════════════════════════════════════════════════════════

import { getCurrentAdmin } from '@/lib/admin-auth'
import { listLedgerEntries } from '@/lib/ledger'
import { todayKeyTR } from '@/lib/datetime'

function csvEscape(value: unknown): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatPriceCsv(n: number | string | null | undefined): string {
  if (n == null || n === '') return ''
  const num = Number(n)
  if (!Number.isFinite(num)) return ''
  // Türkçe Excel için virgül ondalık
  return num.toFixed(2).replace('.', ',')
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return new Response('Yetkisiz', { status: 401 })
  }

  const url = new URL(request.url)
  const today = todayKeyTR()
  const from = url.searchParams.get('from') ?? today
  const to = url.searchParams.get('to') ?? today

  const { entries } = await listLedgerEntries({ dateFrom: from, dateTo: to, limit: 5000 })

  const headers = [
    'Tarih',
    'Saat',
    'Plaka',
    'Çalışan',
    'Ödeme',
    'Satış',
    'Rehber Komisyonu',
    'Net',
    'Müşteri Ödedi',
    'Rehbere Ödendi',
    'Not',
    'Kaydı Ekleyen',
    'Sipariş No',
  ]

  const rows: string[] = []
  rows.push('﻿' + headers.join(',')) // UTF-8 BOM

  for (const e of entries) {
    const sale = Number(e.sale_amount ?? 0)
    const commission = e.has_guide ? Number(e.guide_commission ?? 0) : 0
    const net = sale - commission

    const cols = [
      e.entry_date,
      e.entry_time?.slice(0, 5) ?? '',
      e.plate,
      e.employee_name ?? '',
      e.payment_method === 'card' ? 'Kart' : 'Nakit',
      formatPriceCsv(sale),
      e.has_guide ? formatPriceCsv(commission) : '',
      formatPriceCsv(net),
      e.customer_paid ? 'Evet' : 'Hayır',
      e.has_guide ? (e.guide_paid ? 'Evet' : 'Hayır') : '',
      e.notes ?? '',
      e.created_by_email ?? '',
      e.id,
    ]
    rows.push(cols.map(csvEscape).join(','))
  }

  const csv = rows.join('\r\n') + '\r\n'

  const filename = from === to
    ? `defter-${from}.csv`
    : `defter-${from}_${to}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
