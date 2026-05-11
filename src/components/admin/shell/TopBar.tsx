'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumb, type Crumb } from './Breadcrumb'
import { Clock } from './Clock'
import { AutoLiveDot } from '../ui/LiveDot'
import { UserMenu } from './UserMenu'
import { IconSearch } from '../ui/Icon'
import { useCommandPalette } from '../command/CommandProvider'
import { MobileNav } from './MobileNav'

interface Props {
  email: string
  fullName: string | null
  role: string
  pendingOrders?: number
}

const PATH_LABELS: Record<string, string> = {
  admin: 'Admin',
  siparisler: 'Siparişler',
  urunler: 'Ürünler',
  musteriler: 'Müşteriler',
  analitik: 'Analitik',
  stok: 'Stok',
  gunluk: 'Günlük',
  defter: 'Defter',
  hafta: 'Haftalık',
  arsiv: 'Arşiv',
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

export function TopBar({ email, fullName, role, pendingOrders }: Props) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)
  const { open: openCommandPalette } = useCommandPalette()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <header className="ad-topbar">
        {/* Mobile-only üst mini bar — bağlantı + saat */}
        <div className="ad-topbar-row1">
          <AutoLiveDot />
          <Clock />
        </div>

        <div
          className="ad-topbar-inner"
          style={{
            maxWidth: '100%',
            margin: '0',
            padding: '0 clamp(12px, 2vw, 24px)',
            gap: '14px',
          }}
        >
          {/* Mobile hamburger — <1024px görünür */}
          <button
            type="button"
            aria-label="Menüyü aç"
            onClick={() => setMobileNavOpen(true)}
            className="ad-mobile-menu-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Sol — Breadcrumb */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Breadcrumb items={crumbs} />
          </div>

          {/* Orta — Komut paleti tetikleyici (geniş, masaüstü) */}
          <button
            type="button"
            aria-label="Komut paleti aç"
            onClick={openCommandPalette}
            className="ad-topbar-search-wide"
            style={{
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

          {/* Orta (compact, mobile) — sadece ikon */}
          <button
            type="button"
            aria-label="Komut paleti aç"
            onClick={openCommandPalette}
            className="ad-topbar-search-narrow"
            title="Komut paleti aç (⌘K)"
          >
            <IconSearch size={14} />
          </button>

          {/* Sağ — Masaüstünde Live + Clock + Avatar; mobile'da sadece Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="ad-topbar-desktop-info">
              <AutoLiveDot />
              <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--ad-line-faint)' }} />
              <Clock />
              <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--ad-line-faint)' }} />
            </div>
            <UserMenu email={email} fullName={fullName} role={role} />
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} pendingOrders={pendingOrders} />
    </>
  )
}
