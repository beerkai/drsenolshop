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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }} lang="en">
            Admin
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '36px', fontWeight: 500, lineHeight: 1.1, margin: '0 0 12px' }}>
            Dr. Şenol
          </h1>
          <p style={{ color: '#6E665A', fontSize: '13px', margin: 0 }}>
            Yönetim paneline giriş yapın.
          </p>
        </div>

        {sp.error === 'yetki_yok' && (
          <div style={{ padding: '12px 16px', border: '1px solid #C8472D', backgroundColor: 'rgba(200,71,45,0.08)', color: '#F4F0E8', fontSize: '13px', marginBottom: '20px' }}>
            Bu hesap admin yetkisine sahip değil.
          </div>
        )}

        <LoginForm next={sp.next ?? '/admin'} />
      </div>
    </div>
  )
}
