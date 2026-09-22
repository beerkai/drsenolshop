// ═══════════════════════════════════════════════════════════════
// /api/admin/editorial-images
// POST  : yüklenen path'i home_content slotuna yazar
// DELETE: slotu Stitch yer tutucuya (logo için wordmark) döndürür
// ═══════════════════════════════════════════════════════════════

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getHomeContent, setHomeContent } from '@/lib/cms/home-content'
import {
  hasEditorialSlot,
  isCommittedEditorialPath,
  isEditorialSlotId,
  isEditorialStoragePath,
  resetEditorialSlot,
  setEditorialSlotSrc,
  slotView,
} from '@/lib/cms/editorial-slots'
import { resolveImageStoragePath } from '@/lib/images'
import { getSupabaseAdmin } from '@/lib/supabase'

const BUCKET = 'products'

async function removeStoredEditorial(src: string | null | undefined) {
  if (!src || !isEditorialStoragePath(src)) return
  const path = resolveImageStoragePath(src)
  if (!path.startsWith('editorial/')) return
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path])
  if (error) console.error('[editorial-images] eski dosya silinemedi:', error.message)
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { slotId?: string; path?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const slotId = String(body.slotId ?? '').trim()
  const path = String(body.path ?? '').trim()
  if (!isEditorialSlotId(slotId) || !isCommittedEditorialPath(slotId, path)) {
    return NextResponse.json({ ok: false, message: 'Geçersiz görsel kaydı.' }, { status: 400 })
  }

  const content = structuredClone(await getHomeContent())
  if (!hasEditorialSlot(content, slotId)) {
    return NextResponse.json({ ok: false, message: 'Görsel slotu bulunamadı.' }, { status: 404 })
  }

  const previous = slotView(content, slotId)?.src ?? ''
  if (!setEditorialSlotSrc(content, slotId, path)) {
    return NextResponse.json({ ok: false, message: 'Görsel slotu güncellenemedi.' }, { status: 400 })
  }

  const ok = await setHomeContent(content)
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Görsel kaydedilemedi.' }, { status: 500 })
  }

  if (previous && previous !== path) await removeStoredEditorial(previous)
  revalidatePath('/')

  return NextResponse.json({ ok: true, slot: slotView(content, slotId) })
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { slotId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const slotId = String(body.slotId ?? '').trim()
  if (!isEditorialSlotId(slotId)) {
    return NextResponse.json({ ok: false, message: 'Geçersiz slot.' }, { status: 400 })
  }

  const content = structuredClone(await getHomeContent())
  const previous = resetEditorialSlot(content, slotId)
  if (previous == null) {
    return NextResponse.json({ ok: false, message: 'Görsel slotu bulunamadı.' }, { status: 404 })
  }

  const ok = await setHomeContent(content)
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Yer tutucuya dönülemedi.' }, { status: 500 })
  }

  await removeStoredEditorial(previous)
  revalidatePath('/')

  return NextResponse.json({ ok: true, slot: slotView(content, slotId) })
}
