// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/resend-confirmation
// ─ Onay e-postasını tekrar gönder (login sırasında "email_not_confirmed"
//   hatası alan kullanıcı için)
// ─ Her durumda 200 döner (kullanıcı varlığını sızdırmamak için)
// ─ Supabase'in kendi rate-limit'i koruma sağlar
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
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ ok: false, message: 'E-posta gerekli.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  const emailRedirectTo = `${getSiteOrigin(request)}/auth/callback?next=${encodeURIComponent('/hesabim')}`

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo },
  })

  if (error) {
    // Rate-limit gibi hatalar UI'ye gitsin
    return NextResponse.json(
      { ok: false, message: translateAuthError(error, 'Onay e-postası gönderilemedi.') },
      { status: 429 }
    )
  }

  return NextResponse.json({ ok: true })
}
