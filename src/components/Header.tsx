'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

type NavChild = { label: string; href: string }
type NavItem = { label: string; href: string; children?: NavChild[] }

/** Anons çubuğu dil seçici — ileride route/i18n bağlanacak */
type AnnounceLocaleCode = 'tr' | 'en' | 'de' | 'fr'

const ANNOUNCE_LOCALES: { code: AnnounceLocaleCode; label: string; lang?: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN', lang: 'en' },
  { code: 'de', label: 'DE', lang: 'de' },
  { code: 'fr', label: 'FR', lang: 'fr' },
]

const NAV: NavItem[] = [
  {
    label: 'Bal',
    href: '/kategori/bal',
    children: [
      { label: 'Kestane Balı', href: '/kategori/bal/kestane' },
      { label: 'Yabani Kekik Balı', href: '/kategori/bal/kekik' },
      { label: 'Çiçek Balı', href: '/kategori/bal/cicek' },
      { label: 'Yayla Balı', href: '/kategori/bal/yayla' },
      { label: 'Petek Balı', href: '/kategori/bal/petek' },
    ],
  },
  {
    label: 'Signature',
    href: '/kategori/signature',
    children: [
      { label: 'Superblend 5', href: '/urun/superblend-5' },
      { label: 'Superblend 3', href: '/urun/superblend-3' },
      { label: 'Wild Saffron Blend', href: '/urun/wild-saffron-blend' },
      { label: 'Vitalis Chestnut+', href: '/urun/vitalis-chestnut' },
      { label: 'Highland Propolis', href: '/urun/highland-propolis' },
      { label: 'Ginger & Flora', href: '/urun/ginger-flora' },
    ],
  },
  { label: 'Hikâye', href: '/hikaye' },
]

/* Geniş masaüstünde içerik daha dengeli ortada dursun (Safari/ultra-wide) */
const PAD_X = 'clamp(16px, 4vw, 56px)' as const

const svgIcon = {
  width: 'clamp(16px, 4vw, 20px)',
  height: 'clamp(16px, 4vw, 20px)',
  flexShrink: 0,
} as const

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [announceLocale, setAnnounceLocale] = useState<AnnounceLocaleCode>('tr')
  const { itemCount, openCart } = useCart()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', h, { passive: true })
    h()
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          .ds-header-cart-label { display: none !important; }
        }
        @media (max-width: 767px) {
          .ds-header-announce-promo { display: none !important; }
        }
      `}</style>

      <div className="border-b border-[var(--color-line-dark)] bg-ink">
        <div
          className="mx-auto grid max-w-[1440px] w-full grid-cols-2 items-center md:grid-cols-[1fr_auto_1fr]"
          style={{
            paddingLeft: PAD_X,
            paddingRight: PAD_X,
            paddingTop: 'clamp(6px, 1.5vw, 10px)',
            paddingBottom: 'clamp(6px, 1.5vw, 10px)',
            minHeight: 'clamp(28px, 8vw, 38px)',
            columnGap: 'clamp(8px, 2vw, 16px)',
          }}
        >
          <p
            className="min-w-0 justify-self-start font-mono uppercase text-cream-faint"
            lang="en"
            style={{
              fontSize: 'clamp(8px, 2vw, 10px)',
              letterSpacing: 'clamp(0.14em, 0.35vw, 0.22em)',
            }}
          >
            EST. 1985 · BURSA, TR
          </p>

          <p
            className="ds-header-announce-promo hidden max-w-[min(100%,52vw)] justify-self-center text-center font-mono uppercase text-cream-muted md:block"
            style={{
              fontSize: 'clamp(8px, 2vw, 10px)',
              letterSpacing: 'clamp(0.15em, 0.35vw, 0.22em)',
            }}
          >
            ÜCRETSİZ KARGO · KAPIDA ÖDEME
          </p>

          <div
            className="flex min-w-0 justify-end justify-self-end md:w-full"
          >
            <div
              className="flex items-stretch gap-px rounded-sm border border-[var(--color-line-dark)] bg-ink-2 p-px"
              role="group"
              aria-label="Dil seçimi"
            >
              {ANNOUNCE_LOCALES.map(({ code, label, lang }) => {
                const selected = announceLocale === code
                return (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAnnounceLocale(code)}
                    lang={lang}
                    className={`transition-colors min-h-[30px] ${
                      selected
                        ? 'bg-ink-4 text-cream shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]'
                        : 'text-cream-faint hover:bg-ink-3 hover:text-cream-muted'
                    }`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(8px, 2vw, 10px)',
                      letterSpacing: '0.12em',
                      padding: 'clamp(3px, 1vw, 6px) clamp(6px, 1.8vw, 10px)',
                      minWidth: 'clamp(26px, 8vw, 32px)',
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 relative ${
          scrolled
            ? 'bg-[rgba(10,9,8,0.88)] backdrop-blur-xl border-b border-[var(--color-line-dark)]'
            : 'bg-ink border-b border-transparent'
        }`}
      >
        <div
          className="mx-auto max-w-[1440px] w-full"
          style={{
            paddingLeft: PAD_X,
            paddingRight: PAD_X,
          }}
        >
          {/* lg+: 3 eşit sütun — logo tam geometrik ortada (sticky/Safari transform hatası yok) */}
          <div
            className="grid w-full min-h-[clamp(64px,12vw,96px)] grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] items-center gap-x-3 sm:gap-x-4 lg:grid-cols-3 lg:gap-x-6"
            style={{ minHeight: 'clamp(64px, 12vw, 96px)' }}
          >
            <div className="flex min-w-0 items-center justify-self-start">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="-ml-1 flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-[5px] py-3 lg:hidden"
                aria-label="Menüyü aç"
              >
                <span className="block h-px bg-cream" style={{ width: 'clamp(18px, 4vw, 22px)' }} />
                <span className="block h-px bg-cream" style={{ width: 'clamp(18px, 4vw, 22px)' }} />
                <span className="ml-auto block h-px bg-cream" style={{ width: 'clamp(11px, 3vw, 14px)' }} />
              </button>

              <nav className="hidden items-center lg:flex" style={{ gap: 'clamp(2rem, 4vw, 2.75rem)' }}>
                {NAV.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className="block py-3 font-mono uppercase text-cream transition-colors duration-300 hover:text-gold"
                      style={{
                        fontSize: 'clamp(10px, 1.8vw, 11px)',
                        letterSpacing: '0.22em',
                      }}
                      lang={item.label === 'Signature' ? 'en' : undefined}
                    >
                      {item.label}
                    </Link>

                    {item.children && dropdown === item.label && (
                      <div className="absolute left-0 top-full z-50 min-w-[260px] pt-3">
                        <div className="animate-fade-in border border-[var(--color-line-dark)] bg-ink-2 py-3">
                          {item.children.map((c) => (
                            <Link
                              key={c.label}
                              href={c.href}
                              className="block px-5 py-3 text-[13px] text-cream-muted transition-all duration-200 hover:bg-ink-3 hover:text-gold"
                              lang={item.label === 'Signature' ? 'en' : undefined}
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex min-w-0 justify-center justify-self-center">
              <Link href="/" className="min-w-0 max-w-[100vw] px-1 text-center sm:max-w-[min(92vw,520px)]">
                <p
                  lang="en"
                  className="mb-[clamp(2px,0.6vw,8px)] font-mono uppercase leading-none text-gold"
                  style={{
                    fontSize: 'clamp(7px, 1.5vw, 9px)',
                    letterSpacing: 'clamp(0.28em, 0.65vw, 0.4em)',
                  }}
                >
                  The Honey Scientist
                </p>
                <p
                  className="font-display font-medium leading-none tracking-[0.005em] text-cream"
                  style={{ fontSize: 'clamp(20px, 4vw, 30px)' }}
                >
                  Dr. Şenol
                </p>
              </Link>
            </div>

            <div
              className="flex min-w-0 items-center justify-end justify-self-end"
              style={{ gap: 'clamp(12px, 2.5vw, 24px)' }}
            >
              <button
                type="button"
                aria-label="Ara"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-cream transition-colors duration-200 hover:text-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={svgIcon}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={openCart}
                className="hover:text-gold group flex items-center gap-2 text-cream transition-colors duration-200 min-h-[44px] px-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={svgIcon}
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span
                  className="ds-header-cart-label font-mono uppercase"
                  style={{
                    fontSize: 'clamp(9px, 2vw, 10px)',
                    letterSpacing: '0.22em',
                  }}
                >
                  Sepet {itemCount > 0 ? `(${itemCount})` : ''}
                </span>
                {itemCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[9px] font-medium leading-none text-ink lg:hidden">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="animate-fade-in fixed inset-0 z-[100] bg-ink lg:hidden">
          <div className="flex h-full flex-col">
            <div
              className="flex items-center justify-between border-b border-[var(--color-line-dark)]"
              style={{
                minHeight: 'clamp(64px, 14vw, 80px)',
                paddingLeft: PAD_X,
                paddingRight: PAD_X,
              }}
            >
              <p
                className="font-mono uppercase text-gold"
                style={{ fontSize: 'clamp(9px, 2vw, 10px)', letterSpacing: '0.22em' }}
              >
                Menü
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-cream"
                aria-label="Kapat"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto" style={{ paddingTop: 'clamp(24px, 6vw, 40px)' }}>
              {NAV.map((item, i) => (
                <div key={item.label} style={{ marginBottom: '12px', paddingLeft: PAD_X, paddingRight: PAD_X }}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="group block py-3">
                    <div className="flex items-baseline gap-4">
                      <span
                        className="w-6 font-mono text-gold/60"
                        style={{ fontSize: 'clamp(9px, 2vw, 10px)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="font-display font-medium leading-none text-cream transition-colors group-hover:text-gold"
                        style={{ fontSize: 'clamp(28px, 9vw, 42px)' }}
                        lang={item.label === 'Signature' ? 'en' : undefined}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                  {item.children && (
                    <div style={{ paddingLeft: 'clamp(2.5rem, 8vw, 2.75rem)', paddingBottom: '8px' }}>
                      {item.children.slice(0, 4).map((c) => (
                        <Link
                          key={c.label}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-cream-muted transition-colors hover:text-gold"
                          style={{ fontSize: 'clamp(12px, 3.2vw, 13px)' }}
                          lang={item.label === 'Signature' ? 'en' : undefined}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="border-t border-[var(--color-line-dark)]" style={{ padding: `24px ${PAD_X}` }}>
              <p
                className="font-mono uppercase text-cream-faint"
                lang="en"
                style={{ fontSize: 'clamp(8px, 2vw, 10px)', letterSpacing: '0.22em' }}
              >
                Est. 1985 · Saitabat, Bursa
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
