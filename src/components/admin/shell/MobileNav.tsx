'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '@/config/admin-nav'
import { NavIcon } from './nav-icons'

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
      <aside className="ad-mobile-drawer" role="dialog" aria-label="Yönetim menüsü">
        <div className="ad-drawer-head">
          <div>
            <p className="ad-drawer-kicker">Yönetim</p>
            <p className="ad-drawer-title">Dr. Şenol</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" className="ad-icon-btn">✕</button>
        </div>

        <div className="ad-drawer-body">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.id} className="ad-nav-group">
              <p className="ad-nav-section">{group.label}</p>
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item)
                const badge = item.href === '/admin/siparisler' && pendingOrders ? pendingOrders : 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={['ad-nav-item', active && 'is-active'].filter(Boolean).join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="ad-nav-icon" aria-hidden><NavIcon href={item.href} /></span>
                    <span className="ad-nav-label">{item.label}</span>
                    {badge > 0 && <span className="ad-nav-badge">{badge > 99 ? '99+' : badge}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
