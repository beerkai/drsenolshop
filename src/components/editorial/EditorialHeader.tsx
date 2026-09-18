'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import EditorialSearchOverlay from '@/components/editorial/EditorialSearchOverlay'
import EditorialWordmark from '@/components/editorial/EditorialWordmark'
import type { EditorialHeaderContent } from '@/types/editorial-home'

export default function EditorialHeader({ content }: { content: EditorialHeaderContent }) {
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-50 bg-surface/95 backdrop-blur-md">
      <div className="w-full border-b border-hairline-light bg-surface-container-low py-1.5">
        <div className="ed-section-inner text-center">
        <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.14em] text-on-surface-variant">
          {content.announcement}{' '}
          {content.announcementAccent ? (
            <>
              <span className="mx-2 text-honey-amber">•</span>
              {content.announcementAccent}
            </>
          ) : null}
        </p>
        </div>
      </div>

      <div className="ed-section-inner flex h-14 items-center justify-between border-b border-hairline-light lg:h-20">
        <div className="flex items-center gap-space-lg">
          <Link href="/" className="shrink-0" aria-label="Dr. Şenol — anasayfa">
            {content.logo ? (
              <Image
                src={content.logo.src}
                alt={content.logo.alt}
                width={160}
                height={32}
                priority
                className="h-8 w-auto object-contain"
              />
            ) : (
              <EditorialWordmark
                text={content.wordmark?.text}
                year={content.wordmark?.year}
              />
            )}
          </Link>

          <nav className="hidden items-center gap-space-lg lg:flex" aria-label="Ana menü">
            {content.nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'font-nav-caps text-nav-caps uppercase text-primary underline decoration-honey-amber decoration-1 underline-offset-8 transition-colors'
                      : 'font-nav-caps text-nav-caps uppercase text-on-surface-variant transition-colors hover:text-on-surface'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-space-md lg:gap-space-lg">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-space-xs text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label={content.searchLabel}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="hidden font-nav-caps text-nav-caps uppercase sm:inline">{content.searchLabel}</span>
          </button>

          <Link
            href="/hesabim"
            className="flex items-center gap-space-xs text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="hidden font-nav-caps text-nav-caps uppercase sm:inline">{content.accountLabel}</span>
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-space-xs text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="font-nav-caps text-nav-caps uppercase">{content.cartLabel}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-honey-amber font-label-spec text-[10px] font-semibold leading-none text-charcoal-pure">
              {itemCount}
            </span>
          </button>

          <Link
            href="/hesabim"
            className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary lg:flex"
            aria-label={content.accountLabel}
          >
            <User className="h-[18px] w-[18px] text-on-primary" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
    <EditorialSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
