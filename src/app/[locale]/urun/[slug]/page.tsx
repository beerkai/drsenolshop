import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import { getProductBySlug, getProductsByCategory } from '@/lib/products'
import {
  getProductDescription,
  getProductMetaTitle,
  getProductMetaDescription,
  getProductImage,
} from '@/types'
import { productDescriptionParagraphs } from '@/lib/product-description'
import { productLd, breadcrumbLd, toJsonLdScript } from '@/lib/jsonld'
import { getApprovedReviews, getReviewStats, getUserReview } from '@/lib/reviews'
import { getCurrentCustomer } from '@/lib/customer-auth'
import ProductReviews from '@/components/product/ProductReviews'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Ürün Bulunamadı' }
  const image = getProductImage(product)
  return {
    title: getProductMetaTitle(product),
    description: getProductMetaDescription(product),
    openGraph: { images: image ? [{ url: image }] : [] },
  }
}

export default async function UrunPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const description = getProductDescription(product)
  const descriptionParagraphs = productDescriptionParagraphs(description)

  const [related, reviews, stats, me] = await Promise.all([
    product.category?.slug
      ? getProductsByCategory(product.category.slug, { limit: 4 })
      : Promise.resolve([]),
    getApprovedReviews(product.id, 20),
    getReviewStats(product.id),
    getCurrentCustomer(),
  ])
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 3)
  const userReview = me ? await getUserReview(product.id, me.user.id) : null

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Koleksiyon', href: '/koleksiyon' },
  ]
  if (product.category?.slug && product.category?.name) {
    breadcrumbs.push({ label: product.category.name, href: `/kategori/${product.category.slug}` })
  }
  breadcrumbs.push({ label: product.name, href: `/urun/${product.slug}` })

  // Product JSON-LD'ye AggregateRating ekle (varsa)
  const productSchema = productLd(product) as Record<string, unknown>
  if (stats && stats.review_count > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.avg_rating.toFixed(2),
      reviewCount: stats.review_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript([productSchema, breadcrumbLd(breadcrumbs)]) }}
      />
      <main className="min-h-screen w-full bg-surface">
        <ProductDetailClient product={product} />

        {descriptionParagraphs.length > 0 && (
          <section className="w-full border-t border-hairline-light bg-surface-container-low ed-section-y">
            <div className="ed-section-inner">
              <div className="mx-auto max-w-[760px]">
                <p className="mb-space-lg font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
                  Ürün Hakkında
                </p>

                <div className="ed-prose font-body-lg text-body-lg text-on-surface-variant">
                  {descriptionParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {product.certifications && product.certifications.length > 0 && (
                  <div className="mt-space-lg flex flex-wrap gap-space-sm">
                    {product.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="border border-hairline-light px-2.5 py-1 font-label-spec text-label-spec uppercase tracking-[0.12em] text-honey-amber"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-space-md flex flex-wrap gap-space-sm">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="border border-hairline-light px-2 py-1 font-editorial-caption text-editorial-caption uppercase tracking-[0.1em] text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <ProductReviews
          productId={product.id}
          reviews={reviews}
          stats={stats}
          isLoggedIn={Boolean(me)}
          userHasReview={Boolean(userReview)}
        />

        {relatedProducts.length > 0 && (
          <section className="w-full border-t border-hairline-light bg-surface ed-section-y">
            <div className="ed-section-inner">
              <div className="ed-section-head">
                <div>
                  <span className="mb-1 block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
                    Aynı Aileden
                  </span>
                  <h2 className="font-headline-lg text-headline-lg font-light text-on-surface">
                    Benzer ürünler
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    categoryOverride={product.category?.name ?? undefined}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
