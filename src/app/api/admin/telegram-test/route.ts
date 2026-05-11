// ═══════════════════════════════════════════════════════════════
// POST /api/admin/telegram-test — admin chat'e test mesajı gönder
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'

export async function POST() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID env eksik.' },
      { status: 503 }
    )
  }

  const now = new Date().toLocaleString('tr-TR')
  const text = [
    '<b>🐝 Test Mesajı</b>',
    '',
    `<b>Gönderen:</b> ${escapeHtml(admin.admin.full_name ?? admin.admin.email)}`,
    `<b>Zaman:</b> ${escapeHtml(now)}`,
    '',
    'Bot bağlantısı çalışıyor ✓',
  ].join('\n')

  const result = await sendTelegramMessage(text)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.description ?? 'Telegram hatası.' },
      { status: 500 }
    )
  }
  return NextResponse.json({ ok: true })
}
