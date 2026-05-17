// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/register — müşteri kayıt
// ─ Supabase Auth signUp; e-posta onayı kapalı ise direkt oturum açar
// ─ Onay açıksa user_metadata'ya isim eklenir, kullanıcıya doğrulama linki
// ─ Aynı email zaten varsa Supabase 400/422 döner — anlamlı mesaja çevirilir
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { translateAuthError } from '@/lib/auth-errors'

function getSiteOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (env) return env
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; full_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const fullName = body.full_name?.trim() ?? null

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'E-posta ve şifre gerekli.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: 'Şifre en az 8 karakter olmalı.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  // E-posta doğrulama linkindeki redirect → /auth/callback?next=/hesabim
  // (SSR cookie tabanlı session yalnız code exchange ile kurulur)
  const emailRedirectTo = `${getSiteOrigin(request)}/auth/callback?next=${encodeURIComponent('/hesabim')}`
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: fullName ? { full_name: fullName } : {},
    },
  })

  if (error) {
    const already = /already registered|already in use|exists|user_already_exists/i.test(error.message ?? '')
    return NextResponse.json(
      {
        ok: false,
        message: translateAuthError(error, 'Kayıt başarısız.'),
        already_registered: already,
        email,
      },
      { status: already ? 409 : 400 }
    )
  }

  // Eğer e-posta onayı kapalıysa session zaten oluştu; açıksa user var, session yok.
  const needsConfirmation = !data.session && Boolean(data.user)

  return NextResponse.json({
    ok: true,
    needs_confirmation: needsConfirmation,
    email: data.user?.email ?? email,
  })
}
