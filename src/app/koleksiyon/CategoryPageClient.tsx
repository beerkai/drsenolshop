'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CategoryFilters, { type FilterState } from '@/components/category/CategoryFilters'
import ProductGrid from '@/components/category/ProductGrid'
import SortDropdown, { type SortOption } from '@/components/category/SortDropdown'
import type { ProductWithRelations, Category } from '@/types'
import type { GridSortOption } from '@/lib/catalog-sort'

interface CategoryPageClientProps {
  initialProducts: ProductWithRelations[]
  initialTotal: number
  categories: Array<Category & { product_count?: number; children?: Array<Category & { product_count?: number }> }>
  activeCategorySlug: string | null
  totalAllProducts: number
  initialInStockOnly: boolean
  initialSort: GridSortOption
}

export default function CategoryPageClient({
  initialProducts,
  initialTotal,
  categories,
  activeCategorySlug,
  totalAllProducts,
  initialInStockOnly,
  initialSort,
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

  const [filterOpen, setFilterOpen] = useState(false)

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

  const mainCategories = categories.filter((c) => !c.parent_id)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {isMobile && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(244,240,232,0.08)',
            background: '#0A0908',
          }}
        >
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            lang="tr"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: '1px solid rgba(244,240,232,0.2)',
              color: '#F4F0E8',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              padding: '10px 14px',
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="10" y2="18" />
            </svg>
            Filtrele
            {filters.inStockOnly && (
              <>
                <span style={{ color: '#C9A961' }}>·</span>
                <span style={{ color: '#C9A961', fontWeight: 500 }}>1</span>
              </>
            )}
          </button>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <CategoryFilters
          categories={mainCategories}
          activeCategorySlug={activeCategorySlug}
          totalProducts={totalAllProducts}
          filters={filters}
          onFiltersChange={setFilters}
          isMobile={isMobile}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          resultCount={resultCount}
        />

        <div
          style={{
            flex: 1,
            padding: isMobile ? '20px' : '28px 32px',
            minHeight: '600px',
          }}
        >
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '8px',
              }}
            >
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          )}

          <ProductGrid
            key={pathname}
            initialProducts={initialProducts}
            initialTotal={initialTotal}
            categorySlug={activeCategorySlug}
            inStockOnly={filters.inStockOnly}
            sortBy={sortBy}
            isMobile={isMobile}
            onTotalChange={handleTotalChange}
          />
        </div>
      </div>
    </div>
  )
}
