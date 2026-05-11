'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb, type Crumb } from './Breadcrumb'
import { Clock } from './Clock'
import { AutoLiveDot } from '../ui/LiveDot'
import { UserMenu } from './UserMenu'
import { IconSearch } from '../ui/Icon'
import { useCommandPalette } from '../command/CommandProvider'

interface Props {
  email: string
  fullName: string | null
  role: string
}

const PATH_LABELS: Record<string, string> = {
  admin: 'Admin',
  siparisler: 'Siparişler',
  urunler: 'Ürünler',
  musteriler: 'Müşteriler',
  analitik: 'Analitik',
  stok: 'Stok',
  gunluk: 'Günlük',
  ayarlar: 'Ayarlar',
  giris: 'Giriş',
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0 || segments[0] !== 'admin') return []

  const crumbs: Crumb[] = [{ label: 'DRŞ', href: '/admin' }]
  let acc = ''
  for (let i = 0; i < segments.length; i++) {
    acc += '/' + segments[i]
    const isLast = i === segments.length - 1
    const label = PATH_LABELS[segments[i]] ?? segments[i].toUpperCase()
    crumbs.push({ label, href: isLast ? undefined : acc })
  }
  return crumbs
}

export function TopBar({ email, fullName, role }: Props) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)
  const { open: openCommandPalette } = useCommandPalette()

  return (
    <header className="ad-topbar">
      <div
        className="ad-topbar-inner"
        style={{
          maxWidth: '100%',
          margin: '0',
          padding: '0 clamp(16px, 2vw, 24px)',
          gap: '20px',
        }}
      >
        {/* Sol — Breadcrumb */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Breadcrumb items={crumbs} />
        </div>

        {/* Orta — Komut paleti tetikleyici */}
        <button
          type="button"
          aria-label="Komut paleti aç"
          onClick={openCommandPalette}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 14px',
            backgroundColor: 'var(--ad-surface-2)',
            border: '1px solid var(--ad-line)',
            color: 'var(--ad-fg-muted)',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px',
            cursor: 'pointer',
            minWidth: '260px',
            transition: 'border-color 120ms, color 120ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ad-gold)'
            e.currentTarget.style.color = 'var(--ad-fg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--ad-line)'
            e.currentTarget.style.color = 'var(--ad-fg-muted)'
          }}
          title="Komut paleti aç (⌘K)"
        >
          <IconSearch size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Sayfa, eylem veya filtre ara…</span>
          <span className="ad-kbd">⌘K</span>
        </button>

        {/* Sağ — Live + Clock + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <AutoLiveDot />
          <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--ad-line-faint)' }} />
          <Clock />
          <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--ad-line-faint)' }} />
          <UserMenu email={email} fullName={fullName} role={role} />
        </div>
      </div>
    </header>
  )
}
