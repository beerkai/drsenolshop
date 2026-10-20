'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '@/config/admin-nav'
import { NavIcon } from './nav-icons'

export function Sidebar({ pendingOrders }: { pendingOrders?: number }) {
  const pathname = usePathname()

  return (
    <aside className="pn-sidebar" aria-label="Yönetim menüsü">
      <div className="pn-sidebar-scroll">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.id} className="pn-nav-group">
            <p className="pn-nav-section">{group.label}</p>
            {group.items.map((item) => {
              const active = isAdminNavActive(pathname, item)
              const badge = item.href === '/admin/siparisler' && pendingOrders ? pendingOrders : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={['pn-nav-item', active && 'is-active'].filter(Boolean).join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="pn-nav-icon" aria-hidden><NavIcon href={item.href} /></span>
                  <span className="pn-nav-label">{item.label}</span>
                  {badge > 0 && <span className="pn-nav-badge">{badge > 99 ? '99+' : badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <p className="pn-sidebar-foot">Dr. Şenol · Yönetim</p>
    </aside>
  )
}
