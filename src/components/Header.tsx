'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

type NavChild = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

/** Anons çubuğu dil seçici — ileride route/i18n bağlanacak */
type AnnounceLocaleCode = 'tr' | 'en' | 'de' | 'fr';

const ANNOUNCE_LOCALES: { code: AnnounceLocaleCode; label: string; lang?: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN', lang: 'en' },
  { code: 'de', label: 'DE', lang: 'de' },
  { code: 'fr', label: 'FR', lang: 'fr' },
];

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
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [announceLocale, setAnnounceLocale] = useState<AnnounceLocaleCode>('tr');
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="border-b border-[var(--color-line-dark)] bg-ink">
        <div className="container-page relative flex min-h-[36px] items-center justify-center py-1">
          {/* Sol */}
          <p
            className="absolute left-0 top-1/2 max-w-[42%] -translate-y-1/2 font-mono text-[10px] tracking-[0.22em] uppercase text-cream-faint sm:max-w-none"
            lang="en"
          >
            EST. 1985 · BURSA, TR
          </p>

          {/* Orta */}
          <p className="hidden px-16 text-center font-mono text-[10px] tracking-[0.22em] uppercase text-cream-muted sm:block">
            ÜCRETSİZ KARGO · KAPIDA ÖDEME
          </p>

          {/* Sağ — dil segmentleri */}
          <div
            className="absolute right-0 top-1/2 flex -translate-y-1/2 items-stretch gap-px rounded-sm border border-[var(--color-line-dark)] bg-ink-2 p-px"
            role="group"
            aria-label="Dil seçimi"
          >
            {ANNOUNCE_LOCALES.map(({ code, label, lang }) => {
              const selected = announceLocale === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAnnounceLocale(code)}
                  lang={lang}
                  className={`min-w-[28px] px-2 py-1 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors ${
                    selected
                      ? 'bg-ink-4 text-cream shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]'
                      : 'text-cream-faint hover:bg-ink-3 hover:text-cream-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
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
        <div className="container-page">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center h-[80px] lg:h-[96px] gap-4">
            <div className="flex items-center justify-self-start min-w-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="lg:hidden flex flex-col gap-[5px] py-3 -ml-3 px-3"
                aria-label="Menüyü aç"
              >
                <span className="block w-5 h-px bg-cream" />
                <span className="block w-5 h-px bg-cream" />
                <span className="block w-3 h-px bg-cream ml-auto" />
              </button>

              <nav className="hidden lg:flex items-center gap-11">
                {NAV.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className="font-mono text-[11px] tracking-[0.22em] uppercase text-cream hover:text-gold transition-colors duration-300 py-3 block"
                      lang={item.label === 'Signature' ? 'en' : undefined}
                    >
                      {item.label}
                    </Link>

                    {item.children && dropdown === item.label && (
                      <div className="absolute top-full left-0 pt-3 z-50 min-w-[260px]">
                        <div className="bg-ink-2 border border-[var(--color-line-dark)] py-3 animate-fade-in">
                          {item.children.map((c) => (
                            <Link
                              key={c.label}
                              href={c.href}
                              className="block px-5 py-3 text-[13px] text-cream-muted hover:text-gold hover:bg-ink-3 transition-all duration-200"
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

            <Link href="/" className="justify-self-center text-center shrink-0">
              <p lang="en" className="font-mono text-[9px] tracking-[0.4em] uppercase text-gold leading-none mb-2">
                The Honey Scientist
              </p>
              <p className="font-display text-[26px] lg:text-[30px] font-medium text-cream leading-none tracking-[0.005em]">
                Dr. Şenol
              </p>
            </Link>

            <div className="flex items-center justify-end gap-6 justify-self-end min-w-0">
              <button
                type="button"
                aria-label="Ara"
                className="text-cream hover:text-gold transition-colors duration-200 p-1"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-2.5 text-cream hover:text-gold transition-colors duration-200 group"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase hidden sm:inline">
                  Sepet {itemCount > 0 ? `(${itemCount})` : ''}
                </span>
                {itemCount > 0 && (
                  <span className="sm:hidden flex items-center justify-center w-4 h-4 rounded-full bg-gold text-ink font-mono text-[9px] font-medium leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden bg-ink animate-fade-in">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-[80px] px-6 border-b border-[var(--color-line-dark)]">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-gold">Menü</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-cream p-2 -mr-2"
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

            <nav className="flex-1 overflow-y-auto py-10">
              {NAV.map((item, i) => (
                <div key={item.label} className="px-6 mb-3">
                  <Link href={item.href} onClick={() => setOpen(false)} className="block py-4 group">
                    <div className="flex items-baseline gap-5">
                      <span className="font-mono text-[10px] text-gold/60 w-6">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="font-display text-[42px] font-medium text-cream leading-none group-hover:text-gold transition-colors"
                        lang={item.label === 'Signature' ? 'en' : undefined}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                  {item.children && (
                    <div className="pl-11 pb-4">
                      {item.children.slice(0, 4).map((c) => (
                        <Link
                          key={c.label}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-[13px] text-cream-muted hover:text-gold transition-colors"
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

            <div className="border-t border-[var(--color-line-dark)] px-6 py-6">
              <p
                className="font-mono text-[10px] tracking-[0.22em] uppercase text-cream-faint"
                lang="en"
              >
                Est. 1985 · Saitabat, Bursa
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
