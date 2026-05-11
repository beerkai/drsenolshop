// ═══════════════════════════════════════════════════════════════
// POST /api/cart/validate — sepet doğrulama + zenginleştirme
// ─ Client localStorage'daki cart'taki fiyatlara güvenmiyoruz.
// ─ Bu endpoint product_id'lerden taze fiyat/KDV/stok döner.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { validateCartItems, type ClientCartItem } from '@/lib/orders'
import { calculateTotals } from '@/lib/cart-totals'

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

  const totals = calculateTotals(validated.lines, { shippingCost: 0 })

  return NextResponse.json({
    ok: true,
    lines: validated.lines,
    totals,
  })
}
