'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductWithRelations } from '@/types'
import ProductCard from '@/components/ProductCard'

interface ProductHorizontalRailProps {
  products: ProductWithRelations[]
}

export default function ProductHorizontalRail({ products }: ProductHorizontalRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    const step = Math.min(el.clientWidth * 0.85, 360)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="home-product-rail relative">
      <style>{`
        .home-product-rail__track {
          display: flex;
          gap: var(--spacing-gutter);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .home-product-rail__track::-webkit-scrollbar {
          display: none;
        }
        .home-product-rail__slide {
          flex: 0 0 min(72vw, 280px);
          scroll-snap-align: start;
        }
        @media (min-width: 48rem) {
          .home-product-rail__slide {
            flex-basis: min(32vw, 300px);
          }
        }
      `}</style>

      <div className="relative">
        <div className="home-product-rail__nav pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between md:flex">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="pointer-events-auto ml-[-0.25rem] flex h-10 w-10 items-center justify-center border border-hairline-light bg-surface/95 text-on-surface transition-colors hover:border-on-surface"
            aria-label="Önceki ürünler"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="pointer-events-auto mr-[-0.25rem] flex h-10 w-10 items-center justify-center border border-hairline-light bg-surface/95 text-on-surface transition-colors hover:border-on-surface"
            aria-label="Sonraki ürünler"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div ref={scrollerRef} className="home-product-rail__track">
        {products.map((product, i) => (
          <div key={product.id} className="home-product-rail__slide">
            <ProductCard product={product} priority={i < 2} footnote={product.is_new ? 'Yeni' : undefined} />
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
