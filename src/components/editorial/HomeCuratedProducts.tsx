import Link from 'next/link'
import type { ProductWithRelations } from '@/types'
import { getProducts } from '@/lib/products'
import ProductHorizontalRail from './ProductHorizontalRail'
import ProductCard from '@/components/ProductCard'

async function loadHamBalSelection(): Promise<ProductWithRelations[]> {
  const { products } = await getProducts({
    categorySlug: 'bal',
    limit: 8,
    orderBy: 'popular',
    inStockOnly: true,
  })
  if (products.length > 0) return products

  const fallback = await getProducts({
    limit: 8,
    orderBy: 'popular',
    inStockOnly: true,
  })
  return fallback.products
}

async function loadSignatureProducts(): Promise<ProductWithRelations[]> {
  const { products } = await getProducts({
    categorySlug: 'signature',
    limit: 8,
    orderBy: 'popular',
    inStockOnly: true,
  })
  return products
}

export default async function HomeCuratedProducts() {
  const [hamBal, signature] = await Promise.all([loadHamBalSelection(), loadSignatureProducts()])

  if (hamBal.length === 0 && signature.length === 0) return null

  return (
    <>
      {hamBal.length > 0 ? (
        <section className="w-full border-b border-hairline-light bg-surface ed-section-y">
          <div className="ed-section-inner">
            <div className="ed-section-head mb-space-lg">
              <div className="ed-stack ed-min-w-0">
                <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
                  Keşfet · Seçki
                </span>
                <h2 className="font-headline-lg text-headline-lg font-light leading-[1.2] text-on-surface">
                  En Çok Tercih Edilenler
                </h2>
              </div>
              <div className="flex flex-col items-start gap-space-sm md:items-end">
                <p className="ed-min-w-0 max-w-sm font-body-sm text-body-sm leading-relaxed text-on-surface-variant md:text-right">
                  Ham bal koleksiyonundan en çok sipariş edilen hasatlar — Saitabat yayla ve orman balları.
                </p>
                <Link
                  href="/kategori/bal"
                  className="shrink-0 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  Tüm ham ballar →
                </Link>
              </div>
            </div>

            <ProductHorizontalRail products={hamBal} />
          </div>
        </section>
      ) : null}

      {signature.length > 0 ? (
        <section className="w-full border-b border-hairline-light bg-surface-container-low ed-section-y">
          <div className="ed-section-inner">
            <div className="ed-section-head mb-space-lg">
              <div className="ed-stack ed-min-w-0">
                <span
                  className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber"
                  lang="en"
                >
                  Signature Series
                </span>
                <h2 className="font-headline-lg text-headline-lg font-light leading-[1.2] text-on-surface" lang="en">
                  Signature Series
                </h2>
              </div>
              <Link
                href="/kategori/signature"
                className="shrink-0 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
                lang="en"
              >
                View collection →
              </Link>
            </div>

            <div className="grid grid-cols-2 items-stretch gap-gutter md:gap-gutter">
              {signature.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
