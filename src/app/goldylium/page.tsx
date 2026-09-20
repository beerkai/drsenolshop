import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryPageClient from '@/app/koleksiyon/CategoryPageClient'
import { getProducts } from '@/lib/products'
import { getCategoryBySlug, getCategoryWithProductCount } from '@/lib/categories'
import { parseGridSort } from '@/lib/catalog-sort'
import { GOLDYLIUM_CATALOG_ROOT_SLUG } from '@/lib/goldylium-catalog'

export const metadata = {
  title: 'Goldylium Parfüm · Dr. Şenol Shop',
  description:
    'Goldylium imza kokuları — kadın, erkek ve unisex parfüm seçkisi. Apiterapi mirasından ilham alan editoryal kozmetik vitrini.',
}

type SP = Promise<{ stock?: string; sort?: string }>

export default async function GoldyliumPage(props: { searchParams: SP }) {
  const sp = await props.searchParams
  const inStockOnly = sp.stock !== 'all'
  const sortBy = parseGridSort(sp.sort)

  const category = await getCategoryBySlug(GOLDYLIUM_CATALOG_ROOT_SLUG)

  const [{ products, total }, allCategories, treeTotal] = await Promise.all([
    getProducts({
      categorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG,
      isActive: true,
      inStockOnly,
      limit: 12,
      orderBy: sortBy,
    }),
    getCategoryWithProductCount(),
    getProducts({
      categorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG,
      isActive: true,
      limit: 1,
    }),
  ])

  const description =
    category?.description ||
    'Goldylium parfüm koleksiyonu — Saitabat mirasından doğan, laboratuvar titizliğiyle şişelenmiş imza kokular.'

  return (
    <>
      <Header />
      <main className="min-h-screen w-full bg-surface">
        <CategoryHero
          title="Goldylium"
          titleAccent="Parfüm"
          titleAccentLang="en"
          titleLang="en"
          description={description}
          totalProducts={total}
        />
        <Suspense fallback={<div className="min-h-[400px] bg-surface" aria-hidden />}>
          <CategoryPageClient
            initialProducts={products}
            initialTotal={total}
            categories={allCategories}
            activeCategorySlug={GOLDYLIUM_CATALOG_ROOT_SLUG}
            totalAllProducts={treeTotal.total}
            initialInStockOnly={inStockOnly}
            initialSort={sortBy}
            categoryTreeRootSlug={GOLDYLIUM_CATALOG_ROOT_SLUG}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
