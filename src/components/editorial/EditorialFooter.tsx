'use client'

import Link from 'next/link'
import type { EditorialFooterContent } from '@/types/editorial-home'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, mailto } from '@/lib/site-contact'
import EditorialFooterNewsletter from './EditorialFooterNewsletter'

const FALLBACK_LEGAL_LINKS: EditorialFooterContent['legalLinks'] = [
  { label: 'KVKK Aydınlatma Metni', href: '/gizlilik-politikasi' },
  { label: 'Çerez Politikası', href: '/cerez-politikasi' },
  { label: 'İade & Değişim', href: '/iade-degisim' },
  { label: 'Kargo Takibi', href: '/siparis-takibi' },
  { label: 'Gönderim Politikası', href: '/kargo-teslimat' },
]

const FALLBACK_EMAILS: EditorialFooterContent['contactEmails'] = [
  { label: 'Genel', address: 'hello@drsenol.shop' },
  { label: 'Destek', address: 'destek@drsenol.shop' },
  { label: 'Sipariş', address: 'siparis@drsenol.shop' },
]

export default function EditorialFooter({ content }: { content: EditorialFooterContent }) {
  const notesColumn = content.columns[3]
  const brandColumn = content.columns[0]
  const legalLinks = content.legalLinks?.length ? content.legalLinks : FALLBACK_LEGAL_LINKS
  const contactEmails = content.contactEmails?.length ? content.contactEmails : FALLBACK_EMAILS
  const instagramLabel = content.instagramHandle.label.includes('@')
    ? content.instagramHandle.label
    : INSTAGRAM_HANDLE
  const instagramHref = content.instagramHandle.href.includes('drsenol.shop')
    ? content.instagramHandle.href
    : INSTAGRAM_URL

  return (
    <footer className="mt-space-xl w-full border-t border-hairline-light bg-surface-container-low">
      <div className="ed-section-inner pb-space-lg pt-space-xl">
        <div className="grid grid-cols-1 gap-space-xl border-b border-hairline-light pb-space-xl md:grid-cols-2 lg:grid-cols-4">
          <div className="ed-min-w-0">
            <span className="mb-space-md block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
              {brandColumn?.title ?? 'Dr. Şenol'}
            </span>
            {brandColumn?.body ? (
              <p className="mb-space-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {brandColumn.body}
              </p>
            ) : null}
            {brandColumn?.labCode ? (
              <span className="mb-space-md block font-label-spec text-label-spec uppercase text-hairline-subtle">
                {brandColumn.labCode}
              </span>
            ) : null}
            <ul className="space-y-space-xs">
              {contactEmails.map((row) => (
                <li key={row.address} className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="text-on-surface">{row.label}: </span>
                  <a
                    href={mailto(row.address)}
                    className="transition-colors hover:text-on-surface"
                    lang="en"
                  >
                    {row.address}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-space-md font-body-sm text-body-sm">
              <Link
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
                lang="en"
              >
                {instagramLabel}
              </Link>
            </p>
          </div>

          {content.columns.slice(1, 3).map((col) => (
            <div key={col.title} className="ed-min-w-0">
              <span className="mb-space-md block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
                {col.title}
              </span>
              {col.body ? (
                <p className="mb-space-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {col.body}
                </p>
              ) : null}
              {col.links ? (
                <ul className="space-y-space-sm">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          {notesColumn ? (
            <div>
              <span className="mb-space-md block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
                {notesColumn.title}
              </span>
              {notesColumn.body ? (
                <p className="mb-space-sm font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {notesColumn.body}
                </p>
              ) : null}
              <EditorialFooterNewsletter
                placeholder={content.footerNewsletter.placeholder}
                submitLabel={content.footerNewsletter.submitLabel}
              />
            </div>
          ) : null}
        </div>

        <nav
          className="flex flex-wrap justify-center gap-x-space-md gap-y-space-sm border-b border-hairline-light py-space-md"
          aria-label="Yasal ve politikalar"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="font-editorial-caption text-editorial-caption text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center justify-between gap-space-md pt-space-lg md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-space-md md:justify-start">
            <p className="font-editorial-caption text-editorial-caption text-on-surface-variant">
              {content.copyright}
            </p>
            <span className="font-editorial-caption text-editorial-caption text-outline-variant">|</span>
            <Link
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-editorial-caption text-editorial-caption text-on-surface-variant transition-colors hover:text-on-surface"
              lang="en"
            >
              {instagramLabel}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <div className="flex items-center gap-space-xs font-label-spec text-label-spec text-on-surface-variant">
              <button type="button" className="font-semibold text-on-surface underline decoration-1 underline-offset-4">
                {content.currency.primary}
              </button>
              <span className="text-outline-variant">/</span>
              <button type="button" className="transition-colors hover:text-on-surface">
                {content.currency.secondary}
              </button>
            </div>
            <span className="font-editorial-caption text-editorial-caption text-outline-variant">|</span>
            <p className="font-editorial-caption text-editorial-caption text-on-surface-variant">{content.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
