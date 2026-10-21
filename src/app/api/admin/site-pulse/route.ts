// ═══════════════════════════════════════════════════════════════
// Yönetim — şu an sitede kaç sekme açık
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { readPresence } from '@/lib/site-pulse'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const snapshot = await readPresence()
  return NextResponse.json(
    { ok: true, ...snapshot },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
