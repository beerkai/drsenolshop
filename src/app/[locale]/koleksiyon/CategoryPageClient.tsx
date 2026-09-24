'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CategoryFilters, { type FilterState } from '@/components/category/CategoryFilters'
import CatalogFilterSortBar from '@/components/category/CatalogFilterSortBar'
import CatalogFilterPanel from '@/components/category/CatalogFilterPanel'
import ProductGrid from '@/components/category/ProductGrid'
import type { SortOption } from '@/components/category/SortDropdown'
import type { ProductWithRelations, Category } from '@/types'
import type { GridSortOption } from '@/lib/catalog-sort'
import {
  GOLDYLIUM_CATALOG_ROOT_SLUG,
  GOLDYLIUM_LANDING_PATH,
  HONEY_CATALOG_PATH,
  honeyFilterCategories,
  perfumeFilterCategories,
} from '@/lib/catalog-scope'

interface CategoryPageClientProps {
  initialProducts: ProductWithRelations[]
  initialTotal: number
  categories: Array<Category & { product_count?: number; children?: Array<Category & { product_count?: number }> }>
  activeCategorySlug: string | null
  totalAllProducts: number
  initialInStockOnly: boolean
  initialSort: GridSortOption
  /** Ana koleksiyon "Tümü" — Kozmetik/Goldylium hariç (arama etkilenmez) */
  excludeGoldyliumFromCatalog?: boolean
  /** Alt kategori ağacı kökü (ör. /goldylium) */
  categoryTreeRootSlug?: string | null
  /**
   * honey: bal kategorileri, kozmetik çipi yok
   * perfume: yalnızca parfüm / kozmetik alt kategorileri
   */
  catalogScope?: 'honey' | 'perfume'
}

export default function CategoryPageClient({
  initialProducts,
  initialTotal,
  categories,
  activeCategorySlug,
  totalAllProducts,
  initialInStockOnly,
  initialSort,
  excludeGoldyliumFromCatalog = false,
  categoryTreeRootSlug = null,
  catalogScope,
}: CategoryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const check = () => setIsMobile(mq.matches)
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])


  const [filters, setFilters] = useState<FilterState>(() => ({
    inStockOnly: initialInStockOnly,
  }))

  const [sortBy, setSortBy] = useState<SortOption>(() => initialSort)

  useEffect(() => {
    setFilters({ inStockOnly: initialInStockOnly })
    setSortBy(initialSort)
  }, [initialInStockOnly, initialSort])

  useEffect(() => {
    const params = new URLSearchParams()
    if (!filters.inStockOnly) {
      params.set('stock', 'all')
    } else {
      params.set('stock', 'in-stock')
    }
    if (sortBy !== 'newest') params.set('sort', sortBy)
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [filters, sortBy, pathname, router])

  const [resultCount, setResultCount] = useState(initialTotal)

  useEffect(() => {
    setResultCount(initialTotal)
  }, [initialTotal])

  const handleTotalChange = useCallback((n: number) => {
    setResultCount(n)
  }, [])

  const scope = catalogScope ?? (excludeGoldyliumFromCatalog ? 'honey' : undefined)
  const filterCategories =
    scope === 'perfume'
      ? perfumeFilterCategories(categories)
      : scope === 'honey'
        ? honeyFilterCategories(categories)
        : categories.filter((c) => !c.parent_id)

  const allHref = scope === 'perfume' ? GOLDYLIUM_LANDING_PATH : HONEY_CATALOG_PATH
  const allSelected =
    scope === 'perfume' &&
    (activeCategorySlug === null || activeCategorySlug === GOLDYLIUM_CATALOG_ROOT_SLUG)

  return (
    <div className="w-full bg-surface">
      {/*
        Stitch koleksiyon: tam genişlik çip şeridi + sağda sıralama,
        altında hairline; ardından tam genişlik lookbook ızgarası.
        (Eski sol sidebar düzeni Editorial Minimal'de yok.)
      */}
      <div className="border-b border-hairline-light">
        {/*
          Çipler ve kontroller AYNI satırı paylaşmaz: kategori sayısı
          arttığında şerit kontrollerin altına giriyordu. Çipler tam
          genişlikte kayar, kontroller altında sağa hizalanır.
        */}
        <div className="ed-section-inner flex flex-col gap-space-sm py-space-sm">
          <div className="min-w-0">
            <CategoryFilters
              categories={filterCategories}
              activeCategorySlug={activeCategorySlug}
              totalProducts={totalAllProducts}
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={resultCount}
              allHref={allHref}
              allSelected={allSelected}
            />
          </div>

          {/* Kontroller: stok filtresi + sıralama (kategoriler navigasyondur, şeritte kalır) */}
          <CatalogFilterSortBar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterPanel={
              <CatalogFilterPanel
                categories={filterCategories}
                activeCategorySlug={activeCategorySlug}
                totalProducts={totalAllProducts}
                allHref={allHref}
                allSelected={allSelected}
              />
            }
          />
        </div>
      </div>

      <div className="pt-space-lg">
        <ProductGrid
          key={pathname}
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          categorySlug={categoryTreeRootSlug ? null : activeCategorySlug}
          categoryTreeRootSlug={categoryTreeRootSlug}
          excludeGoldyliumFromCatalog={excludeGoldyliumFromCatalog}
          inStockOnly={filters.inStockOnly}
          sortBy={sortBy}
          isMobile={isMobile}
          onTotalChange={handleTotalChange}
        />
      </div>
    </div>
  )
}
