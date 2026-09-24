// ═══════════════════════════════════════════════════════════════
// POST /api/reviews — logged-in müşteri yorum bırakır
// ─ Onay bekler (is_approved=false), admin onaylar
// ═══════════════════════════════════════════════════════════════

import { NextResponse, after } from 'next/server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { createReview } from '@/lib/reviews'
import { broadcastTelegramMessage, isTelegramConfigured } from '@/lib/telegram'
import { reviewNotice } from '@/lib/telegram-actions'

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
    const notice = reviewNotice({
      id: result.review.id,
      rating: result.review.rating,
      customerName: result.review.customer_name ?? '',
      title: result.review.title,
    })
    after(() => {
      broadcastTelegramMessage(notice.text, { replyMarkup: notice.keyboard }).catch((err) => {
        console.error('[api/reviews] telegram:', err)
      })
    })
  }

  return NextResponse.json({ ok: true, review: result.review })
}
