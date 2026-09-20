// ═══════════════════════════════════════════════════════════════
// POST /api/admin/products/reorder — katalog sırasını toplu kaydet
// Gövde: { order: string[], mode?: 'catalog' | 'harvest' | 'featured' }
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

type ReorderMode = 'catalog' | 'harvest' | 'featured'

function columnForMode(mode: ReorderMode): string {
  if (mode === 'harvest') return 'harvest_sort_order'
  if (mode === 'featured') return 'featured_sort_order'
  return 'display_order'
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { order?: unknown; mode?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçerli JSON gönderin.' }, { status: 400 })
  }

  const order = body.order
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ ok: false, message: 'Sıra listesi boş.' }, { status: 400 })
  }
  if (order.length > 500) {
    return NextResponse.json({ ok: false, message: 'Tek seferde en fazla 500 ürün.' }, { status: 400 })
  }

  const modeRaw = body.mode
  const mode: ReorderMode =
    modeRaw === 'harvest' || modeRaw === 'featured' || modeRaw === 'catalog' ? modeRaw : 'catalog'

  const column = columnForMode(mode)
  const supabase = getSupabaseAdmin()
  const results = await Promise.all(
    order.map((rawId, index) =>
      supabase
        .from('products')
        .update({ [column]: (index + 1) * 10 })
        .eq('id', String(rawId))
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    const msg = failed.error.message
    const hint =
      mode !== 'catalog' && /harvest_sort_order|featured_sort_order|42703/i.test(msg)
        ? '0024_product_harvest_featured_sort.sql migration\'ını Supabase\'de çalıştırın.'
        : 'products.display_order kolonu yoksa 0018/0023 migration\'larını uygulayın.'
    return NextResponse.json(
      { ok: false, message: `Sıra kaydedilemedi. ${hint}`, details: msg },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, count: order.length, mode })
}
