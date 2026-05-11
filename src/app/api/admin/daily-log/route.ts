// ═══════════════════════════════════════════════════════════════
// POST /api/admin/daily-log — bugünün günlük log'unu kaydet (upsert)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { upsertDailyLog } from '@/lib/daily-log'

interface Body {
  notes?: string | null
  metrics?: Record<string, string>
  dateKey?: string // YYYY-MM-DD; verilmezse bugün
}

export async function POST(request: Request) {
  const ctx = await getCurrentAdmin()
  if (!ctx) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  // metrics sanitize — sadece string key/value, max 12 alan
  const safeMetrics: Record<string, string> = {}
  if (body.metrics && typeof body.metrics === 'object') {
    let count = 0
    for (const [k, v] of Object.entries(body.metrics)) {
      if (count >= 12) break
      const key = k.trim().slice(0, 80)
      if (!key) continue
      safeMetrics[key] = String(v ?? '').slice(0, 240)
      count++
    }
  }

  const saved = await upsertDailyLog(ctx.admin.email, {
    notes: body.notes?.trim() ? body.notes.trim() : null,
    metrics: safeMetrics,
    dateKey: body.dateKey,
  })

  if (!saved) {
    return NextResponse.json({ ok: false, message: 'Kayıt başarısız' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, log: saved })
}
