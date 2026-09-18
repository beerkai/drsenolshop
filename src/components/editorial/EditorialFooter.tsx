'use client'

import Link from 'next/link'
import type { EditorialFooterContent } from '@/types/editorial-home'
import EditorialFooterNewsletter from './EditorialFooterNewsletter'

export default function EditorialFooter({ content }: { content: EditorialFooterContent }) {
  const notesColumn = content.columns[3]

  return (
    <footer className="mt-space-xl w-full border-t border-hairline-light bg-surface-container-low">
      <div className="ed-section-inner pb-space-lg pt-space-xl">
        <div className="grid grid-cols-1 gap-space-xl border-b border-hairline-light pb-space-xl md:grid-cols-2 lg:grid-cols-4">
          {content.columns.slice(0, 3).map((col) => (
            <div key={col.title} className="ed-min-w-0">
              <span className="mb-space-md block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
                {col.title}
              </span>
              {col.body ? (
                <p className="mb-space-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {col.body}
                </p>
              ) : null}
              {col.labCode ? (
                <span className="block font-label-spec text-label-spec uppercase text-hairline-subtle">
                  {col.labCode}
                </span>
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

        <div className="flex flex-col items-center justify-between gap-space-md pt-space-lg md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-space-md md:justify-start">
            <p className="font-editorial-caption text-editorial-caption text-on-surface-variant">
              {content.copyright}
            </p>
            <span className="font-editorial-caption text-editorial-caption text-outline-variant">|</span>
            <Link
              href={content.instagramHandle.href}
              className="font-editorial-caption text-editorial-caption text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {content.instagramHandle.label}
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
