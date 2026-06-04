// ═══════════════════════════════════════════════════════════════
// POST /api/admin/customer-notes — yeni müşteri notu
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { customer_email?: string; body?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const email = body.customer_email?.trim().toLowerCase()
  const text = body.body?.trim()
  if (!email || !text) {
    return NextResponse.json({ ok: false, message: 'E-posta ve metin gerekli.' }, { status: 400 })
  }
  if (text.length > 4000) {
    return NextResponse.json({ ok: false, message: 'Not 4000 karakteri aşamaz.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('customer_notes')
    .insert({
      customer_email: email,
      admin_email: admin.admin.email,
      body: text,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, note: data })
}
