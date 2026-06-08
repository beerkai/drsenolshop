import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthShell from '@/components/auth/AuthShell'
import LoginForm from './LoginForm'
import { getCurrentCustomer } from '@/lib/customer-auth'

export const metadata: Metadata = {
  title: 'Giriş',
  description: 'Hesabınıza giriş yapın.',
  robots: { index: false, follow: false },
}

type SP = Promise<{ next?: string; error?: string; registered?: string }>

export default async function GirisPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const next = sp.next || '/hesabim'

  // Zaten giriş yapmışsa direkt yönlendir
  const me = await getCurrentCustomer()
  if (me) redirect(next)

  return (
    <>
      <Header />
      <main style={{ background: '#15110D', minHeight: '70vh' }}>
        <AuthShell
          eyebrow="Hesap · Giriş"
          title={<>Tekrar <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>hoş geldiniz</span></>}
          subtitle="E-posta ve şifrenizle hesabınıza erişin."
        >
          {sp.registered && (
            <Notice tone="success">
              Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.
            </Notice>
          )}

          {sp.error === 'callback' && (
            <Notice tone="error">
              Giriş bağlantısı geçersiz veya süresi dolmuş.
            </Notice>
          )}
          {sp.error === 'session' && (
            <Notice tone="error">
              Oturum oluşturulamadı. Lütfen tekrar deneyin.
            </Notice>
          )}

          <LoginForm next={next} />

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(244,240,232,0.08)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <a href="/sifre-unuttum" style={{ color: '#B8B0A0', textDecoration: 'none' }}>
              Şifremi unuttum
            </a>
            <a href={`/kayit${next !== '/hesabim' ? `?next=${encodeURIComponent(next)}` : ''}`} style={{ color: '#C9A961', textDecoration: 'none' }}>
              Hesap oluştur →
            </a>
          </div>
        </AuthShell>
      </main>
      <Footer />
    </>
  )
}

function Notice({ tone, children }: { tone: 'success' | 'error'; children: React.ReactNode }) {
  const color = tone === 'success' ? '#C9A961' : '#D17B6A'
  return (
    <div
      role="alert"
      style={{
        padding: '12px 14px',
        border: `1px solid ${color}`,
        backgroundColor: tone === 'success' ? 'rgba(201,169,97,0.08)' : 'rgba(209,123,106,0.08)',
        color,
        fontSize: '13px',
        marginBottom: '18px',
      }}
    >
      {children}
    </div>
  )
}
