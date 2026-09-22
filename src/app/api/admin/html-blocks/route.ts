// ═══════════════════════════════════════════════════════════════
// /api/admin/html-blocks — anasayfa HTML şeritleri
// ─ GET  : kayıtlı şeritler
// ─ POST : { blocks } listesini kaydeder
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getHomeHtmlBlocks, setHomeHtmlBlocks } from '@/lib/cms/home-html-blocks'
import { normalizeHomeHtmlBlocks } from '@/lib/cms/home-html'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const blocks = await getHomeHtmlBlocks()
  return NextResponse.json({ ok: true, blocks })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { blocks?: unknown }
  try {
    body = (await request.json()) as { blocks?: unknown }
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  if (!body || !Array.isArray(body.blocks)) {
    return NextResponse.json({ ok: false, message: 'blocks listesi gerekli.' }, { status: 400 })
  }

  const blocks = normalizeHomeHtmlBlocks(body.blocks)
  const ok = await setHomeHtmlBlocks(blocks)
  if (!ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Kaydedilemedi. site_settings tablosu yoksa supabase/apply/EKSIK_MIGRATIONS.sql dosyasını çalıştırın.',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, blocks })
}
