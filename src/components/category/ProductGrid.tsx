'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import type { ProductWithRelations } from '@/types'
import type { SortOption } from './SortDropdown'

interface ProductGridProps {
  initialProducts: ProductWithRelations[]
  initialTotal: number
  categorySlug: string | null
  inStockOnly: boolean
  sortBy: SortOption
  isMobile: boolean
  onTotalChange?: (total: number) => void
}

const PAGE_SIZE = 12

export default function ProductGrid({
  initialProducts,
  initialTotal,
  categorySlug,
  inStockOnly,
  sortBy,
  isMobile,
  onTotalChange,
}: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialTotal)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(
      `/api/products?` +
        new URLSearchParams({
          ...(categorySlug ? { category: categorySlug } : {}),
          inStock: inStockOnly ? '1' : '0',
          sort: sortBy,
          limit: String(PAGE_SIZE),
          offset: '0',
        })
    )
      .then((r) => r.json())
      .then((data: { products?: ProductWithRelations[]; total?: number }) => {
        if (cancelled) return
        const list = data.products || []
        const t = data.total ?? 0
        setProducts(list)
        setTotal(t)
        setHasMore(list.length < t)
        onTotalChange?.(t)
      })
      .catch((err) => {
        if (!cancelled) console.error('Ürünler yüklenemedi:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categorySlug, inStockOnly, sortBy, onTotalChange])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/products?` +
          new URLSearchParams({
            ...(categorySlug ? { category: categorySlug } : {}),
            inStock: inStockOnly ? '1' : '0',
            sort: sortBy,
            limit: String(PAGE_SIZE),
            offset: String(products.length),
          })
      )
      const data = (await res.json()) as { products?: ProductWithRelations[]; total?: number }
      const newProducts: ProductWithRelations[] = data.products || []
      const t = data.total ?? 0
      setProducts((prev) => {
        const merged = [...prev, ...newProducts]
        setHasMore(merged.length < t)
        return merged
      })
      onTotalChange?.(t)
    } catch (err) {
      console.error('Daha fazla yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }, [categorySlug, inStockOnly, sortBy, products.length, loading, hasMore, onTotalChange])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          void loadMore()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  return (
    <div lang="tr">
      <div
        style={{
          paddingBottom: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            color: '#B8B0A0',
            margin: 0,
          }}
        >
          {total} ürün gösteriliyor
        </p>
      </div>

      {products.length === 0 && !loading ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            color: '#6E665A',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '20px',
              fontStyle: 'italic',
              margin: '0 0 8px',
            }}
          >
            Bu filtrelerle ürün bulunamadı.
          </p>
          <p style={{ fontSize: '12px' }}>Filtreleri temizleyip tekrar deneyin.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(244,240,232,0.08)',
            border: '1px solid rgba(244,240,232,0.08)',
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryOverride={product.category?.name || undefined}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div
          ref={sentinelRef}
          style={{
            padding: '40px 0',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              color: '#6E665A',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {loading ? '↓ Yükleniyor...' : '↓ Daha fazla'}
          </p>
        </div>
      )}
    </div>
  )
}
