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

  return NextResponse.json({ ok: true, updated })
}
