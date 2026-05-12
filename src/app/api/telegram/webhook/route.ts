// ═══════════════════════════════════════════════════════════════
// POST /api/telegram/webhook — Telegram bot update'leri
// ─ TELEGRAM_WEBHOOK_SECRET ile secret_token header doğrulaması
// ─ Update tam işlenip Telegram'a cevap atılana kadar bekler;
//   yoksa Vercel serverless'ta 200 dönünce execution kesilip
//   bot cevabı yarım gönderiliyordu (geç/hiç gelmiyor sorunu).
// ═══════════════════════════════════════════════════════════════

import { NextResponse, after } from 'next/server'
import { handleTelegramUpdate, type TelegramUpdate } from '@/lib/telegram-commands'

// Vercel function timeout — after() task'lar için 30s margin
export const maxDuration = 30

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

  // Telegram'a hızla 200 dön (retry'ı önle), işlemeyi arka planda yap.
  // Next.js 16 after(): response gönderildikten sonra çalışır,
  // Vercel waitUntil ile fonksiyon erken kesilmez.
  after(async () => {
    try {
      await handleTelegramUpdate(update)
    } catch (err) {
      console.error('[telegram/webhook] işleme hatası:', err)
    }
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
