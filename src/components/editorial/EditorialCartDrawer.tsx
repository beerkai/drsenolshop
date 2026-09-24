'use client'

// ═══════════════════════════════════════════════════════════════
// Sepet paneli — Editorial Minimal (Stitch "Minimalist Sepet / Çanta")
// ─ Sağdan açılan panel, sıfır radius, sıfır gölge
// ─ Veil: rgba(20,20,20,0.25), backdrop-blur YOK (DESIGN.md)
// ─ Hairline ayraçlı satırlar, tek CTA
//
// Sepet mantığı (useCart / dispatch) DEĞİŞMEDİ.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/types'

export default function EditorialCartDrawer() {
  const { items, dispatch, isOpen, closeCart, itemCount, subtotal } = useCart()

  // ESC ile kapat + body scroll kilidi
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Sepet">
      {/* Veil — blur yok (ham ton sadakati) */}
      <button
        type="button"
        aria-label="Sepeti kapat"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-overlay-dim"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-hairline-light bg-surface">
        {/* Başlık */}
        <header className="flex shrink-0 items-center justify-between border-b border-hairline-light px-space-lg py-space-md">
          <div className="flex items-baseline gap-space-sm">
            <span className="font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface">
              Çanta
            </span>
            <span className="font-label-spec text-label-spec text-on-surface-variant">
              {itemCount} ürün
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="font-nav-caps text-nav-caps uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-honey-amber"
          >
            Kapat
          </button>
        </header>

        {/* Satırlar */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-space-md px-space-lg text-center">
              <p className="font-headline-sm text-headline-sm font-light text-on-surface">
                Çantanız boş.
              </p>
              <Link
                href="/koleksiyon"
                onClick={closeCart}
                className="font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-on-surface underline decoration-honey-amber decoration-1 underline-offset-4 transition-colors hover:text-honey-amber"
              >
                Koleksiyonu Keşfet
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-space-md border-b border-hairline-light px-space-lg py-space-md"
                >
                  <Link
                    href={`/urun/${item.slug}`}
                    onClick={closeCart}
                    className="relative block h-20 w-16 shrink-0 overflow-hidden bg-surface-container-low"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="ed-min-w-0 flex flex-1 flex-col justify-between">
                    <div className="ed-min-w-0">
                      <Link
                        href={`/urun/${item.slug}`}
                        onClick={closeCart}
                        className="ed-caption-truncate block font-body-md text-body-md text-on-surface transition-colors hover:text-honey-amber"
                      >
                        {item.name}
                      </Link>
                      {item.variantLabel ? (
                        <span className="mt-0.5 block font-label-spec text-label-spec text-on-surface-variant">
                          {item.variantLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-space-sm flex items-center justify-between gap-space-sm">
                      {/* Adet */}
                      <div className="flex items-center gap-space-sm border border-hairline-light px-2 py-1">
                        <button
                          type="button"
                          aria-label="Adedi azalt"
                          onClick={() =>
                            dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity - 1 })
                          }
                          className="px-1 text-on-surface transition-colors hover:text-honey-amber"
                        >
                          −
                        </button>
                        <span className="min-w-[1.25rem] text-center font-price-tag text-price-tag text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Adedi artır"
                          onClick={() =>
                            dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity + 1 })
                          }
                          className="px-1 text-on-surface transition-colors hover:text-honey-amber"
                        >
                          +
                        </button>
                      </div>

                      <span className="shrink-0 font-price-tag text-price-tag font-medium text-honey-amber">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`${item.name} ürününü kaldır`}
                    onClick={() => dispatch({ type: 'REMOVE', id: item.id })}
                    className="shrink-0 self-start font-label-spec text-label-spec text-on-surface-variant transition-colors hover:text-error"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Özet + CTA */}
        {items.length > 0 ? (
          <footer className="shrink-0 border-t border-hairline-light px-space-lg py-space-md">
            <div className="mb-space-md flex items-baseline justify-between">
              <span className="font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-on-surface">
                Ara Toplam
              </span>
              <span className="font-price-tag text-[20px] font-semibold leading-none text-on-surface">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mb-space-md font-editorial-caption text-editorial-caption text-on-surface-variant">
              Kargo ve indirimler ödeme adımında hesaplanır.
            </p>

            <Link
              href="/odeme"
              onClick={closeCart}
              className="flex h-12 w-full items-center justify-center bg-charcoal-pure font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-surface-container-lowest transition-colors hover:bg-primary-hover"
            >
              Ödemeye Geç
            </Link>
          </footer>
        ) : null}
      </aside>
    </div>
  )
}
