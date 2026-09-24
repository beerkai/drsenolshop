// ═══════════════════════════════════════════════════════════════
// next-intl request config — locale, [locale] route segmentinden
// next-intl'in kendi middleware/routing mekanizmasıyla gelir
// (params.locale → setRequestLocale). Admin/API gibi [locale] dışı
// rotalarda requestLocale boş kalır → routing.defaultLocale (tr).
// ═══════════════════════════════════════════════════════════════

import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
