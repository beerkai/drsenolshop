// Runtime importu olmayan paylaşılan i18n tipleri — proxy.ts (Edge) ve
// server helper'lar (locale.ts) buradan tip-only import eder.

export type Locale = 'tr' | 'en'

export const DEFAULT_LOCALE: Locale = 'tr'
export const LOCALES: Locale[] = ['tr', 'en']
