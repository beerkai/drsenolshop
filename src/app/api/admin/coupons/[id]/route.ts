// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/coupons/[id] — aktif/pasif veya alan güncelleme
// DELETE /api/admin/coupons/[id] — kupon sil
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  let body: { is_active?: boolean; valid_until?: string | null; max_uses?: number; min_subtotal?: number; description?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
  if (body.valid_until !== undefined) updates.valid_until = body.valid_until || null
  if (typeof body.max_uses === 'number') updates.max_uses = Math.max(0, Math.floor(body.max_uses))
  if (typeof body.min_subtotal === 'number') updates.min_subtotal = Math.max(0, body.min_subtotal)
  if (body.description !== undefined) updates.description = body.description?.trim() || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: 'Güncellenecek alan yok.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('coupons').update(updates).eq('id', id)
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
