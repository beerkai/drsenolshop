'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Next.js global error boundary — root layout dahil tüm hatalar burada.
// Sentry'ye otomatik raporlanır.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="tr">
      <body style={{ margin: 0, backgroundColor: 'var(--color-ink)', color: 'var(--color-cream)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 16px' }}>
            Bir şeyler ters gitti
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 500, lineHeight: 1.1, margin: '0 0 16px', color: 'var(--color-cream)' }}>
            Beklenmedik bir hata oluştu.
          </h1>
          <p style={{ color: 'var(--color-cream-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '420px', margin: '0 0 28px' }}>
            Üzgünüz, sayfayı yüklerken bir sorun yaşadık. Lütfen tekrar deneyin veya anasayfaya dönün.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '13px 24px',
                backgroundColor: 'var(--color-gold)',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-ink)',
                fontFamily: 'monospace',
                fontSize: '12px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Tekrar Dene
            </button>
            <a
              href="/"
              style={{
                padding: '13px 24px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(244,240,232,0.25)',
                color: 'var(--color-cream)',
                fontFamily: 'monospace',
                fontSize: '12px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Anasayfa
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: '32px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-cream-faint)', letterSpacing: '0.05em' }}>
              ref: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
