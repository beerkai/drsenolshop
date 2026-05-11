'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
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
  shortcut?: string
  badgeCount?: number
}

const NAV_PRIMARY: NavItem[] = [
  { href: '/admin',             label: 'Pano',        icon: <IconDashboard />, shortcut: '⌘1' },
  { href: '/admin/siparisler',  label: 'Siparişler',  icon: <IconOrders />,    shortcut: '⌘2' },
  { href: '/admin/urunler',     label: 'Ürünler',     icon: <IconProducts />,  shortcut: '⌘3' },
  { href: '/admin/musteriler',  label: 'Müşteriler',  icon: <IconCustomers />, shortcut: '⌘4' },
  { href: '/admin/analitik',    label: 'Analitik',    icon: <IconAnalytics />, shortcut: '⌘5' },
  { href: '/admin/stok',        label: 'Stok',        icon: <IconStock />,     shortcut: '⌘6' },
  { href: '/admin/gunluk',      label: 'Günlük',      icon: <IconJournal />,   shortcut: '⌘7' },
  { href: '/admin/defter',      label: 'Defter',      icon: <IconLedger />,    shortcut: '⌘8' },
]

const NAV_SECONDARY: NavItem[] = [
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: <IconSettings />, shortcut: '⌘,' },
]

export function Sidebar({ pendingOrders }: { pendingOrders?: number }) {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="ad-sidebar"
      style={{
        position: 'sticky',
        top: '56px',
        height: 'calc(100vh - 56px)',
        width: '220px',
        flexShrink: 0,
        backgroundColor: 'var(--ad-surface)',
        borderRight: '1px solid var(--ad-line-faint)',
        padding: '20px 0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <NavSectionLabel>Yönetim</NavSectionLabel>
        {NAV_PRIMARY.map((it) => (
          <NavLink
            key={it.href}
            item={it}
            active={isActive(it.href)}
            badge={it.href === '/admin/siparisler' && pendingOrders ? pendingOrders : undefined}
          />
        ))}
      </div>
      <div>
        <NavSectionLabel>Sistem</NavSectionLabel>
        {NAV_SECONDARY.map((it) => (
          <NavLink key={it.href} item={it} active={isActive(it.href)} />
        ))}
        <div style={{ padding: '16px 24px 8px', color: 'var(--ad-fg-faint)' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.22em', margin: 0 }}>
            DR. ŞENOL · ADMIN v0.4
          </p>
        </div>
      </div>
    </aside>
  )
}

function NavSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 8px',
        padding: '0 24px',
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

function NavLink({ item, active, badge }: { item: NavItem; active: boolean; badge?: number }) {
  return (
    <Link href={item.href} className={['ad-nav-item', active && 'is-active'].filter(Boolean).join(' ')}>
      <span className="ad-nav-icon" aria-hidden>{item.icon}</span>
      <span className="ad-nav-label">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ad-nav-badge">{badge}</span>
      )}
      {item.shortcut && badge === undefined && (
        <span className="ad-nav-shortcut">{item.shortcut}</span>
      )}
    </Link>
  )
}
