// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/update-password — yeni şifre belirle
// ─ Sıfırlama linkinden gelen kullanıcı (geçici session) yeni şifre koyar
// ─ Authenticated olmayanlar 401 alır
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const password = body.password
  if (!password || password.length < 8) {
    return NextResponse.json({ ok: false, message: 'Şifre en az 8 karakter olmalı.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Oturum bulunamadı.' }, { status: 401 })
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
