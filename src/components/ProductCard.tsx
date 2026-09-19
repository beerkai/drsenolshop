// ═══════════════════════════════════════════════════════════════
// Ürün kartı — Editorial Minimal (Stitch koleksiyon lookbook)
// ═══════════════════════════════════════════════════════════════

'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithRelations } from '@/types'
import { useProductLabels } from '@/lib/product-labels-context'
import ProductPriceRow from '@/components/product/ProductPriceRow'
import { getProductImages, getProductStartingPrice, getVariantStock } from '@/types'

interface ProductCardProps {
  product: ProductWithRelations
  categoryOverride?: string
  specLabel?: string
  footnote?: string
  priority?: boolean
  /** Signature Series koyu kart stili */
  variant?: 'light' | 'dark'
}

function isInStock(product: ProductWithRelations): boolean {
  const variants = product.variants ?? []
  if (variants.length === 0) return (product.stock_quantity ?? 0) > 0
  return variants.some((v) => v.is_active !== false && getVariantStock(v) > 0)
}

export default function ProductCard({
  product,
  categoryOverride,
  specLabel,
  footnote,
  priority = false,
  variant = 'light',
}: ProductCardProps) {
  const labels = useProductLabels()
  const images = getProductImages(product)
  const primary = images[0] ?? null
  const secondary = images[1] ?? null
  const price = getProductStartingPrice(product)
  const category = categoryOverride ?? product.category?.name ?? 'Koleksiyon'
  const inStock = isInStock(product)
  const isDark = variant === 'dark'

  const shellClass = isDark
    ? 'group relative flex flex-col border border-hairline-subtle/30 bg-charcoal-pure text-surface-container-lowest'
    : 'group relative flex flex-col border border-hairline-light bg-surface-container-lowest'

  const imageBg = isDark ? 'bg-primary-container' : 'bg-surface-container-low'
  const categoryClass = isDark
    ? 'mb-1 flex items-center justify-between gap-space-sm font-editorial-caption text-editorial-caption uppercase text-honey-amber'
    : 'mb-1 flex items-center justify-between gap-space-sm font-editorial-caption text-editorial-caption uppercase text-on-surface-variant'
  const titleClass = isDark
    ? 'font-body-md text-body-md font-normal leading-snug text-surface-container-lowest'
    : 'font-body-md text-body-md font-normal leading-snug text-on-surface'

  return (
    <article className={shellClass}>
      <Link href={`/urun/${product.slug}`} className="flex flex-1 flex-col">
        <div className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden ${imageBg}`}>
          {primary ? (
            <Image
              src={primary}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 33vw, 25vw"
              className={
                secondary
                  ? `object-cover transition-opacity duration-500 ease-out group-hover:opacity-0 ${isDark ? 'opacity-90' : ''}`
                  : `object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] ${isDark ? 'opacity-90' : ''}`
              }
            />
          ) : null}

          {secondary ? (
            <Image
              src={secondary}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            />
          ) : null}

          {product.badge ? (
            <span
              className={
                isDark
                  ? 'absolute left-2.5 top-2.5 bg-honey-amber px-2 py-0.5 font-nav-caps text-[9px] font-semibold uppercase tracking-widest text-charcoal-pure'
                  : 'absolute left-2.5 top-2.5 bg-charcoal-pure/85 px-2 py-0.5 font-label-spec text-[10px] uppercase tracking-[0.08em] text-surface'
              }
            >
              {product.badge}
            </span>
          ) : null}

          {!inStock ? (
            <span className="absolute right-2.5 top-2.5 border border-hairline-light bg-surface-container-lowest/90 px-1.5 py-0.5 font-label-spec text-[10px] uppercase tracking-wider text-on-surface">
              {labels.outOfStock}
            </span>
          ) : secondary ? (
            <span className="absolute right-2.5 top-2.5 bg-surface/90 px-1.5 py-0.5 font-label-spec text-[10px] uppercase tracking-widest text-charcoal-pure opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              1/2
            </span>
          ) : null}
        </div>

        <div className={`flex flex-1 flex-col justify-between p-3.5 ${isDark ? 'bg-charcoal-pure' : ''}`}>
          <div className="ed-min-w-0">
            <div className={categoryClass}>
              <span className="ed-caption-truncate">{category}</span>
              {specLabel ? (
                <span className="shrink-0 font-label-spec text-label-spec text-honey-amber">{specLabel}</span>
              ) : null}
            </div>
            <h3 className={titleClass}>{product.name}</h3>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-space-sm pt-3">
            <ProductPriceRow price={price} placeholder={labels.variantPricePlaceholder} />
            {footnote ? (
              <span
                className={`shrink-0 font-editorial-caption text-editorial-caption uppercase tracking-wider ${
                  isDark ? 'text-honey-amber' : 'text-on-surface-variant'
                }`}
              >
                {footnote}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
