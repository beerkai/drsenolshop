// ═══════════════════════════════════════════════════════════════
// POST /api/admin/editorial-images/upload
// İmzalı yükleme adresi. Dosya tarayıcıdan Storage'a gider.
// Path: products/editorial/<slotId>-<ts>.<ext>
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getHomeContent } from '@/lib/cms/home-content'
import { EDITORIAL_IMAGE_TYPES } from '@/lib/cms/editorial-image-files'
import {
  hasEditorialSlot,
  isEditorialSlotId,
} from '@/lib/cms/editorial-slots'
import { getSupabaseAdmin } from '@/lib/supabase'

const BUCKET = 'products'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { slotId?: string; contentType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const slotId = String(body.slotId ?? '').trim()
  const contentType = String(body.contentType ?? '').trim().toLowerCase()
  const ext = EDITORIAL_IMAGE_TYPES[contentType]

  if (!isEditorialSlotId(slotId) || !ext) {
    return NextResponse.json(
      { ok: false, message: 'Geçersiz slot veya dosya türü. WebP, JPG, PNG veya AVIF yükleyin.' },
      { status: 400 },
    )
  }

  const content = await getHomeContent()
  if (!hasEditorialSlot(content, slotId)) {
    return NextResponse.json({ ok: false, message: 'Görsel slotu bulunamadı.' }, { status: 404 })
  }

  const path = `editorial/${slotId}-${Date.now()}.${ext}`
  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: true })

  if (error || !data?.signedUrl || !data.token) {
    console.error('[editorial-images] imzalı url hatası:', error?.message)
    return NextResponse.json(
      { ok: false, message: 'Yükleme adresi alınamadı.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    path,
    signedUrl: data.signedUrl,
    token: data.token,
  })
}
