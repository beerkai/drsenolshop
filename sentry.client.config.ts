// ═══════════════════════════════════════════════════════════════
// Sentry tarayıcı tarafı yapılandırması
// ─ NEXT_PUBLIC_SENTRY_DSN env'i yoksa init edilmez (no-op)
// ─ Production'da düşük sample rate (gürültü olmasın)
// ═══════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    enabled: process.env.NODE_ENV === 'production',
  })
}
