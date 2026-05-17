// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/reset — şifre sıfırlama e-postası gönder
// ─ Supabase'in kendi e-posta servisini kullanır
// ─ E-mail içindeki link kullanıcıyı /sifre-yenile sayfasına yönlendirir
// ─ Mevcut olmayan e-posta için de 200 döner (kullanıcı sayımı sızdırılmaz)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

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
  // E-postadaki link önce /auth/callback'e gitmeli (code exchange ile cookie session kurulur),
  // sonra /sifre-yenile'ye yönlendirilir. Doğrudan /sifre-yenile'ye giderse session olmaz.
  const redirectTo = `${getSiteOrigin(request)}/auth/callback?next=${encodeURIComponent('/sifre-yenile')}`

  await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  // Her durumda 200 dön — kullanıcı varlığını sızdırmamak için.
  return NextResponse.json({ ok: true })
}
