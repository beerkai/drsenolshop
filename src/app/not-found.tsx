import Link from 'next/link'
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
          backgroundColor: '#0A0908',
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
              background: 'radial-gradient(circle, rgba(201,169,97,0.10) 0%, transparent 60%)',
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
          className="px-responsive"
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
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: 'clamp(10px, 2vw, 12px)',
              letterSpacing: '0.3em',
              color: '#C9A961',
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
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(120px, 25vw, 240px)',
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: '#C9A961',
              fontStyle: 'italic',
              margin: '0 0 12px',
              opacity: 0.85,
            }}
          >
            404
          </p>

          <div style={{ width: '60px', height: '1px', backgroundColor: '#C9A961', margin: '0 auto 32px' }} />

          <h1
            style={{
              fontFamily: 'var(--font-cormorant), serif',
              color: '#F4F0E8',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              margin: '0 0 20px',
            }}
          >
            Aradığın kavanozu{' '}
            <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>bulamadık.</span>
          </h1>

          <p style={{ color: '#B8B0A0', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 40px' }}>
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
                backgroundColor: '#C9A961',
                color: '#0A0908',
                fontFamily: 'var(--font-jetbrains), monospace',
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
                border: '1px solid rgba(244,240,232,0.2)',
                color: '#F4F0E8',
                fontFamily: 'var(--font-jetbrains), monospace',
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
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px',
              letterSpacing: '0.22em',
              color: '#6E665A',
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
