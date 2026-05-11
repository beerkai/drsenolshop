import type { Metadata } from 'next'
import Link from 'next/link'
import AdminLogoutButton from './AdminLogoutButton'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

const NAV = [
  { label: 'Pano', href: '/admin' },
  { label: 'Siparişler', href: '/admin/siparisler' },
  { label: 'Ürünler', href: '/admin/urunler' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''
  const isLogin = pathname === '/admin/giris'

  // Login sayfası dışı için admin context'i layout'ta al, header'da göster
  const ctx = isLogin ? null : await getCurrentAdmin()

  if (isLogin) {
    // Login sayfası — chrome yok, sadece children
    return <div style={{ minHeight: '100vh', backgroundColor: '#0A0908' }}>{children}</div>
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0908', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .admin-nav-link {
          font-family: var(--font-jetbrains);
          font-size: 11px;
          letter-spacing: 0.22em;
          color: #B8B0A0;
          text-transform: uppercase;
          text-decoration: none;
          padding: 22px 0;
          border-bottom: 1px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .admin-nav-link:hover { color: #C9A961; }
        .admin-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding-left: clamp(1rem, 4vw, 3rem);
          padding-right: clamp(1rem, 4vw, 3rem);
          width: 100%;
        }
      `}</style>

      {/* Üst bar */}
      <header style={{ borderBottom: '1px solid rgba(244,240,232,0.08)', backgroundColor: '#0A0908' }}>
        <div className="admin-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
          {/* Sol — logo + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <Link href="/admin" style={{ textDecoration: 'none', padding: '20px 0' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: 0 }} lang="en">
                Admin
              </p>
              <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, lineHeight: 1, marginTop: '4px' }}>
                Dr. Şenol
              </p>
            </Link>

            <nav style={{ display: 'flex', gap: '32px' }}>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="admin-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sağ — kullanıcı + çıkış */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {ctx && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase', margin: 0 }}>
                  {ctx.admin.role}
                </p>
                <p style={{ color: '#F4F0E8', fontSize: '13px', margin: '2px 0 0' }}>
                  {ctx.admin.full_name ?? ctx.admin.email}
                </p>
              </div>
            )}
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="admin-shell" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
