// ═══════════════════════════════════════════════════════════════
// POST /api/admin/telegram-test — yetkili tüm chat ID'lere test
// gönderir. (TELEGRAM_CHAT_ID + TELEGRAM_ADMIN_IDS hepsi)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import {
  broadcastTelegramMessage,
  isTelegramConfigured,
  escapeHtml,
  getBroadcastChatIds,
} from '@/lib/telegram'

export async function POST() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID env eksik.' },
      { status: 503 }
    )
  }

  const ids = getBroadcastChatIds()
  const now = new Date().toLocaleString('tr-TR')
  const text = [
    '<b>🐝 Test Mesajı</b>',
    '',
    `<b>Gönderen:</b> ${escapeHtml(admin.admin.full_name ?? admin.admin.email)}`,
    `<b>Zaman:</b> ${escapeHtml(now)}`,
    '',
    'Bot bağlantısı çalışıyor ✓',
    `<i>Bu mesaj ${ids.length} alıcıya gönderildi.</i>`,
  ].join('\n')

  const result = await broadcastTelegramMessage(text)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: 'Telegram broadcast başarısız.' },
      { status: 500 }
    )
  }
  return NextResponse.json({ ok: true, sent: result.sent, failed: result.failed })
}
