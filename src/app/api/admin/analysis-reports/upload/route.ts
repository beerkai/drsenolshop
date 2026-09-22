// ═══════════════════════════════════════════════════════════════
// POST /api/admin/analysis-reports/upload
// İmzalı yükleme adresi döner; PDF tarayıcıdan Supabase Storage'a gider.
// Path: products/analizler/<slotId>-<ts>.pdf → cdn.drsenol.shop/...
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { ANALYSIS_PDF_BUCKET, isAnalysisSlotId } from '@/lib/analysis-reports'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { slotId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const slotId = String(body.slotId ?? '').trim()
  if (!isAnalysisSlotId(slotId)) {
    return NextResponse.json({ ok: false, message: 'Geçersiz slot.' }, { status: 400 })
  }

  const path = `analizler/${slotId}-${Date.now()}.pdf`
  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(ANALYSIS_PDF_BUCKET)
    .createSignedUploadUrl(path, { upsert: true })

  if (error || !data?.signedUrl || !data.token) {
    console.error('[analysis-reports] imzalı url hatası:', error?.message)
    return NextResponse.json(
      { ok: false, message: 'Yükleme adresi alınamadı. Storage bucket PDF kabul etmiyor olabilir.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    path,
    signedUrl: data.signedUrl,
    token: data.token,
  })
}
