// ═══════════════════════════════════════════════════════════════
// GET/POST /api/admin/admins — admin listesi + yeni admin ekle
// ─ Sadece owner role görür/ekler
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const ctx = await getCurrentAdmin()
  if (!ctx || ctx.admin.role !== 'owner') {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, last_login_at, created_at')
    .order('created_at', { ascending: true })

  return NextResponse.json({ ok: true, admins: data ?? [] })
}

export async function POST(request: Request) {
  const ctx = await getCurrentAdmin()
  if (!ctx || ctx.admin.role !== 'owner') {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 403 })
  }

  let body: { email?: string; full_name?: string; role?: 'owner' | 'staff' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, message: 'Geçerli e-posta gerekli.' }, { status: 400 })
  }
  const role = body.role === 'owner' ? 'owner' : 'staff'

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ email, full_name: body.full_name?.trim() || null, role, is_active: true })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: false, message: 'Bu e-posta zaten kayıtlı.' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, message: 'Eklenemedi.', details: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, admin: data })
}
