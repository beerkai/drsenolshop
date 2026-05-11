// ═══════════════════════════════════════════════════════════════
// POST /api/admin/login — email + password ile Supabase Auth girişi
// ─ Başarılıysa admin_users tablosunda var mı kontrol eder
// ─ Cookie otomatik set edilir (createServerClient ile)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

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

  const supabase = await getSupabaseServer()

  // 1) Supabase Auth ile giriş
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
  if (authErr || !authData.user) {
    return NextResponse.json(
      { ok: false, message: 'E-mail veya şifre hatalı.' },
      { status: 401 }
    )
  }

  // 2) Admin whitelist kontrolü
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('email', authData.user.email ?? '')
    .maybeSingle()

  if (!admin || admin.is_active === false) {
    // Yetkisiz → oturumu kapat
    await supabase.auth.signOut()
    return NextResponse.json(
      { ok: false, message: 'Bu hesap admin yetkisine sahip değil.' },
      { status: 403 }
    )
  }

  // 3) last_login_at güncelle (best-effort)
  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id)

  return NextResponse.json({ ok: true })
}
