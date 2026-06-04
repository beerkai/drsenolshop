// ═══════════════════════════════════════════════════════════════
// POST /api/payments/paytr/init — order_number için PayTR token üret
// ─ Çağıran client: /odeme/paytr/[order_number] iframe sayfası
// ─ PayTR yapılandırılmamışsa 503 döner; checkout UI bunu zaten gizler
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getOrderByNumber } from '@/lib/orders'
import { paytrInitToken, getClientIp, isPaytrConfigured } from '@/lib/paytr'

export async function POST(request: Request) {
  if (!isPaytrConfigured()) {
    return NextResponse.json(
      { ok: false, code: 'NOT_CONFIGURED', message: 'PayTR yapılandırılmamış' },
      { status: 503 }
    )
  }

  let body: { order_number?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const orderNumber = body.order_number?.trim()
  if (!orderNumber) {
    return NextResponse.json({ ok: false, message: 'order_number gerekli' }, { status: 400 })
  }

  const lookup = await getOrderByNumber(orderNumber)
  if (!lookup) {
    return NextResponse.json({ ok: false, message: 'Sipariş bulunamadı' }, { status: 404 })
  }

  const { order, items } = lookup
  if (order.payment_method !== 'paytr') {
    return NextResponse.json({ ok: false, message: 'Bu sipariş PayTR ile ödenmek üzere oluşturulmadı' }, { status: 400 })
  }
  if (order.payment_status === 'captured') {
    return NextResponse.json({ ok: false, message: 'Bu sipariş zaten ödenmiş' }, { status: 409 })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin
  const no = encodeURIComponent(order.order_number)
  const result = await paytrInitToken({
    order,
    items,
    user_ip: getClientIp(request),
    merchant_ok_url: `${origin}/odeme/basarili?no=${no}`,
    merchant_fail_url: `${origin}/odeme/basarisiz?no=${no}`,
  })

  if (!result.ok) {
    console.error('[paytr/init] token hatası:', result.message, result.raw)
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status })
  }

  return NextResponse.json({ ok: true, iframe_url: result.iframe_url, token: result.token })
}
