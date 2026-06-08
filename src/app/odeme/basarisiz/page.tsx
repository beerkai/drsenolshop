import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ödeme Başarısız',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SP = Promise<{ no?: string; oid?: string; reason?: string }>

export default async function OdemeBasarisizPage({ searchParams }: { searchParams: SP }) {
  const { reason, no, oid } = await searchParams
  const orderNumber = no?.trim() || oid?.trim()

  return (
    <>
      <Header />
      <main
        style={{
          background: '#15110D',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(32px, 8vw, 96px) clamp(16px, 4vw, 48px)',
        }}
      >
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#1E1B17',
              border: '1px solid rgba(244,240,232,0.15)',
              margin: '0 auto 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8B0A0" strokeWidth="2" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(10px, 2vw, 11px)',
              letterSpacing: '0.3em',
              color: '#B8B0A0',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            Ödeme Başarısız
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 500,
              color: '#F4F0E8',
              margin: '0 0 24px',
              lineHeight: 1.2,
            }}
          >
            Ödeme tamamlanamadı.
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              lineHeight: 1.7,
              color: '#B8B0A0',
              margin: '0 0 32px',
            }}
          >
            {reason ||
              'Lütfen kart bilgilerinizi kontrol edip tekrar deneyin. Sorun devam ederse bankanızla iletişime geçmeniz gerekebilir.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {orderNumber ? (
              <Link
                href={`/odeme/paytr/${orderNumber}`}
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: '#C9A961',
                  color: '#15110D',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Tekrar Dene
              </Link>
            ) : (
              <Link
                href="/odeme"
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: '#C9A961',
                  color: '#15110D',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Ödemeye Dön
              </Link>
            )}
            <Link
              href="/iletisim"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'transparent',
                color: '#F4F0E8',
                border: '1px solid rgba(244,240,232,0.2)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
