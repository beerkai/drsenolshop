'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0908',
        color: '#F4F0E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '520px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: '#C8472D',
            textTransform: 'uppercase',
            margin: '0 0 14px',
          }}
        >
          Beklenmedik Bir Sorun
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            color: '#F4F0E8',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 500,
            lineHeight: 1.1,
            margin: '0 0 20px',
          }}
        >
          Bir şeyler{' '}
          <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>ters gitti.</span>
        </h1>
        <p style={{ color: '#B8B0A0', fontSize: '14px', lineHeight: 1.7, margin: '0 0 32px' }}>
          Sayfa beklenmedik şekilde hata aldı. Sorun devam ederse bizimle iletişime geçebilirsin.
        </p>

        {error.digest && (
          <p
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px',
              color: '#6E665A',
              letterSpacing: '0.05em',
              margin: '0 0 24px',
            }}
          >
            Hata kodu: <code>{error.digest}</code>
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '14px 28px',
              backgroundColor: '#C9A961',
              color: '#0A0908',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            style={{
              padding: '14px 28px',
              border: '1px solid rgba(244,240,232,0.2)',
              color: '#F4F0E8',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Anasayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
