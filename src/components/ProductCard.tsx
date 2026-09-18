// ═══════════════════════════════════════════════════════════════
// Ürün kartı — Editorial Minimal (Stitch koleksiyon lookbook)
// ─ 3:4 portre görsel, hover'da ikinci görsele yumuşak geçiş
// ─ Hairline çerçeve, sıfır köşe yuvarlaklığı, sıfır gölge
// ─ Gövde: kategori (editorial-caption) + spec etiketi (label-spec),
//   ad (body-md), fiyat (price-tag, honey-amber) + sağ caption
//
// Referans: design/stitch-export/.../dr._enol_koleksiyon_hasatlar/code.html
// ═══════════════════════════════════════════════════════════════

'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithRelations } from '@/types'
import {
  formatPrice,
  getProductImages,
  getProductStartingPrice,
  getVariantStock,
} from '@/types'

interface ProductCardProps {
  product: ProductWithRelations
  /** Kategori etiketini elle geçmek için (ör. alt kategori adı) */
  categoryOverride?: string
  /** Sağ üst spec etiketi — ileride CMS/ürün alanından gelecek */
  specLabel?: string
  /** Fiyatın altındaki sağ caption (Stitch: "Tek Hasat") */
  footnote?: string
  priority?: boolean
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
}: ProductCardProps) {
  const images = getProductImages(product)
  const primary = images[0] ?? null
  const secondary = images[1] ?? null
  const price = getProductStartingPrice(product)
  const category = categoryOverride ?? product.category?.name ?? 'Koleksiyon'
  const inStock = isInStock(product)

  return (
    <article className="group relative flex flex-col border border-hairline-light bg-surface-container-lowest">
      <Link href={`/urun/${product.slug}`} className="flex flex-1 flex-col">
        {/* Görsel — 3:4 portre, hover'da ikinci kareye geçiş */}
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-surface-container-low">
          {primary ? (
            <Image
              src={primary}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 33vw, 25vw"
              className={
                secondary
                  ? 'object-cover transition-opacity duration-500 ease-out group-hover:opacity-0'
                  : 'object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]'
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

          {/* Rozetler */}
          {product.badge ? (
            <span className="absolute left-2.5 top-2.5 bg-charcoal-pure/85 px-2 py-0.5 font-label-spec text-[10px] uppercase tracking-[0.08em] text-surface">
              {product.badge}
            </span>
          ) : null}

          {!inStock ? (
            <span className="absolute right-2.5 top-2.5 border border-hairline-light bg-surface-container-lowest/90 px-1.5 py-0.5 font-label-spec text-[10px] uppercase tracking-wider text-on-surface">
              Tükendi
            </span>
          ) : secondary ? (
            <span className="absolute right-2.5 top-2.5 bg-surface/90 px-1.5 py-0.5 font-label-spec text-[10px] uppercase tracking-widest text-charcoal-pure opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              1/2
            </span>
          ) : null}
        </div>

        {/* Gövde */}
        <div className="flex flex-1 flex-col justify-between p-3.5">
          <div className="ed-min-w-0">
            <div className="mb-1 flex items-center justify-between gap-space-sm font-editorial-caption text-editorial-caption uppercase text-on-surface-variant">
              <span className="ed-caption-truncate">{category}</span>
              {specLabel ? (
                <span className="shrink-0 font-label-spec text-label-spec text-honey-amber">
                  {specLabel}
                </span>
              ) : null}
            </div>
            <h3 className="font-body-md text-body-md font-normal leading-snug text-on-surface">
              {product.name}
            </h3>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-space-sm pt-3">
            {price ? (
              <span className="font-price-tag text-price-tag font-medium text-honey-amber">
                {formatPrice(price.current)}
              </span>
            ) : (
              <span className="font-label-spec text-label-spec uppercase text-on-surface-variant">
                Varyantta
              </span>
            )}
            {footnote ? (
              <span className="shrink-0 font-editorial-caption text-editorial-caption uppercase tracking-wider text-on-surface-variant">
                {footnote}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
