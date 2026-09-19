'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_MOBILE_TAB_BAR } from '@/config/admin-nav'
import { IconDashboard, IconOrders, IconStock } from '../ui/Icon'

function IconLedger({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h13a3 3 0 0 1 3 3v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4z" />
      <line x1="4" y1="9" x2="20" y2="9" />
    </svg>
  )
}

function IconMenu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function tabIcon(id: string) {
  switch (id) {
    case 'pano':
      return <IconDashboard size={20} />
    case 'siparisler':
      return <IconOrders size={20} />
    case 'defter':
      return <IconLedger />
    case 'stok':
      return <IconStock size={20} />
    default:
      return <IconMenu />
  }
}

export function MobileBottomNav({ pendingOrders }: { pendingOrders?: number }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean): boolean {
    if (exact || href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  function openMenu() {
    window.dispatchEvent(new CustomEvent('ad-open-mobile-nav'))
  }

  return (
    <nav className="ad-mobile-tabbar" aria-label="Hızlı gezinme">
      {ADMIN_MOBILE_TAB_BAR.map((tab) => {
        if ('action' in tab && tab.action === 'menu') {
          return (
            <button
              key={tab.id}
              type="button"
              className="ad-mobile-tab"
              onClick={openMenu}
              aria-label="Tüm menüyü aç"
            >
              {tabIcon(tab.id)}
              <span>{tab.label}</span>
            </button>
          )
        }

        const active = isActive(tab.href, 'exact' in tab ? tab.exact : false)
        const badge = tab.id === 'siparisler' && pendingOrders && pendingOrders > 0 ? pendingOrders : null

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={['ad-mobile-tab', active && 'is-active'].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <span className="ad-mobile-tab-icon">
              {tabIcon(tab.id)}
              {badge != null && <span className="ad-mobile-tab-badge">{badge > 9 ? '9+' : badge}</span>}
            </span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
