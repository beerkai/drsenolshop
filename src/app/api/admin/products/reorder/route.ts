// ═══════════════════════════════════════════════════════════════
// POST /api/admin/products/reorder — katalog sırasını toplu kaydet
// Gövde: { order: string[] }  (ürün id'leri, istenen sırada)
// display_order 10'ar artar; araya elle ekleme yapmak kolay olsun.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { order?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const order = body.order
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ ok: false, message: 'Sıra listesi boş.' }, { status: 400 })
  }
  if (order.length > 500) {
    return NextResponse.json({ ok: false, message: 'Tek seferde en fazla 500 ürün.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const results = await Promise.all(
    order.map((rawId, index) =>
      supabase
        .from('products')
        .update({ display_order: (index + 1) * 10 })
        .eq('id', String(rawId))
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Sıra kaydedilemedi. products.display_order kolonu yoksa supabase/apply/EKSIK_MIGRATIONS.sql dosyasını çalıştırın.',
        details: failed.error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, count: order.length })
}
