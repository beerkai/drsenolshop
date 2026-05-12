// ═══════════════════════════════════════════════════════════════
// GET /api/cron/low-stock — Vercel Cron tarafından çağrılır
// ─ Stok ≤2 olan varyantları kontrol eder, varsa Telegram'a uyarı atar
// ─ Yetki: Vercel Cron otomatik header gönderir; ek olarak Bearer
//   secret env (CRON_SECRET) kontrolü yapılır.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  isTelegramConfigured,
  sendTelegramMessage,
  escapeHtml,
} from '@/lib/telegram'

const CRITICAL_THRESHOLD = 2

export async function GET(request: Request) {
  // Yetki kontrolü (Vercel Cron: x-vercel-cron-signature veya CRON_SECRET)
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
      product:products(id, name, slug, is_active)
    `)
    .lte('stock_quantity', CRITICAL_THRESHOLD)
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  type Row = {
    label: string | null
    variant_value: string | null
    stock_quantity: number | null
    product: { name: string; slug: string; is_active: boolean } | { name: string; slug: string; is_active: boolean }[] | null
  }

  const items: Array<{ product: string; variant: string; stock: number; slug: string }> = []
  for (const row of (data ?? []) as Row[]) {
    const prod = Array.isArray(row.product) ? row.product[0] : row.product
    if (!prod || prod.is_active === false) continue
    items.push({
      product: prod.name,
      variant: row.label ?? row.variant_value ?? '—',
      stock: Number(row.stock_quantity ?? 0),
      slug: prod.slug,
    })
  }

  if (items.length === 0) {
    return NextResponse.json({ ok: true, alerted: false, count: 0 })
  }

  const lines: string[] = []
  lines.push(`<b>⚠️ Stok Uyarısı — Kritik Seviye</b>`)
  lines.push(`<i>Stok ≤ ${CRITICAL_THRESHOLD} olan ${items.length} varyant</i>`)
  lines.push('')

  for (const it of items.slice(0, 25)) {
    const status = it.stock === 0 ? '❌ TÜKENDİ' : it.stock === 1 ? '🟠 SON 1' : '🟡 KRİTİK'
    lines.push(`${status} · <b>${escapeHtml(it.product)}</b>${it.variant !== '—' ? ` (${escapeHtml(it.variant)})` : ''} · <code>${it.stock}</code> adet`)
  }

  if (items.length > 25) {
    lines.push('')
    lines.push(`<i>…ve ${items.length - 25} kayıt daha. /admin/stok ile tümünü gör.</i>`)
  }

  await sendTelegramMessage(lines.join('\n'))

  return NextResponse.json({ ok: true, alerted: true, count: items.length })
}
