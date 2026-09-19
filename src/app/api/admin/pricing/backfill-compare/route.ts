// POST — compare_price backfill (0019 migration ile aynı mantık)
import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const session = await getCurrentAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz.' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  let updated = 0

  const { data: discounted } = await supabase
    .from('product_variants')
    .select('id, price, discount_price, compare_price')

  for (const row of discounted ?? []) {
    const price = Number(row.price)
    const dp = row.discount_price !== null ? Number(row.discount_price) : NaN
    if (!Number.isNaN(dp) && dp > 0 && dp < price) {
      const cp = row.compare_price !== null ? Number(row.compare_price) : NaN
      if (Number.isNaN(cp) || cp < price) {
        const { error } = await supabase.from('product_variants').update({ compare_price: price }).eq('id', row.id)
        if (!error) updated += 1
      }
    }
  }

  const { data: plain } = await supabase
    .from('product_variants')
    .select('id, price, discount_price, compare_price, is_active')
    .is('compare_price', null)

  for (const row of plain ?? []) {
    if (row.discount_price !== null) continue
    const price = Number(row.price)
    if (price > 0 && row.is_active !== false) {
      const { error } = await supabase
        .from('product_variants')
        .update({ compare_price: Math.round(price * 1.12 * 100) / 100 })
        .eq('id', row.id)
      if (!error) updated += 1
    }
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, base_price, compare_price, is_active')
    .is('compare_price', null)

  for (const p of products ?? []) {
    const base = p.base_price !== null ? Number(p.base_price) : NaN
    if (p.is_active && !Number.isNaN(base) && base > 0) {
      const { error } = await supabase
        .from('products')
        .update({ compare_price: Math.round(base * 1.12 * 100) / 100 })
        .eq('id', p.id)
      if (!error) updated += 1
    }
  }

  return NextResponse.json({ ok: true, updated })
}
