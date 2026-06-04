// ═══════════════════════════════════════════════════════════════
// POST /api/reviews — logged-in müşteri yorum bırakır
// ─ Onay bekler (is_approved=false), admin onaylar
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { createReview } from '@/lib/reviews'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'

export async function POST(request: Request) {
  const me = await getCurrentCustomer()
  if (!me) {
    return NextResponse.json({ ok: false, message: 'Yorum bırakmak için giriş yapın.' }, { status: 401 })
  }

  let body: { product_id?: string; rating?: number; title?: string; body?: string; customer_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  if (!body.product_id) {
    return NextResponse.json({ ok: false, message: 'product_id gerekli.' }, { status: 400 })
  }

  const fullNameMeta = (me.user.user_metadata?.full_name as string | undefined) ?? null

  const result = await createReview({
    product_id: body.product_id,
    user_id: me.user.id,
    customer_email: me.email,
    customer_name: body.customer_name?.trim() || fullNameMeta || me.email.split('@')[0],
    rating: Number(body.rating ?? 0),
    title: body.title ?? null,
    body: body.body ?? null,
  })

  if (!result.ok) {
    const status = result.code === 'INVALID' ? 400 : result.code === 'DUPLICATE' ? 409 : 500
    return NextResponse.json({ ok: false, message: result.message }, { status })
  }

  // Admin'e Telegram bildirimi — moderasyon için
  if (isTelegramConfigured()) {
    sendTelegramMessage(
      `<b>⭐ Yeni yorum (moderasyon bekliyor)</b>\n` +
      `Puan: ${'★'.repeat(result.review.rating)}${'☆'.repeat(5 - result.review.rating)}\n` +
      `Müşteri: ${escapeHtml(result.review.customer_name ?? '')}\n` +
      `Başlık: ${escapeHtml(result.review.title ?? '—')}\n` +
      `/admin/yorumlar`
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, review: result.review })
}
