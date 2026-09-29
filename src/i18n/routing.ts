import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  // TR prefix'siz kalır (mevcut URL'ler/SEO korunur), EN /en/* alır
  localePrefix: 'as-needed',
  // Tarayıcı dili ve NEXT_LOCALE çerezi prefix'siz adresi /en'e
  // sektirmesin. Varsayılan her zaman Türkçe. /en yalnızca adreste
  // durunca (veya footer'daki EN) açılır; /en silinince tekrar TR.
  localeDetection: false,
})
