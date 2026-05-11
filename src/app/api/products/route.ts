import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'
import { parseGridSort } from '@/lib/catalog-sort'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const categorySlug = searchParams.get('category') || undefined
  const inStockOnly = searchParams.get('inStock') === '1'
  const sortBy = parseGridSort(searchParams.get('sort'))
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    const result = await getProducts({
      categorySlug,
      inStockOnly,
      orderBy: sortBy,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/products] Hata:', err)
    return NextResponse.json(
      { products: [], total: 0, error: 'İç sunucu hatası' },
      { status: 500 }
    )
  }
}
