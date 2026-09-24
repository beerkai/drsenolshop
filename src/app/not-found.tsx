// ═══════════════════════════════════════════════════════════════
// Gerçek app root not-found — [locale]/layout.tsx içindeki
// hasLocale() doğrulaması başarısız olduğunda (örn. /xx/... gibi
// geçersiz bir locale segmenti) buraya düşer. [locale] ve admin
// artık kendi bağımsız root layout'larına sahip olduğu için
// (ortak app/layout.tsx yok), bu dosya kendi <html>/<body>'sini
// taşımak zorunda — aynı desen global-error.tsx'te de var.
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          backgroundColor: '#0A0908',
          color: '#F4F0E8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 500, margin: '0 0 16px' }}>
            Sayfa bulunamadı.
          </h1>
          <Link
            href="/"
            style={{
              padding: '13px 24px',
              border: '1px solid #C9A961',
              color: '#F4F0E8',
              textDecoration: 'none',
              fontSize: '12px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Anasayfaya dön
          </Link>
        </main>
      </body>
    </html>
  )
}
