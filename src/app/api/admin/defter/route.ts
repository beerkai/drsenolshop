// ═══════════════════════════════════════════════════════════════
// POST /api/admin/defter — yeni defter kaydı
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { createLedgerEntry, type CreateLedgerInput } from '@/lib/ledger'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: CreateLedgerInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const result = await createLedgerEntry(body, admin.admin.email)
  if (!result.ok) {
    const status = result.code === 'INVALID_INPUT' || result.code === 'INVALID_PLATE' ? 400 : 500
    return NextResponse.json(result, { status })
  }
  return NextResponse.json({ ok: true, entry: result.entry }, { status: 201 })
}
