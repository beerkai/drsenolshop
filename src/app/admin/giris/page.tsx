import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin Giriş',
  robots: { index: false, follow: false },
}

type SP = Promise<{ next?: string; error?: string }>

/** Yalnızca panel içi yollar. Açık yönlendirme ve API next'i elenir. */
function safeAdminNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/admin'
  if (raw.includes('://') || raw.includes('\\')) return '/admin'
  if (raw === '/admin') return '/admin'
  if (raw.startsWith('/admin/') && !raw.startsWith('/admin/giris')) return raw
  return '/admin'
}

export default async function AdminGirisPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const next = safeAdminNext(sp.next)

  return (
    <div className="pn-grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Brand kart */}
        <div
          className="pn-login-card"
          style={{
            backgroundColor: 'var(--ad-surface)',
            border: '1px solid var(--ad-line-faint)',
            padding: '10px 12px',
            marginBottom: '16px',
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
                backgroundColor: 'var(--ad-primary)',
                color: 'var(--ad-on-primary)',
                borderRadius: '10px',
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
              <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '18px', fontWeight: 400, color: 'var(--ad-fg)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Dr. Şenol
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ad-fg-muted)', margin: '2px 0 0' }}>
                Yönetim
              </p>
            </div>
          </div>

          {/* Status pill */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'var(--ad-success-faint)', color: 'var(--ad-success)', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ad-success)' }} aria-hidden />
            Hazır
          </span>
        </div>

        {/* Giriş form kartı */}
        <div
          className="pn-login-card"
          style={{
            backgroundColor: 'var(--ad-surface)',
            border: '1px solid var(--ad-line-faint)',
            padding: '28px',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--ad-gold-deep)', margin: '0 0 8px' }}>
              Oturum
            </p>
            <h1 style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '28px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              Panele giriş.
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

          <LoginForm next={next} />
        </div>

        {/* Alt bar */}
        <div className="pn-login-foot">
          <span>Saitabat · Bursa</span>
          <span lang="en">lab.drsenol.shop</span>
        </div>
      </div>
    </div>
  )
}
