import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { order?: unknown; parent_id?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const order = body.order
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ ok: false, message: 'Sıra listesi boş.' }, { status: 400 })
  }

  const parentId =
    body.parent_id === null || body.parent_id === undefined || body.parent_id === ''
      ? null
      : String(body.parent_id)

  const supabase = getSupabaseAdmin()
  const results = await Promise.all(
    order.map((rawId, index) => {
      let q = supabase
        .from('categories')
        .update({ display_order: (index + 1) * 10 })
        .eq('id', String(rawId))
      if (parentId === null) q = q.is('parent_id', null)
      else q = q.eq('parent_id', parentId)
      return q
    })
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return NextResponse.json(
      { ok: false, message: 'Kategori sırası kaydedilemedi.', details: failed.error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, count: order.length })
}
