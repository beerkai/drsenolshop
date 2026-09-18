// ═══════════════════════════════════════════════════════════════
// Hesap akışı iskeleti (giriş / kayıt / şifre) — Editorial Minimal
// ─ Açık zemin, ortalanmış dar kolon, hairline çerçeveli kart
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Props {
  eyebrow: string
  title: ReactNode
  subtitle?: string
  children: ReactNode
}

export default function AuthShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-surface">
        <div className="ed-section-inner ed-section-y">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="mb-space-lg text-center">
              <span className="mb-space-sm block font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
                {eyebrow}
              </span>
              <h1 className="font-headline-lg text-headline-lg font-light tracking-[-0.02em] text-on-surface">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="border border-hairline-light bg-surface-container-lowest p-space-lg">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
