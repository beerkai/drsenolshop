// ═══════════════════════════════════════════════════════════════
// Statik sayfa metin bileşenleri — Editorial Minimal
// ─ Inter gövde, DM Sans ara başlık, hairline kutular
// ─ Sıfır köşe yuvarlaklığı, sıfır gölge
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from 'react'

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
      {children}
    </p>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-space-sm mt-space-xl font-headline-md text-headline-md font-normal text-on-surface">
      {children}
    </h2>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-space-sm mt-space-lg font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
      {children}
    </p>
  )
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-space-lg border-l-2 border-honey-amber pl-space-md font-body-lg text-body-lg italic leading-relaxed text-on-surface">
      {children}
    </blockquote>
  )
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="my-space-md flex flex-col gap-space-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-space-sm font-body-lg text-body-lg text-on-surface-variant">
          <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 bg-honey-amber" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-space-lg border border-hairline-light bg-surface-container-low p-space-lg">
      <p className="mb-space-sm font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
        {title}
      </p>
      <div className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
        {children}
      </div>
    </div>
  )
}

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-hairline-light py-space-md">
      <p className="mb-space-xs font-headline-sm text-headline-sm text-on-surface">{question}</p>
      <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">{answer}</p>
    </div>
  )
}
