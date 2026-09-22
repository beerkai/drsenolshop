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
    <section className="home-goldylium-teaser w-full ed-section-y">
      <style>{`
        .home-goldylium-teaser {
          background-color: var(--color-canvas-cream);
          border-bottom: 1px solid #dfd9cc;
        }
        .home-goldylium-teaser .home-goldylium-teaser__eyebrow {
          color: var(--color-secondary);
        }
        .home-goldylium-teaser .home-goldylium-teaser__title {
          color: var(--color-on-surface);
        }
        .home-goldylium-teaser .home-goldylium-teaser__lede {
          color: #3d3f3e;
        }
        .home-goldylium-teaser .home-goldylium-teaser__cta {
          border-color: #c4bfb2;
          background-color: var(--color-surface-container-lowest);
          color: var(--color-on-surface);
        }
        .home-goldylium-teaser .home-goldylium-teaser__cta:hover {
          border-color: var(--color-honey-amber);
          color: var(--color-secondary);
        }
        .home-goldylium-teaser .home-product-rail__nav button {
          border-color: #c4bfb2;
          background-color: rgb(244 240 232 / 0.96);
          color: var(--color-on-surface);
        }
        .home-goldylium-teaser .home-product-rail__nav button:hover {
          border-color: var(--color-on-surface);
        }
      `}</style>
      <div className="ed-section-inner">
        <div className="ed-section-head mb-space-lg flex flex-col gap-space-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="ed-stack ed-min-w-0">
            <span
              className="home-goldylium-teaser__eyebrow block font-nav-caps text-nav-caps uppercase tracking-[0.16em]"
              lang="en"
            >
              Goldylium
            </span>
            <h2
              className="home-goldylium-teaser__title font-headline-lg text-headline-lg font-light leading-[1.2]"
              lang="en"
            >
              Parfüm seçkisi
            </h2>
            <p className="home-goldylium-teaser__lede max-w-xl font-body-sm text-body-sm leading-relaxed">
              İmza kokular ana bal koleksiyonundan ayrı vitrinde — arama ve ürün sayfaları aynen erişilebilir.
            </p>
          </div>
          <Link
            href={GOLDYLIUM_LANDING_PATH}
            className="home-goldylium-teaser__cta inline-flex shrink-0 items-center justify-center border px-5 py-2.5 font-nav-caps text-nav-caps uppercase tracking-[0.14em] transition-colors"
          >
            Keşfet
          </Link>
        </div>

        <ProductHorizontalRail products={products} sectionKey="goldylium-teaser" />
      </div>
    </section>
  )
}
