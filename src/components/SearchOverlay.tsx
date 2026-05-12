'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithRelations } from '@/types'
import { formatPrice, getProductStartingPrice, getProductImage } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  // Auto-focus + reset
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // ESC + ⌘K kapatma
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Debounced search
  const fetchResults = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=8`)
      const data = await res.json()
      setResults((data.products ?? []) as ProductWithRelations[])
      setActiveIdx(0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchResults(query), 200)
    return () => clearTimeout(t)
  }, [query, open, fetchResults])

  if (!open) return null

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      const r = results[activeIdx]
      if (r) {
        window.location.href = `/urun/${r.slug}`
      }
    }
  }

  return (
    <>
      <style>{`
        @keyframes search-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes search-slide {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,9,8,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'search-fade 0.2s ease both',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Ürün ara"
        style={{
          position: 'fixed',
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '680px',
          backgroundColor: '#0A0908',
          border: '1px solid rgba(244,240,232,0.1)',
          zIndex: 210,
          maxHeight: '76vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'search-slide 0.22s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 22px', borderBottom: '1px solid rgba(244,240,232,0.08)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" aria-hidden style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ürün ara… (örn. kestane, propolis, polen)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '16px',
              color: '#F4F0E8',
            }}
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px',
              letterSpacing: '0.15em',
              color: '#9B9285',
              background: 'transparent',
              border: '1px solid rgba(244,240,232,0.15)',
              padding: '4px 8px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            ESC
          </button>
        </div>

        {/* Sonuçlar */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {query.length < 2 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Arama
              </p>
              <p style={{ color: '#9B9285', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Aramak için en az 2 karakter yazın.
                <br />
                Plaka veya ürün adı.
              </p>
            </div>
          ) : loading && results.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center' }}>
              <p className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#9B9285', textTransform: 'uppercase' }}>
                Aranıyor…
              </p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center' }}>
              <p style={{ color: '#9B9285', fontSize: '14px', margin: '0 0 8px' }}>
                <q>{query}</q> için sonuç yok.
              </p>
              <p style={{ color: '#6E665A', fontSize: '12px', margin: 0 }}>
                Farklı bir kelime deneyin.
              </p>
            </div>
          ) : (
            <div style={{ padding: '6px 0' }}>
              {results.map((p, idx) => {
                const img = getProductImage(p)
                const price = getProductStartingPrice(p)
                const isActive = idx === activeIdx
                return (
                  <Link
                    key={p.id}
                    href={`/urun/${p.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 22px',
                      textDecoration: 'none',
                      background: isActive ? 'rgba(201,169,97,0.06)' : 'transparent',
                      borderLeft: isActive ? '2px solid #C9A961' : '2px solid transparent',
                    }}
                  >
                    <div style={{ width: '56px', height: '70px', flexShrink: 0, background: '#141210', position: 'relative' }}>
                      {img ? (
                        <Image src={img} alt={p.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3530', fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '10px', textAlign: 'center', padding: '0 4px' }}>
                          {p.name.slice(0, 12)}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {p.category && (
                        <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', letterSpacing: '0.22em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 4px' }}>
                          {p.category.name}
                        </p>
                      )}
                      <p style={{ fontFamily: 'var(--font-cormorant), serif', color: '#F4F0E8', fontSize: '17px', fontWeight: 500, lineHeight: 1.25, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </p>
                    </div>
                    {price && (
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-cormorant), serif', color: '#C9A961', fontSize: '18px', fontWeight: 500, margin: 0 }}>
                          {formatPrice(price.current)}
                        </p>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 22px',
            borderTop: '1px solid rgba(244,240,232,0.06)',
            backgroundColor: '#141210',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: '#6E665A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span><kbd style={kbdStyle}>↑</kbd> <kbd style={kbdStyle}>↓</kbd> gez</span>
            <span><kbd style={kbdStyle}>↵</kbd> seç</span>
          </span>
          <span>
            <Link href="/koleksiyon" onClick={onClose} style={{ color: '#C9A961', textDecoration: 'none' }}>
              Tüm koleksiyon →
            </Link>
          </span>
        </div>
      </div>
    </>
  )
}

const kbdStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '9px',
  background: '#0A0908',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#9B9285',
  padding: '1px 5px',
  borderRadius: '2px',
  letterSpacing: 0,
}
