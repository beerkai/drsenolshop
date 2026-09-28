'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export default function EditorialFooterLanguageSwitch() {
  const locale = useLocale()
  const pathname = usePathname()
  const isEn = locale === 'en'

  return (
    <div className="flex items-center gap-space-xs font-label-spec text-label-spec text-on-surface-variant">
      <Link
        href={pathname}
        locale="tr"
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
        href={pathname}
        locale="en"
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
