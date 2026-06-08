import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthShell from '@/components/auth/AuthShell'
import UpdatePasswordForm from './UpdatePasswordForm'
import { getCurrentCustomer } from '@/lib/customer-auth'

export const metadata: Metadata = {
  title: 'Şifre Yenile',
  description: 'Yeni şifrenizi belirleyin.',
  robots: { index: false, follow: false },
}

export default async function SifreYenilePage() {
  // Sıfırlama linkinden geliyorsa session olur — yoksa giriş'e dön.
  const me = await getCurrentCustomer()
  if (!me) redirect('/sifre-unuttum')

  return (
    <>
      <Header />
      <main style={{ background: '#15110D', minHeight: '70vh' }}>
        <AuthShell
          eyebrow="Hesap · Yeni Şifre"
          title={<>Yeni şifrenizi <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>belirleyin</span></>}
          subtitle={`${me.email} için yeni şifre.`}
        >
          <UpdatePasswordForm />
        </AuthShell>
      </main>
      <Footer />
    </>
  )
}
