// ═══════════════════════════════════════════════════════════════
// POST /api/cart/validate — sepet doğrulama + zenginleştirme
// ─ Client localStorage'daki cart'taki fiyatlara güvenmiyoruz.
// ─ Bu endpoint product_id'lerden taze fiyat/KDV/stok döner.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { validateCartItems, type ClientCartItem } from '@/lib/orders'
import { calculateTotals } from '@/lib/cart-totals'
import { getShippingConfig, calculateShipping } from '@/lib/site-settings'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const items = (body as { items?: ClientCartItem[] })?.items
  if (!Array.isArray(items)) {
    return NextResponse.json({ ok: false, message: 'items dizisi gerekli' }, { status: 400 })
  }

  const validated = await validateCartItems(items)
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, code: validated.code, message: validated.message },
      { status: validated.code === 'OUT_OF_STOCK' ? 409 : 404 }
    )
  }

  // Subtotal'ı önce çıplak hesapla (kargo dahil değil), sonra kargo ücreti uygula
  const draft = calculateTotals(validated.lines, { shippingCost: 0 })
  const shippingConfig = await getShippingConfig()
  const shippingCost = calculateShipping(draft.subtotal, shippingConfig)
  const totals = calculateTotals(validated.lines, { shippingCost })

  return NextResponse.json({
    ok: true,
    lines: validated.lines,
    totals,
    shipping: {
      flat_fee: shippingConfig.flat_fee,
      free_threshold: shippingConfig.free_threshold,
      courier_name: shippingConfig.courier_name,
      cost: shippingCost,
    },
  })
}
