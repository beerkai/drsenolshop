// ═══════════════════════════════════════════════════════════════
// /api/admin/categories/[id]
// ─ PATCH  : ad, slug, açıklama, üst kategori, görsel, durum, sıra
// ─ DELETE : yalnızca boş kategori (ürünü ve alt kategorisi yoksa)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function nullableText(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const updates: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (name.length < 2) {
      return NextResponse.json({ ok: false, message: 'Kategori adı en az 2 karakter olmalı.' }, { status: 400 })
    }
    updates.name = name
  }

  if (body.slug !== undefined) {
    const slug = String(body.slug).trim().toLowerCase()
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        { ok: false, message: 'Slug yalnızca küçük harf, rakam ve tire içerebilir.' },
        { status: 400 }
      )
    }
    const { data: clash } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle()
    if (clash) {
      return NextResponse.json({ ok: false, message: 'Bu slug başka bir kategoride kullanılıyor.' }, { status: 409 })
    }
    updates.slug = slug
  }

  if (body.parent_id !== undefined) {
    const parent = body.parent_id ? String(body.parent_id) : null
    if (parent === id) {
      return NextResponse.json({ ok: false, message: 'Kategori kendi üst kategorisi olamaz.' }, { status: 400 })
    }
    if (parent) {
      // Döngü kontrolü: seçilen üst, bu kategorinin altında olmamalı
      const { data: all } = await supabase.from('categories').select('id, parent_id')
      const byId = new Map(
        ((all ?? []) as { id: string; parent_id: string | null }[]).map((c) => [c.id, c.parent_id])
      )
      let cursor: string | null = parent
      let guard = 0
      while (cursor && guard < 50) {
        if (cursor === id) {
          return NextResponse.json(
            { ok: false, message: 'Bu seçim döngü oluşturur (alt kategori üst yapılamaz).' },
            { status: 400 }
          )
        }
        cursor = byId.get(cursor) ?? null
        guard += 1
      }
    }
    updates.parent_id = parent
  }

  if (body.description !== undefined) updates.description = nullableText(body.description)
  if (body.image_url !== undefined) updates.image_url = nullableText(body.image_url)
  if (body.meta_title !== undefined) updates.meta_title = nullableText(body.meta_title)
  if (body.meta_description !== undefined) updates.meta_description = nullableText(body.meta_description)
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)

  if (body.display_order !== undefined) {
    const n = body.display_order === null ? null : Number(body.display_order)
    if (n !== null && !Number.isFinite(n)) {
      return NextResponse.json({ ok: false, message: 'Geçersiz sıra değeri.' }, { status: 400 })
    }
    updates.display_order = n
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from('categories').update(updates).eq('id', id)
  if (error) {
    return NextResponse.json(
      { ok: false, message: 'Kategori güncellenemedi.', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseAdmin()

  // Bağlı ürün veya alt kategori varsa silme — sessiz veri kaybını önler
  const [{ count: productCount }, { count: childCount }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', id),
  ])

  if ((productCount ?? 0) > 0) {
    return NextResponse.json(
      { ok: false, message: `Bu kategoride ${productCount} ürün var. Önce ürünleri taşıyın.` },
      { status: 409 }
    )
  }
  if ((childCount ?? 0) > 0) {
    return NextResponse.json(
      { ok: false, message: `Bu kategorinin ${childCount} alt kategorisi var. Önce onları taşıyın.` },
      { status: 409 }
    )
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ ok: false, message: 'Silinemedi.', details: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
