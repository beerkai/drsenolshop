import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthShell from '@/components/auth/AuthShell'
import RegisterForm from './RegisterForm'
import { getCurrentCustomer } from '@/lib/customer-auth'

export const metadata: Metadata = {
  title: 'Hesap Oluştur',
  description: 'Dr. Şenol hesabınızı oluşturun.',
  robots: { index: false, follow: false },
}

type SP = Promise<{ next?: string }>

export default async function KayitPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const next = sp.next || '/hesabim'

  const me = await getCurrentCustomer()
  if (me) redirect(next)

  return (
    <>
      <Header />
      <main style={{ background: '#15110D', minHeight: '70vh' }}>
        <AuthShell
          eyebrow="Hesap · Kayıt"
          title={<>Bir <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>hesap oluşturun</span></>}
          subtitle="Siparişlerinizi takip edin, favorilerinizi kaydedin."
        >
          <RegisterForm next={next} />

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(244,240,232,0.08)', textAlign: 'center', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <span style={{ color: '#6E665A' }}>Zaten hesabınız var mı?{' '}</span>
            <a href={`/giris${next !== '/hesabim' ? `?next=${encodeURIComponent(next)}` : ''}`} style={{ color: '#C9A961', textDecoration: 'none' }}>
              Giriş yap →
            </a>
          </div>
        </AuthShell>
      </main>
      <Footer />
    </>
  )
}
