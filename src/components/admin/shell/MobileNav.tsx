'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import {
  IconDashboard,
  IconOrders,
  IconProducts,
  IconCustomers,
  IconAnalytics,
  IconStock,
  IconJournal,
  IconSettings,
} from '../ui/Icon'

function IconLedger({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h13a3 3 0 0 1 3 3v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4z" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  )
}

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

const NAV_PRIMARY: NavItem[] = [
  { href: '/admin',             label: 'Pano',        icon: <IconDashboard /> },
  { href: '/admin/siparisler',  label: 'Siparişler',  icon: <IconOrders /> },
  { href: '/admin/urunler',     label: 'Ürünler',     icon: <IconProducts /> },
  { href: '/admin/musteriler',  label: 'Müşteriler',  icon: <IconCustomers /> },
  { href: '/admin/analitik',    label: 'Analitik',    icon: <IconAnalytics /> },
  { href: '/admin/stok',        label: 'Stok',        icon: <IconStock /> },
  { href: '/admin/gunluk',      label: 'Günlük',      icon: <IconJournal /> },
  { href: '/admin/defter',      label: 'Defter',      icon: <IconLedger /> },
]

const NAV_SECONDARY: NavItem[] = [
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: <IconSettings /> },
]

export function MobileNav({ open, onClose, pendingOrders }: { open: boolean; onClose: () => void; pendingOrders?: number }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="ad-mobile-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="ad-mobile-drawer" role="dialog" aria-label="Yönetim navigasyonu">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ad-line-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.3em', color: 'var(--ad-gold-deep)', textTransform: 'uppercase', margin: 0 }} lang="en">
              Admin
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant), serif', color: 'var(--ad-fg)', fontSize: '20px', fontWeight: 500, lineHeight: 1, marginTop: '4px' }}>
              Dr. Şenol
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" className="ad-icon-btn">✕</button>
        </div>

        <div style={{ padding: '12px 0' }}>
          <SectionLabel>Yönetim</SectionLabel>
          {NAV_PRIMARY.map((it) => (
            <NavLinkRow
              key={it.href}
              item={it}
              active={isActive(it.href)}
              badge={it.href === '/admin/siparisler' && pendingOrders ? pendingOrders : undefined}
              onClick={onClose}
            />
          ))}
        </div>

        <div style={{ padding: '12px 0', borderTop: '1px solid var(--ad-line-faint)' }}>
          <SectionLabel>Sistem</SectionLabel>
          {NAV_SECONDARY.map((it) => (
            <NavLinkRow key={it.href} item={it} active={isActive(it.href)} onClick={onClose} />
          ))}
        </div>

        <p
          style={{
            margin: '20px 24px 16px',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '9px',
            letterSpacing: '0.22em',
            color: 'var(--ad-fg-faint)',
            textTransform: 'uppercase',
          }}
        >
          Dr. Şenol · Admin v0.4
        </p>
      </aside>
    </>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 6px',
        padding: '0 20px',
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '9px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--ad-fg-faint)',
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  )
}

function NavLinkRow({ item, active, badge, onClick }: { item: NavItem; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={['ad-nav-item', active && 'is-active'].filter(Boolean).join(' ')}
      style={{ padding: '12px 20px', fontSize: '14px' }}
    >
      <span className="ad-nav-icon" aria-hidden>{item.icon}</span>
      <span className="ad-nav-label">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ad-nav-badge">{badge}</span>
      )}
    </Link>
  )
}
