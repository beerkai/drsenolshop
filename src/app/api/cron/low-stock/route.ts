// ═══════════════════════════════════════════════════════════════
// GET /api/cron/low-stock — yalnızca yeni eşik geçişleri
// İlk çalıştırma snapshot alır, mesaj atmaz.
// Sonraki günler: yeni tükenen ve eşiğin altına yeni düşenler.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isTelegramConfigured, broadcastTelegramMessage, escapeHtml } from '@/lib/telegram'
import { getSiteUrl } from '@/lib/site-url'

const CRITICAL_THRESHOLD = 2

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
    }
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true, skipped: 'TELEGRAM_BOT_TOKEN eksik' })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id, label, variant_value, stock_quantity, is_active,
      product:products(name, slug, is_active)
    `)
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  const { data: prevRows, error: prevErr } = await supabase
    .from('stock_alert_state')
    .select('variant_id, last_stock')

  if (prevErr) {
    console.error('[cron/low-stock] snapshot okunamadı:', prevErr.message)
    return NextResponse.json({ ok: false, message: 'stock_alert_state yok. 0026 migration gerekli.' }, { status: 500 })
  }

  type Row = {
    id: string
    label: string | null
    variant_value: string | null
    stock_quantity: number | null
    product: { name: string; slug: string; is_active: boolean } | { name: string; slug: string; is_active: boolean }[] | null
  }

  const prev = new Map<string, number>()
  for (const row of prevRows ?? []) prev.set(row.variant_id, Number(row.last_stock))
  const firstRun = prev.size === 0

  const alerts: Array<{ kind: 'out' | 'low'; product: string; variant: string; stock: number }> = []
  const upserts: Array<{ variant_id: string; last_stock: number; updated_at: string }> = []
  const now = new Date().toISOString()

  for (const row of (data ?? []) as Row[]) {
    const prod = Array.isArray(row.product) ? row.product[0] : row.product
    if (!prod || prod.is_active === false) continue
    const stock = Number(row.stock_quantity ?? 0)
    const before = prev.get(row.id)
    upserts.push({ variant_id: row.id, last_stock: stock, updated_at: now })
    if (firstRun || before === undefined) {
      if (!firstRun && before === undefined && stock <= CRITICAL_THRESHOLD) {
        alerts.push({
          kind: stock === 0 ? 'out' : 'low',
          product: prod.name,
          variant: row.label ?? row.variant_value ?? '—',
          stock,
        })
      }
      continue
    }
    if (before > 0 && stock === 0) {
      alerts.push({ kind: 'out', product: prod.name, variant: row.label ?? row.variant_value ?? '—', stock })
    } else if (before > CRITICAL_THRESHOLD && stock <= CRITICAL_THRESHOLD) {
      alerts.push({ kind: 'low', product: prod.name, variant: row.label ?? row.variant_value ?? '—', stock })
    }
  }

  if (upserts.length > 0) {
    const { error: upErr } = await supabase.from('stock_alert_state').upsert(upserts, { onConflict: 'variant_id' })
    if (upErr) console.error('[cron/low-stock] snapshot yazılamadı:', upErr.message)
  }

  if (firstRun || alerts.length === 0) {
    return NextResponse.json({ ok: true, alerted: false, seeded: firstRun, count: alerts.length })
  }

  const lines = [
    '<b>Stok değişti</b>',
    '',
    ...alerts.slice(0, 25).map((it) => {
      const status = it.kind === 'out' ? 'TÜKENDİ' : 'EŞİK ALTI'
      const variant = it.variant !== '—' ? ` (${escapeHtml(it.variant)})` : ''
      return `${status} · <b>${escapeHtml(it.product)}</b>${variant} · <code>${it.stock}</code>`
    }),
  ]
  if (alerts.length > 25) lines.push('', `<i>…ve ${alerts.length - 25} kayıt daha.</i>`)
  lines.push('', `<a href="${getSiteUrl()}/admin/stok">Stok paneli</a>`)

  await broadcastTelegramMessage(lines.join('\n'))
  return NextResponse.json({ ok: true, alerted: true, count: alerts.length })
}
