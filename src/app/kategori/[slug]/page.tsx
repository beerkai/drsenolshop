import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryPageClient from '@/app/koleksiyon/CategoryPageClient'
import { getProducts } from '@/lib/products'
import { getCategoryBySlug, getCategoryWithProductCount } from '@/lib/categories'
import { parseGridSort } from '@/lib/catalog-sort'
import {
  GOLDYLIUM_CATALOG_ROOT_SLUG,
  isGoldyliumCatalogSlug,
} from '@/lib/catalog-scope'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) {
    return { title: 'Kategori Bulunamadı · Dr. Şenol Shop' }
  }
  return {
    title: `${category.name} · Dr. Şenol Shop`,
    description: category.description || `${category.name} koleksiyonu`,
  }
}

type SP = Promise<{ stock?: string; sort?: string }>

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SP
}) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const inStockOnly = sp.stock !== 'all'
  const sortBy = parseGridSort(sp.sort)
  const isEnglishCategory = !/[ğüşıöçĞÜŞİÖÇ]/.test(category.name)

  const allCategories = await getCategoryWithProductCount()
  const inPerfume = isGoldyliumCatalogSlug(allCategories, slug)
  const isPerfumeRoot = slug === GOLDYLIUM_CATALOG_ROOT_SLUG

  const [{ products, total }, catalogTotal] = await Promise.all([
    getProducts({
      ...(isPerfumeRoot
        ? { categorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG }
        : { categorySlug: slug }),
      isActive: true,
      inStockOnly,
      limit: 12,
      orderBy: sortBy,
    }),
    inPerfume
      ? getProducts({
          categorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG,
          isActive: true,
          limit: 1,
        })
      : getProducts({
          isActive: true,
          limit: 1,
          excludeCategorySubtreeRootSlug: GOLDYLIUM_CATALOG_ROOT_SLUG,
        }),
  ])

  return (
    <>
      <Header />
      <main className="min-h-screen w-full bg-surface">
        <CategoryHero
          title={category.name}
          description={category.description || undefined}
          totalProducts={total}
          titleLang={isEnglishCategory ? 'en' : 'tr'}
        />
        <Suspense fallback={<div className="min-h-[400px] bg-surface" aria-hidden />}>
          <CategoryPageClient
            initialProducts={products}
            initialTotal={total}
            categories={allCategories}
            activeCategorySlug={slug}
            totalAllProducts={catalogTotal.total}
            initialInStockOnly={inStockOnly}
            initialSort={sortBy}
            catalogScope={inPerfume ? 'perfume' : 'honey'}
            categoryTreeRootSlug={isPerfumeRoot ? GOLDYLIUM_CATALOG_ROOT_SLUG : null}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
