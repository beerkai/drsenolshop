// ═══════════════════════════════════════════════════════════════
// GET /api/instagram/media/[code]
// @drsenol.shop akışındaki tek kare. Tarayıcı Instagram CDN'ine
// değil, bu origin'e gider — mobil Safari ve uygulama içi
// tarayıcıda sıcak bağlantı engeline takılmaz.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { readInstagramMedia } from '@/lib/instagram/feed'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const media = await readInstagramMedia(code)
  if (!media) {
    return NextResponse.json({ ok: false, message: 'Görsel bulunamadı.' }, { status: 404 })
  }

  return new NextResponse(Buffer.from(media.body), {
    headers: {
      'Content-Type': media.contentType,
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
