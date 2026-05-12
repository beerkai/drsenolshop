// ═══════════════════════════════════════════════════════════════
// POST /api/admin/broadcast — duyuruyu tüm yetkili chat ID'lere yolla
// ─ Auth: admin oturumu
// ─ Body: { message: string, includeFooter?: boolean }
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import {
  broadcastTelegramMessage,
  isTelegramConfigured,
  escapeHtml,
  getBroadcastChatIds,
} from '@/lib/telegram'

const MAX_MESSAGE_LENGTH = 3500 // Telegram limit 4096; footer için margin

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID env eksik.' },
      { status: 503 }
    )
  }

  let body: { message?: string; includeFooter?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const raw = (body.message ?? '').trim()
  if (!raw) {
    return NextResponse.json({ ok: false, message: 'Mesaj boş olamaz.' }, { status: 400 })
  }
  if (raw.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { ok: false, message: `Mesaj çok uzun. En fazla ${MAX_MESSAGE_LENGTH} karakter.` },
      { status: 400 }
    )
  }

  const ids = getBroadcastChatIds()
  if (ids.length === 0) {
    return NextResponse.json(
      { ok: false, message: 'Yetkili chat ID yok.' },
      { status: 503 }
    )
  }

  const sender = admin.admin.full_name ?? admin.admin.email
  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })

  const lines: string[] = []
  lines.push('<b>📣 Duyuru</b>')
  lines.push('')
  lines.push(escapeHtml(raw))
  if (body.includeFooter !== false) {
    lines.push('')
    lines.push(`<i>— ${escapeHtml(sender)} · ${escapeHtml(now)}</i>`)
  }

  const result = await broadcastTelegramMessage(lines.join('\n'))
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: 'Duyuru gönderilemedi.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    total: ids.length,
  })
}
