// ═══════════════════════════════════════════════════════════════
// GET /api/admin/defter/plate/[plate] — bir aracın tüm geçmişi
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getPlateHistory, normalizePlate } from '@/lib/ledger'

export async function GET(_request: Request, { params }: { params: Promise<{ plate: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { plate } = await params
  const norm = normalizePlate(decodeURIComponent(plate))
  const entries = await getPlateHistory(norm, 60)
  return NextResponse.json({ ok: true, plate: norm, entries })
}
