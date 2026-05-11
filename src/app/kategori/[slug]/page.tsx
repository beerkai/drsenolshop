import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryPageClient from '@/app/koleksiyon/CategoryPageClient'
import { getProducts } from '@/lib/products'
import { getCategoryBySlug, getCategoryWithProductCount } from '@/lib/categories'
import { parseGridSort } from '@/lib/catalog-sort'

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

  const [{ products, total }, allCategories, allProductsResult] = await Promise.all([
    getProducts({
      categorySlug: slug,
      isActive: true,
      inStockOnly,
      limit: 12,
      orderBy: sortBy,
    }),
    getCategoryWithProductCount(),
    getProducts({ isActive: true, limit: 1 }),
  ])

  return (
    <>
      <Header />
      <main style={{ background: '#0A0908', minHeight: '100vh' }}>
        <CategoryHero
          title={category.name}
          description={category.description || undefined}
          totalProducts={total}
          titleLang={isEnglishCategory ? 'en' : 'tr'}
        />
        <Suspense fallback={<div style={{ minHeight: 400, background: '#0A0908' }} aria-hidden />}>
          <CategoryPageClient
            initialProducts={products}
            initialTotal={total}
            categories={allCategories}
            activeCategorySlug={slug}
            totalAllProducts={allProductsResult.total}
            initialInStockOnly={inStockOnly}
            initialSort={sortBy}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
