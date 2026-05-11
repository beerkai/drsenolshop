import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin Giriş',
  robots: { index: false, follow: false },
}

type SP = Promise<{ next?: string; error?: string }>

export default async function AdminGirisPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams

  return (
    <div className="ad-grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Brand kart */}
        <div
          style={{
            backgroundColor: 'var(--ad-surface)',
            border: '1px solid var(--ad-line)',
            padding: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '40px',
                height: '40px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--ad-gold)',
                color: '#0A0908',
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
              }}
              lang="en"
            >
              DRŞ
            </span>
            <div>
              <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '18px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0, lineHeight: 1 }}>
                Dr. Şenol
              </p>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.25em', color: 'var(--ad-gold-deep)', textTransform: 'uppercase', margin: '4px 0 0' }} lang="en">
                Admin · v0.4
              </p>
            </div>
          </div>

          {/* Status pill */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', border: '1px solid var(--ad-line-faint)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ad-success)' }} aria-hidden />
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ad-fg-muted)', textTransform: 'uppercase' }}>
              Hazır
            </span>
          </span>
        </div>

        {/* Giriş form kartı */}
        <div
          style={{
            backgroundColor: 'var(--ad-surface)',
            border: '1px solid var(--ad-line)',
            padding: '32px',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', letterSpacing: '0.3em', color: 'var(--ad-gold-deep)', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Oturum Aç
            </p>
            <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '28px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0, lineHeight: 1.2 }}>
              Yönetim paneline giriş.
            </h1>
            <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.55 }}>
              Yetkili admin hesabıyla devam edin.
            </p>
          </div>

          {sp.error === 'yetki_yok' && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                border: '1px solid var(--ad-danger)',
                backgroundColor: 'var(--ad-danger-faint)',
                color: 'var(--ad-danger)',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', letterSpacing: '0.1em', flexShrink: 0 }}>
                ✕
              </span>
              <span>Bu hesap admin yetkisine sahip değil.</span>
            </div>
          )}

          <LoginForm next={sp.next ?? '/admin'} />
        </div>

        {/* Alt bar */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            letterSpacing: '0.18em',
            color: 'var(--ad-fg-faint)',
            textTransform: 'uppercase',
          }}
        >
          <span>EST. 1985 · BURSA, TR</span>
          <span lang="en">lab.drsenolnaturalhoney.shop</span>
        </div>
      </div>
    </div>
  )
}
