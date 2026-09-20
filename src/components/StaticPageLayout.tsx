// ═══════════════════════════════════════════════════════════════
// Statik / yasal sayfa iskeleti — Editorial Minimal
// ─ Açık zemin (surface), DM Sans başlık, hairline ayraçlar
// ─ Okuma kolonu ~760px (Stitch editöryal gövde genişliği)
//
// 14 statik sayfa bu iskeleti kullanır.
// ═══════════════════════════════════════════════════════════════

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
  /** Sayfa başlığının üstüne basılan opsiyonel bant */
  topNotice?: ReactNode
  children: ReactNode
}

export default function StaticPageLayout({
  eyebrow,
  title,
  titleAccent,
  intro,
  breadcrumbs,
  topNotice,
  children,
}: StaticPageLayoutProps) {
  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-surface">
        {topNotice ? <div className="w-full">{topNotice}</div> : null}

        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="w-full border-b border-hairline-light bg-surface-container-low">
            <nav
              aria-label="Breadcrumb"
              className="ed-section-inner flex flex-wrap items-center gap-space-xs py-space-sm font-editorial-caption text-editorial-caption uppercase tracking-[0.14em] text-on-surface-variant"
            >
              <Link href="/" className="transition-colors hover:text-on-surface">
                Anasayfa
              </Link>
              {breadcrumbs.map((b, i) => (
                <span key={`${b.label}-${i}`} className="flex items-center gap-space-xs">
                  <span aria-hidden>/</span>
                  {b.href ? (
                    <Link href={b.href} className="transition-colors hover:text-on-surface">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-on-surface">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        ) : null}

        {/* Başlık bloğu */}
        <header className="w-full border-b border-hairline-light ed-section-y">
          <div className="ed-section-inner">
            <div className="mx-auto max-w-[760px]">
              <span className="mb-space-sm block font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
                {eyebrow}
              </span>

              <h1 className="font-headline-lg text-headline-lg font-light tracking-[-0.02em] text-on-surface">
                {title}
                {titleAccent ? (
                  <>
                    {' '}
                    {/*
                      Vurgu rengi: --color-secondary (#745b1b) — honey-amber
                      açık zeminde ~2.3:1 kalıyor (büyük metin eşiği 3:1).
                      Derin altın hem marka kimliğini korur hem okunur (~5.9:1).
                    */}
                    <span className="text-secondary">{titleAccent}</span>
                  </>
                ) : null}
              </h1>

              {intro ? (
                <p className="mt-space-md font-body-lg text-body-lg font-light text-on-surface-variant">
                  {intro}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {/* Gövde */}
        <div className="ed-section-inner ed-section-y">
          <div className="mx-auto max-w-[760px]">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  )
}
