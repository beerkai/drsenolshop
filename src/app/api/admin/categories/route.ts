// ═══════════════════════════════════════════════════════════════
// /api/admin/categories
// ─ GET  : tüm kategoriler (pasifler dahil, ürün sayılarıyla)
// ─ POST : yeni kategori
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { listCategoriesAdmin } from '@/lib/admin-data'
import { getSupabaseAdmin } from '@/lib/supabase'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const categories = await listCategoriesAdmin()
  return NextResponse.json({ ok: true, categories })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: {
    name?: string
    slug?: string
    description?: string
    parent_id?: string | null
    image_url?: string
    is_active?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  const slug = (body.slug ?? '').trim().toLowerCase()

  if (name.length < 2) {
    return NextResponse.json({ ok: false, message: 'Kategori adı en az 2 karakter olmalı.' }, { status: 400 })
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { ok: false, message: 'Slug yalnızca küçük harf, rakam ve tire içerebilir.' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  const { data: clash } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (clash) {
    return NextResponse.json({ ok: false, message: 'Bu slug zaten kullanılıyor.' }, { status: 409 })
  }

  // Yeni kategori listenin sonuna eklenir
  const { data: last } = await supabase
    .from('categories')
    .select('display_order')
    .order('display_order', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = ((last?.display_order as number | null) ?? 0) + 10

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description: (body.description ?? '').trim() || null,
      parent_id: body.parent_id || null,
      image_url: (body.image_url ?? '').trim() || null,
      is_active: body.is_active !== false,
      display_order: nextOrder,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { ok: false, message: 'Kategori oluşturulamadı.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: data?.id })
}
