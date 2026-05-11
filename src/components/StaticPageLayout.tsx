import type { ReactNode } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export interface StaticBreadcrumbItem {
  label: string
  href?: string
}

interface StaticPageLayoutProps {
  eyebrow: string
  title: string
  titleAccent?: string
  intro?: string
  breadcrumbs?: StaticBreadcrumbItem[]
  children: ReactNode
}

function isLikelyEnglish(text: string): boolean {
  return !/[ğüşıöçĞÜŞİÖÇ]/.test(text)
}

export default function StaticPageLayout({
  eyebrow,
  title,
  titleAccent,
  intro,
  breadcrumbs,
  children,
}: StaticPageLayoutProps) {
  return (
    <>
      <Header />
      <main style={{ background: '#0A0908', minHeight: '100vh' }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            style={{
              padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 48px)',
              borderBottom: '1px solid rgba(244,240,232,0.08)',
            }}
          >
            <div
              style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 1.5vw, 10px)',
                flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(8px, 2vw, 10px)',
                letterSpacing: '0.22em',
                color: '#6E665A',
                textTransform: 'uppercase',
              }}
            >
              <Link href="/" style={{ color: '#6E665A', textDecoration: 'none' }}>
                Anasayfa
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 10px)' }}
                >
                  <span aria-hidden>·</span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      style={{ color: '#6E665A', textDecoration: 'none' }}
                      {...(isLikelyEnglish(crumb.label) ? { lang: 'en' } : {})}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      style={{ color: '#C9A961' }}
                      {...(isLikelyEnglish(crumb.label) ? { lang: 'en' } : {})}
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </nav>
        )}

        <section
          style={{
            padding: 'clamp(48px, 10vw, 128px) clamp(16px, 4vw, 48px) clamp(40px, 7vw, 80px)',
            textAlign: 'center',
            borderBottom: '1px solid rgba(244,240,232,0.08)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(10px, 2vw, 11px)',
                letterSpacing: '0.3em',
                color: '#C9A961',
                textTransform: 'uppercase',
                margin: '0 0 20px',
              }}
            >
              {eyebrow}
            </p>
            <div
              style={{
                width: '60px',
                height: '1px',
                background: '#C9A961',
                margin: '0 auto clamp(24px, 5vw, 36px)',
              }}
            />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 6.5vw, 84px)',
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: '-0.015em',
                color: '#F4F0E8',
                margin: 0,
              }}
              {...(isLikelyEnglish(title) ? { lang: 'en' } : {})}
            >
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span
                    style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}
                    {...(isLikelyEnglish(titleAccent) ? { lang: 'en' } : {})}
                  >
                    {titleAccent}
                  </span>
                </>
              )}
            </h1>
            {intro && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(14px, 2.5vw, 17px)',
                  lineHeight: 1.75,
                  color: '#B8B0A0',
                  maxWidth: '600px',
                  margin: 'clamp(28px, 5vw, 40px) auto 0',
                }}
              >
                {intro}
              </p>
            )}
          </div>
        </section>

        <section
          style={{
            padding: 'clamp(40px, 7vw, 96px) clamp(16px, 4vw, 48px)',
          }}
        >
          <div className="static-page-prose" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <style>{`
              .static-page-prose > :first-child { margin-top: 0 !important; }
            `}</style>
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
