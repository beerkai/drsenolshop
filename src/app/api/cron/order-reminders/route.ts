// ═══════════════════════════════════════════════════════════════
// GET /api/cron/order-reminders — Vercel Cron (saatlik)
// ─ status='pending' & payment_status='pending' siparişlerden hatırlatma
//   gönderilmemiş olanlara e-posta atar.
// ─ Cadans:
//     1. hatırlatma: created_at > 6 saat önce
//     2. hatırlatma: 1. hatırlatmadan 48+ saat sonra
//     Maksimum 2 hatırlatma (spam koruması).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getBankInfo } from '@/lib/site-settings'
import { sendPaymentReminder, isEmailConfigured } from '@/lib/email'
import type { Order } from '@/types'

const FIRST_REMINDER_HOURS = 6
const SECOND_REMINDER_HOURS = 48
const MAX_REMINDERS = 2

export async function GET(request: Request) {
  // Yetki kontrolü
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
    }
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, skipped: 'RESEND_API_KEY eksik' })
  }

  const supabase = getSupabaseAdmin()
  const now = Date.now()
  const firstCutoffIso = new Date(now - FIRST_REMINDER_HOURS * 60 * 60 * 1000).toISOString()

  const { data: candidates, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .eq('payment_status', 'pending')
    .lte('created_at', firstCutoffIso)
    .lt('reminder_count', MAX_REMINDERS)
    .limit(50)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  // bankInfo yalnız bank_transfer siparişler için gerekiyor — lazy hesapla
  let bankInfoMemo: Awaited<ReturnType<typeof getBankInfo>> | null = null
  const getBankInfoOnce = async () => {
    if (bankInfoMemo === null) bankInfoMemo = await getBankInfo()
    return bankInfoMemo
  }

  let sent = 0
  let skipped = 0

  for (const row of (candidates ?? []) as Order[]) {
    // 2. hatırlatma için cadans kontrolü
    if (row.reminder_count >= 1 && row.reminded_at) {
      const since = (now - new Date(row.reminded_at).getTime()) / (60 * 60 * 1000)
      if (since < SECOND_REMINDER_HOURS) {
        skipped++
        continue
      }
    }

    const attempt = row.reminder_count + 1
    // bankInfo: yalnız havale siparişlerinde anlamlı; PayTR siparişine IBAN
    // göstermek yanlış olur (mail PayTR dalına düşer ve null geçilir).
    const bankInfo = row.payment_method === 'bank_transfer' ? await getBankInfoOnce() : null
    const result = await sendPaymentReminder({ order: row, bankInfo, attempt })

    if (result.ok) {
      await supabase
        .from('orders')
        .update({
          reminded_at: new Date().toISOString(),
          reminder_count: attempt,
        })
        .eq('id', row.id)
      sent++
    } else if (result.error === 'not_configured') {
      break // env eksik — döngüyü kes
    } else {
      console.error('[cron/order-reminders] mail hatası:', row.order_number, result.error)
      skipped++
    }
  }

  return NextResponse.json({ ok: true, candidates: candidates?.length ?? 0, sent, skipped })
}
