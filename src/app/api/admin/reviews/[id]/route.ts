// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/reviews/[id] — onayla/reddet
// DELETE /api/admin/reviews/[id] — sil
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { updateAdminReview } from '@/lib/reviews-admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  // Yalnızca onay toggle (eski istemciler)
  if (typeof body.is_approved === 'boolean' && Object.keys(body).length === 1) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('product_reviews')
      .update({
        is_approved: body.is_approved,
        approved_at: body.is_approved ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const result = await updateAdminReview(id, {
    product_id: body.product_id != null ? String(body.product_id) : undefined,
    customer_name: body.customer_name != null ? String(body.customer_name) : undefined,
    customer_email: body.customer_email != null ? String(body.customer_email) : undefined,
    rating: body.rating != null ? Number(body.rating) : undefined,
    title: body.title !== undefined ? (body.title == null ? null : String(body.title)) : undefined,
    body: body.body !== undefined ? (body.body == null ? null : String(body.body)) : undefined,
    is_verified_purchase:
      body.is_verified_purchase !== undefined ? body.is_verified_purchase === true : undefined,
    is_approved: body.is_approved !== undefined ? body.is_approved === true : undefined,
    created_at: body.created_at != null ? String(body.created_at) : undefined,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, review: result.review })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('product_reviews').delete().eq('id', id)
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
