// ═══════════════════════════════════════════════════════════════
// POST /api/orders — yeni sipariş oluşturma
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createOrder, type CreateOrderInput } from '@/lib/orders'
import { notifyNewOrder } from '@/lib/telegram'
import { sendOrderConfirmation } from '@/lib/email'
import { getBankInfo } from '@/lib/site-settings'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, code: 'INVALID_INPUT', message: 'Geçersiz JSON gövdesi' },
      { status: 400 }
    )
  }

  // Minimal tip kontrolü — createOrder ayrıca detaylı validasyon yapar
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { ok: false, code: 'INVALID_INPUT', message: 'Geçersiz istek gövdesi' },
      { status: 400 }
    )
  }

  const input = body as CreateOrderInput
  const result = await createOrder(input)

  if (!result.ok) {
    const status =
      result.code === 'INVALID_INPUT'      ? 400 :
      result.code === 'OUT_OF_STOCK'        ? 409 :
      result.code === 'PRODUCT_NOT_FOUND'   ? 404 :
      result.code === 'NO_CONFIG'           ? 503 :
      500
    return NextResponse.json(result, { status })
  }

  // Telegram + e-mail bildirimleri — sipariş başarısını etkilemez
  notifyNewOrder(result.order, result.items).catch((err) => {
    console.error('[api/orders] Telegram bildirimi atılamadı:', err)
  })

  ;(async () => {
    try {
      const bankInfo = result.order.payment_method === 'bank_transfer' ? await getBankInfo() : null
      const mail = await sendOrderConfirmation({
        order: result.order,
        items: result.items,
        bankInfo,
      })
      if (!mail.ok && mail.error !== 'not_configured') {
        console.error('[api/orders] sipariş onay maili gönderilemedi:', mail.error)
      }
    } catch (err) {
      console.error('[api/orders] mail gönderim hatası:', err)
    }
  })()

  return NextResponse.json({
    ok: true,
    order_number: result.order.order_number,
    order_id: result.order.id,
    total_amount: result.order.total_amount,
  }, { status: 201 })
}
