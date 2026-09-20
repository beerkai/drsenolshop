import Link from 'next/link'
import { getProducts } from '@/lib/products'
import { GOLDYLIUM_CATALOG_ROOT_SLUG, GOLDYLIUM_LANDING_PATH } from '@/lib/goldylium-catalog'
import ProductHorizontalRail from './ProductHorizontalRail'

export default async function HomeGoldyliumCatalogTeaser() {
  const { products } = await getProducts({
    categorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG,
    isActive: true,
    inStockOnly: true,
    limit: 4,
    orderBy: 'popular',
  })

  if (products.length === 0) return null

  return (
    <section className="w-full border-b border-hairline-light bg-surface-container-low ed-section-y">
      <div className="ed-section-inner">
        <div className="ed-section-head mb-space-lg flex flex-col gap-space-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="ed-stack ed-min-w-0">
            <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber" lang="en">
              Goldylium
            </span>
            <h2 className="font-display text-display-md text-on-surface" lang="en">
              Parfüm seçkisi
            </h2>
            <p className="max-w-xl font-body-sm text-body-sm text-on-surface-variant">
              İmza kokular ana bal koleksiyonundan ayrı vitrinde — arama ve ürün sayfaları aynen erişilebilir.
            </p>
          </div>
          <Link
            href={GOLDYLIUM_LANDING_PATH}
            className="inline-flex shrink-0 items-center justify-center border border-hairline-light bg-surface px-5 py-2.5 font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-on-surface transition-colors hover:border-honey-amber hover:text-honey-amber"
          >
            Keşfet
          </Link>
        </div>

        <ProductHorizontalRail products={products} sectionKey="goldylium-teaser" />
      </div>
    </section>
  )
}
