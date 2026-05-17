// ═══════════════════════════════════════════════════════════════
// POST /api/newsletter/subscribe — bülten kaydı
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { subscribeNewsletter } from '@/lib/newsletter'
import { isTelegramConfigured, sendTelegramMessage, escapeHtml } from '@/lib/telegram'

function getClientIp(req: Request): string | null {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim().slice(0, 60)
  return req.headers.get('x-real-ip')?.trim().slice(0, 60) ?? null
}

export async function POST(request: Request) {
  let body: { email?: string; source?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  const result = await subscribeNewsletter({
    email: (body.email ?? '').toString(),
    source: body.source ?? 'footer',
    ip_address: getClientIp(request),
  })

  if (!result.ok) {
    const status = result.code === 'INVALID' ? 400 : result.code === 'NO_CONFIG' ? 503 : 500
    return NextResponse.json({ ok: false, message: result.message }, { status })
  }

  // Yeni abone: Telegram'a bilgi ver (fire-and-forget)
  if (!result.already && isTelegramConfigured()) {
    sendTelegramMessage(
      `<b>📬 Yeni bülten abonesi</b>\n<code>${escapeHtml((body.email ?? '').toLowerCase())}</code>`
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, already: result.already })
}
