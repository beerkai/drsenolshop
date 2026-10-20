'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '@/config/admin-nav'
import { NavIcon } from './nav-icons'

export function Sidebar({ pendingOrders }: { pendingOrders?: number }) {
  const pathname = usePathname()

  return (
    <aside className="ad-sidebar" aria-label="Yönetim menüsü">
      <div className="ad-sidebar-scroll">
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
      <p className="ad-sidebar-foot">Dr. Şenol · Yönetim</p>
    </aside>
  )
}
