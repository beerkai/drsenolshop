// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/login — müşteri girişi (email + password)
// ─ Admin kontrolü YAPILMAZ; her authenticated kullanıcıya açık
// ─ Admin de aynı endpoint'le müşteri olarak giriş yapabilir
// ─ Başarılıysa httpOnly cookie set edilir
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { translateAuthError } from '@/lib/auth-errors'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'E-posta ve şifre gerekli.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    const message = translateAuthError(error, 'E-posta veya şifre hatalı.')
    // email_not_confirmed durumunda UI tekrar onay maili göndermeyi önersin
    const needsConfirmation = /email not confirmed|email_not_confirmed/i.test(error?.message ?? '')
    return NextResponse.json(
      { ok: false, message, needs_confirmation: needsConfirmation, email },
      { status: needsConfirmation ? 403 : 401 }
    )
  }

  return NextResponse.json({ ok: true, email: data.user.email })
}
