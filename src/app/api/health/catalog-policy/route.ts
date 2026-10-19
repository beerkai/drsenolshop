// ═══════════════════════════════════════════════════════════════
// GET /api/health/catalog-policy
// Kargo eşiği ve KDV oran dağılımı. Gizli anahtar yok.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getShippingConfig } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, message: 'Supabase yapılandırılmamış' })
  }

  const supabase = getSupabase()
  const [{ data: products, error }, shipping, reportRes] = await Promise.all([
    supabase.from('products').select('tax_rate'),
    getShippingConfig(),
    supabase.from('site_settings').select('value').eq('key', 'tax_shipping_report').maybeSingle(),
  ])

  const taxCounts: Record<string, number> = {}
  for (const row of products ?? []) {
    const key = String(row.tax_rate ?? 'null')
    taxCounts[key] = (taxCounts[key] ?? 0) + 1
  }

  return NextResponse.json({
    ok: !error,
    shipping,
    tax_counts: taxCounts,
    report: reportRes.data?.value ?? null,
    error: error?.message ?? null,
  })
}
