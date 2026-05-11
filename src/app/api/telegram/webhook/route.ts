// ═══════════════════════════════════════════════════════════════
// POST /api/telegram/webhook — Telegram bot update'leri
// ─ TELEGRAM_WEBHOOK_SECRET ile imza doğrulaması (path token)
// ─ Update'i handleTelegramUpdate'e teslim eder, hemen 200 döner
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { handleTelegramUpdate, type TelegramUpdate } from '@/lib/telegram-commands'

export async function POST(request: Request) {
  // İsteğe bağlı: Telegram secret_token header'ı
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  if (expectedSecret) {
    const got = request.headers.get('x-telegram-bot-api-secret-token')
    if (got !== expectedSecret) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
  }

  let update: TelegramUpdate
  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Komut işlemesini bekletmeden 200 dön — Telegram retry yapmasın
  handleTelegramUpdate(update).catch((err) => {
    console.error('[telegram/webhook] işleme hatası:', err)
  })

  return NextResponse.json({ ok: true })
}

// GET ile health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()),
  })
}
