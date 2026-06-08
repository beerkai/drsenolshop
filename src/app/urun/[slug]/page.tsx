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
import { productLd, breadcrumbLd, toJsonLdScript } from '@/lib/jsonld'
import { getApprovedReviews, getReviewStats, getUserReview } from '@/lib/reviews'
import { getCurrentCustomer } from '@/lib/customer-auth'
import ProductReviews from '@/components/product/ProductReviews'

type Props = { params: Promise<{ slug: string }> }

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/📌\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

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
      <main style={{ backgroundColor: '#15110D', minHeight: '100vh' }}>
        <ProductDetailClient product={product} />

        {description && (
          <section
            className="product-desc-section"
            style={{ backgroundColor: '#1C1814', borderTop: '1px solid rgba(244,240,232,0.06)' }}
          >
            <style>{`
              .product-desc-section {
                padding-top: clamp(40px, 8vw, 64px);
                padding-bottom: clamp(40px, 8vw, 64px);
              }
              @media (max-width: 640px) {
                .product-desc-section {
                  padding-top: clamp(28px, 6vw, 40px);
                  padding-bottom: clamp(28px, 6vw, 40px);
                }
              }
            `}</style>
            <div className="px-responsive" style={{ maxWidth: '760px', margin: '0 auto' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: '#C9A961',
                  textTransform: 'uppercase',
                  margin: '0 0 32px',
                }}
              >
                Ürün Hakkında
              </p>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#B8B0A0',
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  lineHeight: 1.65,
                }}
              >
                {stripHtml(description)
                  .split(/\.\s+/)
                  .filter((s) => s.trim().length > 10)
                  .map((para, i) => (
                    <p key={i} style={{ margin: '0 0 16px' }}>
                      {para.trim().endsWith('.') ? para.trim() : `${para.trim()}.`}
                    </p>
                  ))}
              </div>

              {product.certifications && product.certifications.length > 0 && (
                <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.certifications.map((cert, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        letterSpacing: '0.22em',
                        color: '#C9A961',
                        border: '1px solid rgba(201,169,97,0.25)',
                        padding: '5px 10px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        letterSpacing: '0.15em',
                        color: '#6E665A',
                        border: '1px solid rgba(244,240,232,0.08)',
                        padding: '4px 9px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
          <section
            className="product-related-section"
            style={{ backgroundColor: '#EBE5D8', borderTop: '1px solid rgba(26,23,20,0.08)' }}
          >
            <style>{`
              .product-related-section { padding-top: 64px; padding-bottom: 64px; }
              @media (max-width: 640px) { .product-related-section { padding-top: 40px; padding-bottom: 40px; } }
            `}</style>
            <div className="px-responsive" style={{ maxWidth: '1440px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.3em',
                    color: '#C9A961',
                    textTransform: 'uppercase',
                    margin: '0 0 16px',
                  }}
                >
                  Aynı Aileden
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#1A1714',
                    fontSize: 'clamp(28px, 3.5vw, 44px)',
                    fontWeight: 500,
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Benzer <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#C9A961' }}>ürünler.</span>
                </h2>
              </div>

              <div
                className="related-products-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${relatedProducts.length}, 1fr)`,
                  gap: '1px',
                  background: 'rgba(26,23,20,0.08)',
                  border: '1px solid rgba(26,23,20,0.08)',
                }}
              >
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    categoryOverride={product.category?.name ?? undefined}
                  />
                ))}
              </div>

              <style>{`
                @media (max-width: 640px) {
                  .related-products-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                  }
                }
              `}</style>
            </div>
          </section>
        )}
      </main>
      <Footer variant="product" />
    </>
  )
}
