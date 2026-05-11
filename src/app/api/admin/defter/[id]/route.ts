// ═══════════════════════════════════════════════════════════════
// PATCH/DELETE /api/admin/defter/[id]
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { updateLedgerEntry, deleteLedgerEntry, type UpdateLedgerInput } from '@/lib/ledger'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  let body: UpdateLedgerInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  // payment_method validate
  if (body.payment_method !== undefined && body.payment_method !== 'cash' && body.payment_method !== 'card') {
    return NextResponse.json({ ok: false, message: 'Geçersiz ödeme yöntemi.' }, { status: 400 })
  }

  const ok = await updateLedgerEntry(id, body)
  if (!ok) return NextResponse.json({ ok: false, message: 'Güncellenemedi.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  const ok = await deleteLedgerEntry(id)
  if (!ok) return NextResponse.json({ ok: false, message: 'Silinemedi.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
