'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { ADMIN_NAV_PRIMARY, ADMIN_NAV_SECONDARY, isAdminNavActive } from '@/config/admin-nav'
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

function IconCategories({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <path d="M4 6v12" />
      <line x1="4" y1="12" x2="6" y2="12" />
      <line x1="4" y1="18" x2="6" y2="18" />
    </svg>
  )
}

function IconTheme({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18 3 3 0 0 0 0-6 3 3 0 0 1 0-6 3 3 0 0 0 0-6z" />
    </svg>
  )
}

function IconReports({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

const ICON_BY_HREF: Record<string, ReactNode> = {
  '/admin': <IconDashboard />,
  '/admin/siparisler': <IconOrders />,
  '/admin/urunler': <IconProducts />,
  '/admin/kategoriler': <IconCategories />,
  '/admin/musteriler': <IconCustomers />,
  '/admin/analitik': <IconAnalytics />,
  '/admin/stok': <IconStock />,
  '/admin/gunluk': <IconJournal />,
  '/admin/defter': <IconLedger />,
  '/admin/analizler': <IconReports />,
  '/admin/tema': <IconTheme />,
  '/admin/seritler': <IconTheme />,
  '/admin/epostalar': <IconMail />,
  '/admin/yorumlar': <IconAnalytics />,
  '/admin/kuponlar': <IconAnalytics />,
  '/admin/ayarlar': <IconSettings />,
}

export function MobileNav({ open, onClose, pendingOrders }: { open: boolean; onClose: () => void; pendingOrders?: number }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <>
      <div className="ad-mobile-drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="ad-mobile-drawer" role="dialog" aria-label="Yönetim navigasyonu">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ad-line-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.3em', color: 'var(--ad-gold-deep)', textTransform: 'uppercase', margin: 0 }} lang="en">
              THE HONEY SCIENTIST
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: 'var(--ad-fg)', fontSize: '22px', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em', marginTop: '4px' }}>
              Dr. Şenol
            </p>
            <p className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '6px 0 0' }}>
              Admin · Editorial
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" className="ad-icon-btn">✕</button>
        </div>

        <div style={{ padding: '12px 0' }}>
          <SectionLabel>Yönetim</SectionLabel>
          {ADMIN_NAV_PRIMARY.map((it) => (
            <NavLinkRow
              key={it.href}
              href={it.href}
              label={it.label}
              icon={ICON_BY_HREF[it.href]}
              active={isAdminNavActive(pathname, it)}
              badge={it.href === '/admin/siparisler' && pendingOrders ? pendingOrders : undefined}
              onClick={onClose}
            />
          ))}
        </div>

        <div style={{ padding: '12px 0', borderTop: '1px solid var(--ad-line-faint)' }}>
          <SectionLabel>Sistem</SectionLabel>
          {ADMIN_NAV_SECONDARY.map((it) => (
            <NavLinkRow
              key={it.href}
              href={it.href}
              label={it.label}
              icon={ICON_BY_HREF[it.href]}
              active={isAdminNavActive(pathname, it)}
              onClick={onClose}
            />
          ))}
        </div>

        <p
          className="ad-mono"
          style={{
            margin: '20px 24px calc(16px + env(safe-area-inset-bottom))',
            fontSize: '9px',
            letterSpacing: '0.22em',
            color: 'var(--ad-fg-faint)',
            textTransform: 'uppercase',
          }}
        >
          Saitabat · Bursa · DRSENOL.SHOP
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

function NavLinkRow({
  href,
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  href: string
  label: string
  icon?: ReactNode
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={['ad-nav-item', active && 'is-active'].filter(Boolean).join(' ')}
      style={{ padding: '12px 20px', fontSize: '14px', minHeight: '44px' }}
    >
      <span className="ad-nav-icon" aria-hidden>{icon}</span>
      <span className="ad-nav-label">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ad-nav-badge">{badge}</span>
      )}
    </Link>
  )
}
