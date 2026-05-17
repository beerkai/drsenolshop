// ═══════════════════════════════════════════════════════════════
// GET /auth/callback — Supabase Auth e-posta linklerinin dönüş noktası
// ─ ?code=... query parametresini session ile değiştirir
// ─ next= query parametresine yönlendirir (default: /hesabim)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/hesabim'

  if (!code) {
    return NextResponse.redirect(new URL('/giris?error=callback', url))
  }

  const supabase = await getSupabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/giris?error=session', url))
  }

  return NextResponse.redirect(new URL(next, url))
}
