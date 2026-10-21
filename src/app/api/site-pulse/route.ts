// ═══════════════════════════════════════════════════════════════
// Mağaza nabzı — sekme açıkken 25 sn'de bir. Kimlik tutmaz.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { isPulseSessionId, normalizePulsePath, touchPresence } from '@/lib/site-pulse'

export const dynamic = 'force-dynamic'

function looksLikeBot(ua: string | null): boolean {
  if (!ua) return false
  return /bot|crawler|spider|slurp|preview|lighthouse|headless|wget|curl|python-requests|go-http|httpx|scrapy/i.test(ua)
}

export async function POST(request: Request) {
  if (looksLikeBot(request.headers.get('user-agent'))) {
    return NextResponse.json({ ok: true })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const record = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const id = typeof record.id === 'string' ? record.id : ''
  const path = typeof record.path === 'string' ? record.path : ''
  if (!isPulseSessionId(id) || !normalizePulsePath(path)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await touchPresence(id, path)
  return NextResponse.json({ ok: true })
}
