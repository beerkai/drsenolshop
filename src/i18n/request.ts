// ═══════════════════════════════════════════════════════════════
// next-intl request config — routing YOK, locale proxy.ts'te
// belirlenip `x-locale` header'ı ile taşınıyor (getLocale() aynı
// header'ı okur). URL yapısı (TR prefix'siz, /en/*) proxy.ts'in
// rewrite mantığıyla yönetiliyor.
// ═══════════════════════════════════════════════════════════════

import { getRequestConfig } from 'next-intl/server'
import { getLocale } from '@/lib/i18n/locale'

export default getRequestConfig(async () => {
  const locale = await getLocale()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
