// ═══════════════════════════════════════════════════════════════
// Aktif locale okuma — next-intl'in kendi getLocale()'ine delege
// eder. [locale] route segmenti altında next-intl bunu params'tan
// çözer (setRequestLocale); admin/API gibi segment dışı rotalarda
// routing.defaultLocale'e (tr) düşer. @/lib/cms/home-content ve
// layout.tsx bu path'i import ettiği için burada tutuluyor.
// ═══════════════════════════════════════════════════════════════

import { getLocale as getNextIntlLocale } from 'next-intl/server'
import { DEFAULT_LOCALE, type Locale } from './types'

export type { Locale } from './types'
export { DEFAULT_LOCALE, LOCALES } from './types'

export async function getLocale(): Promise<Locale> {
  const locale = await getNextIntlLocale()
  return locale === 'en' ? 'en' : DEFAULT_LOCALE
}
