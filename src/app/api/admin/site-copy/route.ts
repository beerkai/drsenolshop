import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSiteCopy, setSiteCopy, type SiteCopy } from '@/lib/site-copy'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  const copy = await getSiteCopy()
  return NextResponse.json({ ok: true, copy })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: SiteCopy
  try {
    body = (await request.json()) as SiteCopy
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  if (!body?.faq?.sections?.length) {
    return NextResponse.json({ ok: false, message: 'SSS yapısı eksik.' }, { status: 400 })
  }

  const ok = await setSiteCopy(body)
  if (!ok) {
    return NextResponse.json(
      { ok: false, message: 'Kaydedilemedi. site_settings tablosunu kontrol edin.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
