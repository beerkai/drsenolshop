// Geçici şema kontrolü — kolon var mı, son DDL denemesi ne dedi.
// Müşteri verisi dönmez.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const COLUMNS = ['coupon_code', 'coupon_consumed_at', 'stock_decremented_at', 'paid_at', 'paytr_response'] as const

export async function GET() {
  const supabase = getSupabaseAdmin()
  const columns: Record<string, boolean> = {}
  for (const column of COLUMNS) {
    const { error } = await supabase.from('orders').select(column).limit(1)
    columns[column] = !error
  }

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'schema_apply_report')
    .maybeSingle()

  return NextResponse.json({
    ok: Object.values(columns).every(Boolean),
    columns,
    report: data?.value ?? null,
  })
}
