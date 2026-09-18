import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  eyebrow: string
  title: ReactNode
  subtitle?: string
  children: ReactNode
}

export default function AuthShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 48px)',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
        }}
      >
        <div
          className="px-responsive"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              color: 'var(--color-cream-faint)',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Anasayfa
          </Link>
          <span style={{ color: 'rgba(244,240,232,0.15)', fontSize: '10px' }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow.split(' · ')[0]}
          </span>
        </div>
      </nav>

      <section
        style={{
          paddingTop: 'clamp(48px, 7vw, 72px)',
          paddingBottom: 'clamp(24px, 4vw, 40px)',
        }}
      >
        <div className="px-responsive" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.3em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              margin: '0 0 20px',
            }}
          >
            {eyebrow}
          </p>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-gold)', margin: '0 auto 24px' }} />
          <h1
            className="font-display"
            style={{
              color: 'var(--color-cream)',
              fontSize: 'clamp(30px, 5vw, 44px)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: 'var(--color-cream-muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '16px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(56px, 10vw, 96px)' }}>
        <div className="px-responsive" style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: 'rgba(244,240,232,0.02)',
              border: '1px solid rgba(244,240,232,0.08)',
              padding: 'clamp(24px, 5vw, 36px)',
            }}
          >
            {children}
          </div>
        </div>
      </section>
    </>
  )
}
