'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n/types'

/** Mevcut path'i hedef locale'e çevirir (/en prefix ekler/çıkarır) */
function localeHref(pathname: string, target: Locale): string {
  const isEn = pathname === '/en' || pathname.startsWith('/en/')
  const bare = isEn ? (pathname === '/en' ? '/' : pathname.slice('/en'.length)) : pathname
  return target === 'tr' ? bare : bare === '/' ? '/en' : `/en${bare}`
}

export default function EditorialFooterLanguageSwitch() {
  const pathname = usePathname()
  const isEn = pathname === '/en' || pathname.startsWith('/en/')

  return (
    <div className="flex items-center gap-space-xs font-label-spec text-label-spec text-on-surface-variant">
      <Link
        href={localeHref(pathname, 'tr')}
        lang="tr"
        aria-current={!isEn ? 'true' : undefined}
        className={
          !isEn
            ? 'font-semibold text-on-surface underline decoration-1 underline-offset-4'
            : 'transition-colors hover:text-on-surface'
        }
      >
        TR
      </Link>
      <span className="text-outline-variant">/</span>
      <Link
        href={localeHref(pathname, 'en')}
        lang="en"
        aria-current={isEn ? 'true' : undefined}
        className={
          isEn
            ? 'font-semibold text-on-surface underline decoration-1 underline-offset-4'
            : 'transition-colors hover:text-on-surface'
        }
      >
        EN
      </Link>
    </div>
  )
}
