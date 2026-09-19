'use client'

// ═══════════════════════════════════════════════════════════════
// Editorial arama overlay — Stitch "Botanical Index" dili
// ─ Sıfır köşe yuvarlaklığı, sıfır gölge, hairline ayraçlar
// ─ Veil: rgba(20,20,20,0.25), backdrop-blur YOK (DESIGN.md)
// ─ Veri sözleşmesi değişmedi: GET /api/products?q=…&limit=8
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithRelations } from '@/types'
import ProductPriceRow from '@/components/product/ProductPriceRow'
import { getProductImage, getProductStartingPrice } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  placeholder?: string
  emptyHint?: string
}

export default function EditorialSearchOverlay({
  open,
  onClose,
  placeholder = 'Hasat, flora veya ürün ara…',
  emptyHint = 'Aramak için en az 2 karakter yazın.',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  // Açılışta sıfırla + odakla
  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
    setActiveIdx(0)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [open])

  // Body scroll kilidi
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Debounced arama
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    let alive = true
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=8`)
        if (!alive) return
        const data = await res.json()
        setResults(Array.isArray(data?.products) ? data.products : [])
        setActiveIdx(0)
      } catch {
        if (alive) setResults([])
      } finally {
        if (alive) setLoading(false)
      }
    }, 220)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [query])

  const close = useCallback(() => onClose(), [onClose])

  // Klavye: ESC kapat, ok tuşlarıyla gez, Enter seç
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => (i - 1 + results.length) % results.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results.length, close])

  if (!open) return null

  const showEmpty = query.trim().length < 2
  const showNoResult = !showEmpty && !loading && results.length === 0

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Ürün arama">
      {/* Veil — blur yok, ham ton sadakati (DESIGN.md) */}
      <button
        type="button"
        aria-label="Aramayı kapat"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-overlay-dim"
      />

      <div className="relative mx-auto w-full max-w-editorial border-b border-hairline-light bg-surface">
        {/* Arama satırı */}
        <div className="ed-section-inner flex items-center gap-space-md border-b border-hairline-light py-space-md">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder={placeholder}
            aria-label="Ürün ara"
            className="min-w-0 flex-1 bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="button"
            onClick={close}
            className="shrink-0 font-nav-caps text-nav-caps uppercase text-on-surface-variant transition-colors hover:text-honey-amber"
          >
            Kapat
          </button>
        </div>

        {/* Sonuçlar */}
        <div className="ed-section-inner max-h-[min(60vh,32rem)] overflow-y-auto py-space-md">
          {showEmpty ? (
            <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
              {emptyHint}
            </p>
          ) : loading ? (
            <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
              Aranıyor…
            </p>
          ) : showNoResult ? (
            <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
              &ldquo;{query.trim()}&rdquo; için sonuç bulunamadı.
            </p>
          ) : (
            <ul className="flex flex-col">
              {results.map((product, i) => {
                const price = getProductStartingPrice(product)
                const image = getProductImage(product)
                const active = i === activeIdx
                return (
                  <li key={product.id}>
                    <Link
                      href={`/urun/${product.slug}`}
                      onClick={close}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex items-center gap-space-md border-b border-hairline-light py-space-sm transition-colors ${
                        active ? 'bg-surface-container-low' : ''
                      }`}
                    >
                      <span className="relative block h-14 w-14 shrink-0 overflow-hidden bg-surface-container-low">
                        {image ? (
                          <Image src={image} alt="" fill sizes="56px" className="object-cover" />
                        ) : null}
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="font-editorial-caption text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
                          {product.category?.name ?? 'Koleksiyon'}
                        </span>
                        <span className="ed-caption-truncate font-headline-sm text-headline-sm font-normal text-on-surface">
                          {product.name}
                        </span>
                      </span>

                      <span className="shrink-0">
                        <ProductPriceRow price={price} size="inline" />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
