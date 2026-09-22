// ═══════════════════════════════════════════════════════════════
// GET/POST /api/admin/analysis-reports — slot listesi
// Kayıtta artık referans verilmeyen PDF'ler storage'dan silinir.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import {
  ANALYSIS_PDF_BUCKET,
  getAnalysisReports,
  sanitizeAnalysisSlots,
  setAnalysisReports,
} from '@/lib/analysis-reports'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const slots = await getAnalysisReports()
  return NextResponse.json({ ok: true, slots })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { slots?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const slots = sanitizeAnalysisSlots(body.slots)
  if (!slots) {
    return NextResponse.json(
      { ok: false, message: 'Slot listesi geçersiz. En fazla 40 slot, her PDF yolu analizler/ ile başlamalı.' },
      { status: 400 }
    )
  }

  const previous = await getAnalysisReports()
  const kept = new Set(slots.map((slot) => slot.pdfPath).filter((path): path is string => Boolean(path)))
  const removed = previous
    .map((slot) => slot.pdfPath)
    .filter((path): path is string => typeof path === 'string' && !kept.has(path))

  if (removed.length > 0) {
    const { error } = await getSupabaseAdmin().storage.from(ANALYSIS_PDF_BUCKET).remove(removed)
    if (error) console.error('[analysis-reports] pdf silinemedi:', error.message)
  }

  const ok = await setAnalysisReports(slots)
  if (!ok) {
    return NextResponse.json(
      { ok: false, message: 'Kaydedilemedi. site_settings tablosunu kontrol edin.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, slots })
}
