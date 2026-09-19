// ═══════════════════════════════════════════════════════════════
// POST / DELETE — product_variants.images (varyant galerisi)
// Storage: products/<slug>/<gramaj|segment>/<timestamp>-<n>.<ext>
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { variantImageStorageSegment } from '@/lib/variant-storage-path'

const BUCKET = 'products'
const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

type RouteCtx = { params: Promise<{ id: string; variantId: string }> }

async function loadVariant(productId: string, variantId: string) {
  const supabase = getSupabaseAdmin()
  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('id, slug')
    .eq('id', productId)
    .maybeSingle()
  if (pErr || !product?.slug) return { error: 'Ürün bulunamadı.' as const, status: 404 as const }

  const { data: variant, error: vErr } = await supabase
    .from('product_variants')
    .select('id, product_id, label, variant_value, weight_grams, volume_ml, sku, images')
    .eq('id', variantId)
    .eq('product_id', productId)
    .maybeSingle()

  if (vErr || !variant) return { error: 'Varyant bulunamadı.' as const, status: 404 as const }

  return { supabase, product, variant }
}

export async function POST(request: Request, ctx: RouteCtx) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id: productId, variantId } = await ctx.params
  const loaded = await loadVariant(productId, variantId)
  if ('error' in loaded) {
    return NextResponse.json({ ok: false, message: loaded.error }, { status: loaded.status })
  }

  const { supabase, product, variant } = loaded

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

  const segment = variantImageStorageSegment(variant)
  const uploaded: string[] = []
  const stamp = Date.now()

  for (const [index, file] of files.entries()) {
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json(
        { ok: false, message: `Desteklenmeyen dosya türü: ${file.type || 'bilinmiyor'}` },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, message: `${file.name} çok büyük (en fazla 8 MB).` }, { status: 400 })
    }

    const path = `${product.slug}/${segment}/${stamp}-${index + 1}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (upErr) {
      console.error('[variants/images] yükleme hatası:', upErr.message)
      return NextResponse.json({ ok: false, message: `Yükleme başarısız: ${upErr.message}` }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    uploaded.push(pub.publicUrl)
  }

  const prev = ((variant.images as string[] | null) ?? []).map(String)
  const nextImages = [...prev, ...uploaded]

  const { error: saveErr } = await supabase
    .from('product_variants')
    .update({ images: nextImages })
    .eq('id', variantId)
    .eq('product_id', productId)

  if (saveErr) {
    return NextResponse.json({ ok: false, message: 'Varyant görselleri kaydedilemedi.', details: saveErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, images: nextImages, uploaded })
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id: productId, variantId } = await ctx.params

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const url = (body.url ?? '').trim()
  if (!url) return NextResponse.json({ ok: false, message: 'URL gerekli.' }, { status: 400 })

  const loaded = await loadVariant(productId, variantId)
  if ('error' in loaded) {
    return NextResponse.json({ ok: false, message: loaded.error }, { status: loaded.status })
  }

  const { supabase, variant } = loaded
  const nextImages = (((variant.images as string[] | null) ?? []) as string[]).filter((u) => u !== url)

  const { error: saveErr } = await supabase
    .from('product_variants')
    .update({ images: nextImages.length > 0 ? nextImages : null })
    .eq('id', variantId)
    .eq('product_id', productId)

  if (saveErr) {
    return NextResponse.json({ ok: false, message: 'Silinemedi.', details: saveErr.message }, { status: 500 })
  }

  const marker = `/storage/v1/object/public/${BUCKET}/`
  const at = url.indexOf(marker)
  if (at !== -1) {
    const path = decodeURIComponent(url.slice(at + marker.length).split('?')[0])
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([path])
    if (rmErr) console.error('[variants/images] storage silme hatası:', rmErr.message)
  }

  return NextResponse.json({ ok: true, images: nextImages })
}
