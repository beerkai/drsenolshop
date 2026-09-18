// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/products/[id]
// ─ Yayın durumu, fiyat/KDV, stok, varyant stokları
// ─ İçerik: ad, slug, açıklamalar, kategori, rozet, etiketler
// ─ Görseller (sıralı URL listesi) ve katalog sırası
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface PatchBody {
  is_active?: boolean
  is_featured?: boolean
  is_new?: boolean
  base_price?: number | null
  stock_quantity?: number | null
  tax_rate?: number
  variant_stocks?: Record<string, string | number>

  // İçerik
  name?: string
  slug?: string
  short_desc?: string | null
  long_desc?: string | null
  category_id?: string | null
  badge?: string | null
  tags?: string[]
  sku?: string | null
  weight_grams?: number | null
  meta_title?: string | null
  meta_description?: string | null

  // Görseller ve sıra
  images?: string[]
  display_order?: number | null
}

/** Boş string'i null'a çevirir, aksi halde kırpar */
function nullableText(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const productUpdates: Record<string, unknown> = {}
  if (body.is_active !== undefined) productUpdates.is_active = body.is_active
  if (body.is_featured !== undefined) productUpdates.is_featured = body.is_featured
  if (body.is_new !== undefined) productUpdates.is_new = body.is_new
  if (body.base_price !== undefined) productUpdates.base_price = body.base_price
  if (body.stock_quantity !== undefined) productUpdates.stock_quantity = body.stock_quantity
  if (body.tax_rate !== undefined) {
    if (typeof body.tax_rate !== 'number' || body.tax_rate < 0 || body.tax_rate > 100) {
      return NextResponse.json({ ok: false, message: 'Geçersiz tax_rate (0-100 arası olmalı)' }, { status: 400 })
    }
    productUpdates.tax_rate = body.tax_rate
  }

  // ─── İçerik alanları ───────────────────────────────────────
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (name.length < 2) {
      return NextResponse.json({ ok: false, message: 'Ürün adı en az 2 karakter olmalı.' }, { status: 400 })
    }
    productUpdates.name = name
  }

  if (body.slug !== undefined) {
    const slug = body.slug.trim().toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { ok: false, message: 'Slug yalnızca küçük harf, rakam ve tire içerebilir.' },
        { status: 400 }
      )
    }
    // Aynı slug başka üründe kullanılıyorsa reddet — /urun/[slug] çakışmasın
    const { data: clash } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle()
    if (clash) {
      return NextResponse.json({ ok: false, message: 'Bu slug başka bir üründe kullanılıyor.' }, { status: 409 })
    }
    productUpdates.slug = slug
  }

  if (body.short_desc !== undefined) productUpdates.short_desc = nullableText(body.short_desc)
  if (body.long_desc !== undefined) productUpdates.long_desc = nullableText(body.long_desc)
  if (body.badge !== undefined) productUpdates.badge = nullableText(body.badge)
  if (body.sku !== undefined) productUpdates.sku = nullableText(body.sku)
  if (body.meta_title !== undefined) productUpdates.meta_title = nullableText(body.meta_title)
  if (body.meta_description !== undefined) productUpdates.meta_description = nullableText(body.meta_description)

  if (body.category_id !== undefined) {
    productUpdates.category_id = body.category_id === '' ? null : body.category_id
  }

  if (body.weight_grams !== undefined) {
    const n = body.weight_grams === null ? null : Number(body.weight_grams)
    if (n !== null && (!Number.isFinite(n) || n < 0)) {
      return NextResponse.json({ ok: false, message: 'Geçersiz ağırlık.' }, { status: 400 })
    }
    productUpdates.weight_grams = n
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return NextResponse.json({ ok: false, message: 'Etiketler dizi olmalı.' }, { status: 400 })
    }
    productUpdates.tags = body.tags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0)
      .slice(0, 20)
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return NextResponse.json({ ok: false, message: 'Görseller dizi olmalı.' }, { status: 400 })
    }
    const images = body.images.map((u) => String(u).trim()).filter((u) => u.length > 0)
    productUpdates.images = images
    // Kapak görseli listenin ilk elemanıdır — legacy image_url alanı senkron tutulur
    productUpdates.image_url = images[0] ?? null
  }

  if (body.display_order !== undefined) {
    const n = body.display_order === null ? null : Number(body.display_order)
    if (n !== null && !Number.isFinite(n)) {
      return NextResponse.json({ ok: false, message: 'Geçersiz sıra değeri.' }, { status: 400 })
    }
    productUpdates.display_order = n
  }

  if (Object.keys(productUpdates).length > 0) {
    const { error: prodErr } = await supabase.from('products').update(productUpdates).eq('id', id)
    if (prodErr) {
      return NextResponse.json({ ok: false, message: 'Ürün güncellenemedi', details: prodErr.message }, { status: 500 })
    }
  }

  // Varyant stokları
  if (body.variant_stocks && typeof body.variant_stocks === 'object') {
    const tasks: Promise<unknown>[] = []
    for (const [variantId, value] of Object.entries(body.variant_stocks)) {
      const num = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(num) || num < 0) continue
      tasks.push(
        (async () => {
          await supabase
            .from('product_variants')
            .update({ stock_quantity: num })
            .eq('id', variantId)
            .eq('product_id', id)
        })()
      )
    }
    if (tasks.length > 0) await Promise.all(tasks)
  }

  return NextResponse.json({ ok: true })
}
