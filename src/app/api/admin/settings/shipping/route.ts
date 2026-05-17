// ═══════════════════════════════════════════════════════════════
// POST /api/admin/settings/shipping — kargo ayarlarını kaydet
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { setShippingConfig } from '@/lib/site-settings'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { flat_fee?: unknown; free_threshold?: unknown; courier_name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const ok = await setShippingConfig({
    flat_fee: Number(body.flat_fee ?? 0),
    free_threshold: Number(body.free_threshold ?? 0),
    courier_name: (body.courier_name ?? '').toString(),
  })

  if (!ok) return NextResponse.json({ ok: false, message: 'Kaydedilemedi.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
