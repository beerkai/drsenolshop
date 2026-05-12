// ═══════════════════════════════════════════════════════════════
// POST /api/products/by-ids — { ids: string[] } → ürün listesi
// ─ Public (anon RLS açık). Wishlist gibi client-side senaryolar için.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getProductsByIds } from '@/lib/products'

export async function POST(request: Request) {
  let body: { ids?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ products: [], error: 'invalid_json' }, { status: 400 })
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ products: [], error: 'ids_required' }, { status: 400 })
  }

  const ids = body.ids
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100)

  if (ids.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const products = await getProductsByIds(ids)
  return NextResponse.json({ products })
}
