import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'
import { parseGridSort } from '@/lib/catalog-sort'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const categorySlug = searchParams.get('category') || undefined
  const categoryTree = searchParams.get('categoryTree') || undefined
  const excludeGoldylium = searchParams.get('excludeGoldylium') === '1'
  const inStockOnly = searchParams.get('inStock') === '1'
  const sortBy = parseGridSort(searchParams.get('sort'))
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const search = searchParams.get('q')?.trim() || searchParams.get('search')?.trim() || undefined

  try {
    const { GOLDYLIUM_CATALOG_ROOT_SLUG } = await import('@/lib/goldylium-catalog')
    const result = await getProducts({
      categorySlug,
      categorySubtreeRootSlug: categoryTree,
      excludeCategorySubtreeRootSlug:
        !search && !categorySlug && !categoryTree && excludeGoldylium
          ? GOLDYLIUM_CATALOG_ROOT_SLUG
          : undefined,
      inStockOnly,
      orderBy: sortBy,
      limit,
      offset,
      search,
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
