import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/products';
import ProductCard from './ProductCard';

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts(6);

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="featured-section"
      style={{
        backgroundColor: '#EBE5D8',
        paddingTop: 'clamp(32px, 7vw, 96px)',
        paddingBottom: 'clamp(32px, 7vw, 96px)',
        borderTop: '1px solid rgba(26,23,20,0.08)',
        borderBottom: '1px solid rgba(26,23,20,0.08)',
      }}
    >
      <div
        className="px-responsive"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        {/* Bölüm başlığı */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 7vw, 80px)' }}>
          <p
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(9px, 2vw, 11px)',
              letterSpacing: 'clamp(0.18em, 0.45vw, 0.3em)',
              color: '#C9A961',
              textTransform: 'uppercase',
              marginBottom: '20px',
              margin: '0 0 20px',
            }}
          >
            Bölüm IV · Vitrin
          </p>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: '#C9A961',
              margin: '0 auto 32px',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: '#1A1714',
              fontSize: 'clamp(28px, 5.5vw, 60px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Premium{' '}
            <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>
              koleksiyonumuz.
            </span>
          </h2>
          <p
            style={{
              color: '#6B6258',
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              lineHeight: 1.7,
              maxWidth: '480px',
              margin: 'clamp(20px, 5vw, 32px) auto 0',
            }}
          >
            Bilimin titizliği, doğanın saflığıyla buluşan altı imza ürün.
          </p>
        </div>

        {/* GRID — Inline style ile responsive, Tailwind class kullanma */}
        <div
          className="featured-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(26,23,20,0.08)',
            border: '1px solid rgba(26,23,20,0.08)',
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryOverride={product.category?.name || undefined}
            />
          ))}
        </div>

        {/* Responsive media queries inline */}
        <style>{`
          @media (max-width: 1024px) {
            .featured-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 640px) {
            .featured-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .featured-section {
              padding-top: 36px !important;
              padding-bottom: 40px !important;
            }
          }
          @media (min-width: 641px) and (max-width: 1023px) {
            .featured-section {
              padding-top: clamp(40px, 6vw, 72px) !important;
              padding-bottom: clamp(40px, 6vw, 72px) !important;
            }
          }
          @media (max-width: 400px) {
            .featured-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Alt CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(28px, 6vw, 64px)' }}>
          <Link
            href="/koleksiyon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              color: '#1A1714',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(10px, 2vw, 11px)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid rgba(26,23,20,0.2)',
              padding: 'clamp(14px, 3vw, 16px) clamp(22px, 5vw, 32px)',
              minHeight: '44px',
              transition: 'all 0.3s',
            }}
          >
            Tüm Koleksiyonu Gör
            <span style={{ fontSize: '14px' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
