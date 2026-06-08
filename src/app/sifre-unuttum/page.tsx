import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthShell from '@/components/auth/AuthShell'
import ResetForm from './ResetForm'

export const metadata: Metadata = {
  title: 'Şifremi Unuttum',
  description: 'Şifrenizi sıfırlamak için e-posta adresinizi girin.',
  robots: { index: false, follow: false },
}

export default function SifreUnuttumPage() {
  return (
    <>
      <Header />
      <main style={{ background: '#15110D', minHeight: '70vh' }}>
        <AuthShell
          eyebrow="Hesap · Şifre"
          title={<>Şifrenizi mi <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>unuttunuz?</span></>}
          subtitle="E-posta adresinizi girin, sıfırlama linkini gönderelim."
        >
          <ResetForm />

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(244,240,232,0.08)', textAlign: 'center', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <a href="/giris" style={{ color: '#C9A961', textDecoration: 'none' }}>← Giriş sayfasına dön</a>
          </div>
        </AuthShell>
      </main>
      <Footer />
    </>
  )
}
