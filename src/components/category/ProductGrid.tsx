'use client'

// ═══════════════════════════════════════════════════════════════
// Ürün ızgarası — Editorial Minimal (Stitch koleksiyon lookbook)
// ─ Görsel: 2 / md:3 / lg:4 sütun, gap-3 (Stitch: tight 12px)
// ─ Veri akışı DEĞİŞMEDİ: /api/products + IntersectionObserver ile
//   sonsuz kaydırma, aynı parametreler ve sayfa boyutu.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { ProductWithRelations } from '@/types'
import type { SortOption } from './SortDropdown'
import { useProductLabels } from '@/lib/product-labels-context'

interface ProductGridProps {
  initialProducts: ProductWithRelations[]
  initialTotal: number
  categorySlug: string | null
  inStockOnly: boolean
  sortBy: SortOption
  isMobile?: boolean
  onTotalChange?: (total: number) => void
}

const PAGE_SIZE = 12

export default function ProductGrid({
  initialProducts,
  initialTotal,
  categorySlug,
  inStockOnly,
  sortBy,
  onTotalChange,
}: ProductGridProps) {
  const labels = useProductLabels()
  const [products, setProducts] = useState(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialTotal)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const buildQuery = useCallback(
    (offset: number) =>
      `/api/products?` +
      new URLSearchParams({
        ...(categorySlug ? { category: categorySlug } : {}),
        inStock: inStockOnly ? '1' : '0',
        sort: sortBy,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      }),
    [categorySlug, inStockOnly, sortBy]
  )

  // Filtre / sıralama değişince baştan yükle
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(buildQuery(0))
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
        if (!cancelled) console.error('[ProductGrid] ürünler yüklenemedi:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [buildQuery, onTotalChange])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(buildQuery(products.length))
      const data = (await res.json()) as { products?: ProductWithRelations[]; total?: number }
      const next = data.products || []
      const t = data.total ?? 0
      setProducts((prev) => {
        const merged = [...prev, ...next]
        setHasMore(merged.length < t)
        return merged
      })
      onTotalChange?.(t)
    } catch (err) {
      console.error('[ProductGrid] daha fazla yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }, [buildQuery, products.length, loading, hasMore, onTotalChange])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) void loadMore()
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  return (
    <div lang="tr" className="ed-section-inner pb-space-xl">
      {/* Sonuç sayacı — Stitch: ince, sessiz */}
      <p className="mb-space-md font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
        {total} ürün gösteriliyor
      </p>

      {products.length === 0 && !loading ? (
        <div className="border border-hairline-light bg-surface-container-lowest px-space-lg py-space-xl text-center">
          <p className="font-headline-sm text-headline-sm font-light text-on-surface">
            {labels.emptyTitle}
          </p>
          <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
            {labels.emptyHint}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}

      {/* Sonsuz kaydırma sentinel'i */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      {loading ? (
        <p className="mt-space-lg text-center font-label-spec text-label-spec uppercase tracking-widest text-on-surface-variant">
          Yükleniyor…
        </p>
      ) : null}
    </div>
  )
}
