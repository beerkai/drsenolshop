import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryPageClient from './CategoryPageClient'
import { getProducts } from '@/lib/products'
import { getCategoryWithProductCount } from '@/lib/categories'
import { parseGridSort } from '@/lib/catalog-sort'

export const metadata = {
  title: 'Koleksiyon · Dr. Şenol Shop',
  description: 'Bilimin titizliği, doğanın saflığıyla buluşan tüm ürünlerimiz.',
}

type SP = Promise<{ stock?: string; sort?: string }>

export default async function KoleksiyonPage(props: { searchParams: SP }) {
  const sp = await props.searchParams
  const inStockOnly = sp.stock !== 'all'
  const sortBy = parseGridSort(sp.sort)

  const [{ products, total }, categories, catalogTotal] = await Promise.all([
    getProducts({
      isActive: true,
      inStockOnly,
      limit: 12,
      orderBy: sortBy,
    }),
    getCategoryWithProductCount(),
    getProducts({ isActive: true, limit: 1, offset: 0 }),
  ])

  const totalAllProducts = catalogTotal.total

  return (
    <>
      <Header />
      <main className="min-h-screen w-full bg-surface">
        <CategoryHero
          title="Tüm"
          titleAccent="Koleksiyon"
          titleAccentLang="tr"
          description="Bilimin titizliği, doğanın saflığıyla buluşan tüm ürünlerimiz."
          totalProducts={total}
        />
        <Suspense fallback={<div className="min-h-[400px] bg-surface" aria-hidden />}>
          <CategoryPageClient
            initialProducts={products}
            initialTotal={total}
            categories={categories}
            activeCategorySlug={null}
            totalAllProducts={totalAllProducts}
            initialInStockOnly={inStockOnly}
            initialSort={sortBy}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
