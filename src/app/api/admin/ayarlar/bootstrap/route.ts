import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { loadAyarlarPageData } from '@/lib/admin-ayarlar-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ctx = await getCurrentAdmin()
  if (!ctx) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const data = await loadAyarlarPageData(ctx)
    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('[ayarlar/bootstrap] hata:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, message: 'Veri yüklenemedi.' }, { status: 500 })
  }
}
