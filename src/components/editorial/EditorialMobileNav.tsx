'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Compass, Grid3X3, ShoppingBag, UserCircle } from 'lucide-react'
import type { EditorialMobileNavItem } from '@/types/editorial-home'

const ICONS = {
  explore: Compass,
  grid: Grid3X3,
  book: BookOpen,
  bag: ShoppingBag,
  account: UserCircle,
} as const

export default function EditorialMobileNav({ items }: { items: EditorialMobileNavItem[] }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline-light bg-surface/90 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden"
      aria-label="Mobil ana menü"
    >
      <div className="flex h-16 items-center justify-around px-space-xs">
        {items.map((item) => {
          const Icon = ICONS[item.icon]
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'flex h-12 w-16 flex-col items-center justify-center gap-1 font-nav-caps text-nav-caps uppercase tracking-[0.1em] text-primary'
                  : 'flex h-12 w-16 flex-col items-center justify-center gap-1 font-nav-caps text-nav-caps uppercase tracking-[0.1em] text-on-surface-variant transition-colors hover:text-on-surface'
              }
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.25} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
