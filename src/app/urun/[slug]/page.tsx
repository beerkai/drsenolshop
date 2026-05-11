import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGallery from '@/components/ProductGallery'
import ProductActions from '@/components/ProductActions'
import ProductCard from '@/components/ProductCard'
import { getProductBySlug, getProductsByCategory } from '@/lib/products'
import {
  getProductImages,
  getProductDescription,
  getProductMetaTitle,
  getProductMetaDescription,
  getProductImage,
} from '@/types'

type Props = { params: Promise<{ slug: string }> }

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
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

  const images = getProductImages(product)
  const description = getProductDescription(product)

  const related = product.category?.slug
    ? await getProductsByCategory(product.category.slug, { limit: 4 })
    : []
  const relatedProducts = related.filter(p => p.id !== product.id).slice(0, 3)

  return (
    <>
      <Header />
      <main>

        {/* Breadcrumb */}
        <div style={{ backgroundColor: '#0A0908', borderBottom: '1px solid rgba(244,240,232,0.05)' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '14px', paddingBottom: '14px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 10px' }}>
              {[
                { label: 'Anasayfa', href: '/' },
                { label: 'Koleksiyon', href: '/koleksiyon' },
                ...(product.category ? [{ label: product.category.name, href: `/kategori/${product.category.slug}` }] : []),
              ].map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link href={crumb.href} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                  <span style={{ color: 'rgba(244,240,232,0.15)', fontSize: '10px' }}>·</span>
                </span>
              ))}
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#C9A961', textTransform: 'uppercase' }}>
                {product.name.length > 32 ? product.name.slice(0, 32) + '…' : product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Ana ürün bölümü */}
        <section className="product-main-section" style={{ backgroundColor: '#0A0908' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-layout">
              {/* Galeri */}
              <ProductGallery images={images} productName={product.name} />

              {/* Aksiyonlar — masaüstünde sticky */}
              <div className="product-actions-col">
                <ProductActions product={product} />
              </div>
            </div>
          </div>

          <style>{`
            .product-main-section {
              padding-top: 48px;
              padding-bottom: 80px;
            }
            .product-layout {
              display: grid;
              grid-template-columns: 58% 1fr;
              gap: 56px;
              align-items: start;
            }
            .product-actions-col {
              position: sticky;
              top: 108px;
            }
            @media (max-width: 768px) {
              .product-main-section {
                padding-top: 24px;
                padding-bottom: 48px;
              }
              .product-layout {
                grid-template-columns: 1fr;
                gap: 28px;
              }
              .product-actions-col {
                position: static;
              }
            }
          `}</style>
        </section>

        {/* Ürün açıklaması */}
        {description && (
          <section className="product-desc-section" style={{ backgroundColor: '#141210', borderTop: '1px solid rgba(244,240,232,0.06)' }}>
            <style>{`
              .product-desc-section { padding-top: 64px; padding-bottom: 64px; }
              @media (max-width: 640px) { .product-desc-section { padding-top: 40px; padding-bottom: 40px; } }
            `}</style>
            <div className="px-responsive" style={{ maxWidth: '760px', margin: '0 auto' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 32px' }}>
                Ürün Hakkında
              </p>
              <div style={{ fontFamily: 'var(--font-sans)', color: '#B8B0A0', fontSize: '15px', lineHeight: 1.85 }}>
                {stripHtml(description).split(/\.\s+/).filter(s => s.trim().length > 10).map((para, i) => (
                  <p key={i} style={{ margin: '0 0 16px' }}>{para.trim().endsWith('.') ? para.trim() : para.trim() + '.'}</p>
                ))}
              </div>

              {/* Sertifikalar */}
              {product.certifications && product.certifications.length > 0 && (
                <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.certifications.map((cert, i) => (
                    <span key={i} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#C9A961', border: '1px solid rgba(201,169,97,0.25)', padding: '5px 10px', textTransform: 'uppercase' }}>
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Ürün etiketi */}
              {product.tags && product.tags.length > 0 && (
                <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.tags.map((tag, i) => (
                    <span key={i} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.15em', color: '#6E665A', border: '1px solid rgba(244,240,232,0.08)', padding: '4px 9px', textTransform: 'uppercase' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* İlgili ürünler */}
        {relatedProducts.length > 0 && (
          <section className="product-related-section" style={{ backgroundColor: '#EBE5D8', borderTop: '1px solid rgba(26,23,20,0.08)' }}>
            <style>{`
              .product-related-section { padding-top: 64px; padding-bottom: 64px; }
              @media (max-width: 640px) { .product-related-section { padding-top: 40px; padding-bottom: 40px; } }
            `}</style>
            <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Aynı Aileden
                </p>
                <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#1A1714', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
                  Benzer{' '}
                  <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#C9A961' }}>ürünler.</span>
                </h2>
              </div>

              <div className="related-products-grid"
                style={{ display: 'grid', gridTemplateColumns: `repeat(${relatedProducts.length}, 1fr)`, gap: '1px', background: 'rgba(26,23,20,0.08)', border: '1px solid rgba(26,23,20,0.08)' }}>
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} categoryOverride={product.category?.name ?? undefined} />
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
      <Footer />
    </>
  )
}
