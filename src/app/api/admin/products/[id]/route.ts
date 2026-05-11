// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/products/[id] — ürün + varyant stok güncelleme
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface PatchBody {
  is_active?: boolean
  is_featured?: boolean
  base_price?: number | null
  stock_quantity?: number | null
  tax_rate?: number
  variant_stocks?: Record<string, string | number>
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const productUpdates: Record<string, unknown> = {}
  if (body.is_active !== undefined) productUpdates.is_active = body.is_active
  if (body.is_featured !== undefined) productUpdates.is_featured = body.is_featured
  if (body.base_price !== undefined) productUpdates.base_price = body.base_price
  if (body.stock_quantity !== undefined) productUpdates.stock_quantity = body.stock_quantity
  if (body.tax_rate !== undefined) {
    if (typeof body.tax_rate !== 'number' || body.tax_rate < 0 || body.tax_rate > 100) {
      return NextResponse.json({ ok: false, message: 'Geçersiz tax_rate (0-100 arası olmalı)' }, { status: 400 })
    }
    productUpdates.tax_rate = body.tax_rate
  }

  if (Object.keys(productUpdates).length > 0) {
    const { error: prodErr } = await supabase.from('products').update(productUpdates).eq('id', id)
    if (prodErr) {
      return NextResponse.json({ ok: false, message: 'Ürün güncellenemedi', details: prodErr.message }, { status: 500 })
    }
  }

  // Varyant stokları
  if (body.variant_stocks && typeof body.variant_stocks === 'object') {
    const tasks: Promise<unknown>[] = []
    for (const [variantId, value] of Object.entries(body.variant_stocks)) {
      const num = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(num) || num < 0) continue
      tasks.push(
        (async () => {
          await supabase
            .from('product_variants')
            .update({ stock_quantity: num })
            .eq('id', variantId)
            .eq('product_id', id)
        })()
      )
    }
    if (tasks.length > 0) await Promise.all(tasks)
  }

  return NextResponse.json({ ok: true })
}
