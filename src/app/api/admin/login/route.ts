// ═══════════════════════════════════════════════════════════════
// POST /api/admin/login — email + password ile Supabase Auth girişi
// ─ Başarılıysa admin_users tablosunda var mı kontrol eder
// ─ Whitelist service role ile okunur (RLS policy eksik olsa da)
// ─ Cookie otomatik set edilir (createServerClient ile)
// ─ Yapılandırma hatası HTML 500 değil, JSON döner
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { findAdminByEmail, isActiveAdmin, touchAdminLastLogin } from '@/lib/admin-whitelist'
import { requireSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const email = body.email?.trim()
  const password = body.password
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'E-mail ve şifre gerekli.' }, { status: 400 })
  }

  let supabase
  try {
    supabase = await requireSupabaseServer()
  } catch (err) {
    console.error('[admin/login] istemci:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { ok: false, message: 'Sunucu yapılandırması eksik.' },
      { status: 500 },
    )
  }

  // 1) Supabase Auth ile giriş — kimlik buradan gelir
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
  if (authErr || !authData.user) {
    return NextResponse.json(
      { ok: false, message: 'E-mail veya şifre hatalı.' },
      { status: 401 },
    )
  }

  // 2) Admin whitelist. Policy yoksa user client boş döner; service role okur.
  const sessionEmail = authData.user.email ?? email
  let admin
  try {
    admin = await findAdminByEmail(sessionEmail)
  } catch (err) {
    console.error('[admin/login] whitelist:', err instanceof Error ? err.message : err)
    await supabase.auth.signOut()
    return NextResponse.json(
      { ok: false, message: 'Yetki kontrolü yapılamadı. Biraz sonra tekrar deneyin.' },
      { status: 500 },
    )
  }

  if (!isActiveAdmin(admin)) {
    await supabase.auth.signOut()
    return NextResponse.json(
      { ok: false, message: 'Bu hesap admin yetkisine sahip değil.' },
      { status: 403 },
    )
  }

  await touchAdminLastLogin(admin.id)

  return NextResponse.json({ ok: true })
}
