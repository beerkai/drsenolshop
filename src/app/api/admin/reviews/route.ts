import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { createAdminReview } from '@/lib/reviews-admin'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const result = await createAdminReview({
    product_id: String(body.product_id ?? ''),
    customer_name: String(body.customer_name ?? ''),
    customer_email: body.customer_email != null ? String(body.customer_email) : null,
    rating: Number(body.rating),
    title: body.title != null ? String(body.title) : null,
    body: body.body != null ? String(body.body) : null,
    is_verified_purchase: body.is_verified_purchase === true,
    is_approved: body.is_approved !== false,
    created_at: body.created_at != null ? String(body.created_at) : null,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, review: result.review })
}
