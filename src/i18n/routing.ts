import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  // TR prefix'siz kalır (mevcut URL'ler/SEO korunur), EN /en/* alır
  localePrefix: 'as-needed',
})
