// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/profile — user_metadata'ya profil + adres kaydet
// ─ Logged-in kullanıcı kendi profilini günceller
// ─ Checkout autofill'i önceki sipariş yoksa buradan okur
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { translateAuthError } from '@/lib/auth-errors'

export interface CustomerProfile {
  full_name?: string
  phone?: string
  address_line1?: string
  address_line2?: string
  district?: string
  city?: string
  postal_code?: string
}

const KEYS: (keyof CustomerProfile)[] = [
  'full_name', 'phone', 'address_line1', 'address_line2',
  'district', 'city', 'postal_code',
]

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Oturum bulunamadı.' }, { status: 401 })
  }

  const meta: Record<string, string> = {}
  for (const key of KEYS) {
    const v = body[key]
    if (typeof v === 'string') {
      meta[key] = v.trim().slice(0, 200) // güvenli sınır
    }
  }

  const { error } = await supabase.auth.updateUser({
    data: meta,
  })

  if (error) {
    return NextResponse.json(
      { ok: false, message: translateAuthError(error, 'Profil güncellenemedi.') },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
