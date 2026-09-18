// ═══════════════════════════════════════════════════════════════
// POST /api/admin/products/[id]/images — görsel yükleme
// ─ multipart/form-data, alan adı: "file" (çoklu olabilir)
// ─ Supabase Storage `products` bucket'ına <slug>/<ts>-<n>.<ext>
// ─ Yüklenen public URL'ler products.images sonuna eklenir
//
// DELETE — gövde: { url } → hem listeden hem Storage'dan siler
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const BUCKET = 'products'
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: product, error: readErr } = await supabase
    .from('products')
    .select('id, slug, images')
    .eq('id', id)
    .maybeSingle()

  if (readErr || !product) {
    return NextResponse.json({ ok: false, message: 'Ürün bulunamadı.' }, { status: 404 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, message: 'Dosya okunamadı.' }, { status: 400 })
  }

  const files = form.getAll('file').filter((f): f is File => f instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: 'Dosya seçilmedi.' }, { status: 400 })
  }

  const uploaded: string[] = []
  const stamp = Date.now()

  for (const [index, file] of files.entries()) {
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json(
        { ok: false, message: `Desteklenmeyen dosya türü: ${file.type || 'bilinmiyor'} (webp, jpg, png, avif)` },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: `${file.name} çok büyük (en fazla 8 MB).` },
        { status: 400 }
      )
    }

    const path = `${product.slug}/${stamp}-${index + 1}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (upErr) {
      console.error('[products/images] yükleme hatası:', upErr.message)
      return NextResponse.json(
        { ok: false, message: `Yükleme başarısız: ${upErr.message}` },
        { status: 500 }
      )
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    uploaded.push(pub.publicUrl)
  }

  const nextImages = [...((product.images as string[] | null) ?? []), ...uploaded]
  const { error: saveErr } = await supabase
    .from('products')
    .update({ images: nextImages, image_url: nextImages[0] ?? null })
    .eq('id', id)

  if (saveErr) {
    return NextResponse.json(
      { ok: false, message: 'Görseller kaydedilemedi.', details: saveErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, images: nextImages, uploaded })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const url = (body.url ?? '').trim()
  if (!url) return NextResponse.json({ ok: false, message: 'URL gerekli.' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: product } = await supabase
    .from('products')
    .select('id, images')
    .eq('id', id)
    .maybeSingle()

  if (!product) return NextResponse.json({ ok: false, message: 'Ürün bulunamadı.' }, { status: 404 })

  const nextImages = (((product.images as string[] | null) ?? []) as string[]).filter((u) => u !== url)

  const { error: saveErr } = await supabase
    .from('products')
    .update({ images: nextImages, image_url: nextImages[0] ?? null })
    .eq('id', id)

  if (saveErr) {
    return NextResponse.json({ ok: false, message: 'Silinemedi.', details: saveErr.message }, { status: 500 })
  }

  // Dosya bu bucket'a aitse Storage'dan da kaldır (dış URL'lere dokunma)
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const at = url.indexOf(marker)
  if (at !== -1) {
    const path = decodeURIComponent(url.slice(at + marker.length).split('?')[0])
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([path])
    if (rmErr) console.error('[products/images] storage silme hatası:', rmErr.message)
  }

  return NextResponse.json({ ok: true, images: nextImages })
}
