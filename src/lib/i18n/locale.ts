// ═══════════════════════════════════════════════════════════════
// Aktif locale okuma — proxy.ts /en/* isteklerinde `x-locale: en`
// header'ı set eder (prefix'i strip edip rewrite ederken). Bu
// dosya o header'ı Server Component / next-intl config içinden
// okumak için tek kaynak.
// ═══════════════════════════════════════════════════════════════

import { headers } from 'next/headers'
import { DEFAULT_LOCALE, type Locale } from './types'

export type { Locale } from './types'
export { DEFAULT_LOCALE, LOCALES } from './types'

export async function getLocale(): Promise<Locale> {
  const h = await headers()
  const value = h.get('x-locale')
  return value === 'en' ? 'en' : DEFAULT_LOCALE
}
