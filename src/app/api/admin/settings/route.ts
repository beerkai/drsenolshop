// ═══════════════════════════════════════════════════════════════
// POST /api/admin/settings — banka bilgileri kaydet
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { setBankInfo } from '@/lib/site-settings'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { bank_name?: string; account_holder?: string; iban?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const ok = await setBankInfo({
    bank_name: (body.bank_name ?? '').toString(),
    account_holder: (body.account_holder ?? '').toString(),
    iban: (body.iban ?? '').toString(),
  })

  if (!ok) return NextResponse.json({ ok: false, message: 'Kaydedilemedi.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
