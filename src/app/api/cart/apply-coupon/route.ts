// ═══════════════════════════════════════════════════════════════
// POST /api/cart/apply-coupon — kupon doğrulama (kullanım sayacı artmaz)
// ─ Subtotal client'tan değil, doğrulanmış cart'tan hesaplanmalı
// ─ Sayaç sipariş başarıyla oluştuğunda artar (orders.ts)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { validateCartItems, type ClientCartItem } from '@/lib/orders'
import { calculateTotals } from '@/lib/cart-totals'
import { validateCoupon } from '@/lib/coupons'

export async function POST(request: Request) {
  let body: { items?: ClientCartItem[]; code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const items = body.items
  const code = body.code?.trim()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, message: 'Sepet boş.' }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ ok: false, message: 'Kupon kodu girin.' }, { status: 400 })
  }

  const validated = await validateCartItems(items)
  if (!validated.ok) {
    return NextResponse.json({ ok: false, message: validated.message }, { status: 400 })
  }

  const totals = calculateTotals(validated.lines, { shippingCost: 0 })
  const result = await validateCoupon(code, totals.subtotal)
  if (!result.ok) {
    const status = result.code === 'NOT_FOUND' || result.code === 'INACTIVE' ? 404 : 400
    return NextResponse.json({ ok: false, message: result.message, code: result.code }, { status })
  }

  return NextResponse.json({
    ok: true,
    code: result.code,
    discount: result.discount,
    discount_type: result.discount_type,
    discount_value: result.discount_value,
  })
}
