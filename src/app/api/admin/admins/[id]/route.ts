// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/admins/[id] — admin aktif/pasif (deaktive)
// DELETE /api/admin/admins/[id] — silme (owner kendini silemez)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCurrentAdmin()
  if (!ctx || ctx.admin.role !== 'owner') {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await params
  let body: { is_active?: boolean; role?: 'owner' | 'staff'; full_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  // Owner kendini deaktif edemez
  if (id === ctx.admin.id && body.is_active === false) {
    return NextResponse.json({ ok: false, message: 'Kendinizi pasif yapamazsınız.' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (body.is_active !== undefined) patch.is_active = body.is_active
  if (body.role !== undefined) patch.role = body.role === 'owner' ? 'owner' : 'staff'
  if (body.full_name !== undefined) patch.full_name = body.full_name?.trim() || null

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, message: 'Güncellenecek alan yok' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('admin_users').update(patch).eq('id', id)
  if (error) {
    return NextResponse.json({ ok: false, message: 'Güncellenemedi.', details: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCurrentAdmin()
  if (!ctx || ctx.admin.role !== 'owner') {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await params
  if (id === ctx.admin.id) {
    return NextResponse.json({ ok: false, message: 'Kendinizi silemezsiniz.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('admin_users').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ ok: false, message: 'Silinemedi.', details: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
