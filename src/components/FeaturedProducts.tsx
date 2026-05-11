import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts(6);

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-ink"
      style={{
        paddingTop: '96px',
        paddingBottom: '96px',
        borderTop: '1px solid rgba(244,240,232,0.08)',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '1200px',
          paddingLeft: '48px',
          paddingRight: '48px',
        }}
      >
        <div className="text-center" style={{ marginBottom: '80px' }}>
          <p
            className="font-mono uppercase text-gold"
            style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              marginBottom: '20px',
            }}
          >
            Bölüm IV · Vitrin
          </p>
          <div
            className="bg-gold mx-auto"
            style={{
              width: '60px',
              height: '1px',
              marginBottom: '32px',
            }}
          />
          <h2
            className="font-display text-cream max-md:text-[36px] text-[60px]"
            style={{
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Premium{' '}
            <span
              className="text-gold"
              style={{ fontStyle: 'italic', fontWeight: 300 }}
            >
              koleksiyonumuz.
            </span>
          </h2>
          <p
            className="text-cream-muted mx-auto"
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              maxWidth: '480px',
              marginTop: '32px',
            }}
          >
            Bilimin titizliği, doğanın saflığıyla buluşan altı imza ürün.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-px border border-[rgba(244,240,232,0.08)] bg-[rgba(244,240,232,0.08)] md:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-0 bg-ink">
              <ProductCard
                product={product}
                categoryOverride={product.category?.name || undefined}
              />
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: '64px' }}>
          <Link
            href="/koleksiyon"
            className="hover:border-gold hover:text-gold inline-flex items-center transition-all duration-300"
            style={{
              gap: '12px',
              color: '#F4F0E8',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              border: '1px solid rgba(244,240,232,0.2)',
              padding: '16px 32px',
            }}
          >
            Tüm Koleksiyonu Gör
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
