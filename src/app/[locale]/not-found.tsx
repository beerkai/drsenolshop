import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '70vh',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dekoratif orbs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-hairline-light) 0%, transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30%',
              right: '-15%',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,192,148,0.06) 0%, transparent 70%)',
            }}
          />
        </div>

        <div
          className="px-margin"
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '720px',
            margin: '0 auto',
            paddingTop: 'clamp(60px, 10vw, 120px)',
            paddingBottom: 'clamp(60px, 10vw, 120px)',
            textAlign: 'center',
          }}
        >
          {/* Lot rozet */}
          <p
            style={{
              fontFamily: 'var(--font-label-spec)',
              fontSize: 'clamp(10px, 2vw, 12px)',
              letterSpacing: '0.3em',
              color: 'var(--color-honey-amber)',
              textTransform: 'uppercase',
              margin: '0 0 24px',
            }}
            lang="en"
          >
            LOT NO. 404 · NOT FOUND
          </p>

          {/* Büyük 404 */}
          <p
            style={{
              fontFamily: 'var(--font-headline-lg)',
              fontSize: 'clamp(120px, 25vw, 240px)',
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: 'var(--color-honey-amber)',
              fontStyle: 'italic',
              margin: '0 0 12px',
              opacity: 0.85,
            }}
          >
            404
          </p>

          <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--color-charcoal-pure)', margin: '0 auto 32px' }} />

          <h1
            style={{
              fontFamily: 'var(--font-headline-lg)',
              color: 'var(--color-on-surface)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              margin: '0 0 20px',
            }}
          >
            Aradığın kavanozu{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--color-on-surface-variant)' }}>bulamadık.</span>
          </h1>

          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 40px' }}>
            Bu sayfa kovandan henüz çıkmamış olabilir, ya da farklı bir rafa kaldırılmış.
            Aşağıdaki rotaları öneririz.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: 'clamp(14px, 3vw, 16px) clamp(22px, 5vw, 32px)',
                backgroundColor: 'var(--color-charcoal-pure)',
                color: 'var(--color-surface)',
                fontFamily: 'var(--font-label-spec)',
                fontSize: '11px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                minHeight: '44px',
              }}
            >
              Anasayfa
              <span>→</span>
            </Link>
            <Link
              href="/koleksiyon"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: 'clamp(14px, 3vw, 16px) clamp(22px, 5vw, 32px)',
                border: '1px solid var(--color-hairline-light)',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-label-spec)',
                fontSize: '11px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                minHeight: '44px',
              }}
            >
              Koleksiyonu Keşfet
            </Link>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-label-spec)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              color: 'var(--color-outline)',
              textTransform: 'uppercase',
              marginTop: '48px',
            }}
            lang="en"
          >
            EST. 1985 · SAITABAT, BURSA
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
