'use client'

import { useState, useRef, useEffect } from 'react'
import type { GridSortOption } from '@/lib/catalog-sort'

export type SortOption = GridSortOption

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'popular', label: 'En Popüler' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'name', label: 'İsim: A-Z' },
]

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label || 'Sırala'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        lang="tr"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: '#F4F0E8',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '6px 0',
        }}
      >
        <span style={{ color: '#6E665A' }}>Sırala:</span>
        <span>{currentLabel}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            background: '#141210',
            border: '1px solid rgba(244,240,232,0.15)',
            minWidth: '240px',
            zIndex: 50,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              lang="tr"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                background: opt.value === value ? '#1E1B17' : 'transparent',
                border: 'none',
                color: opt.value === value ? '#C9A961' : '#F4F0E8',
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(244,240,232,0.05)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
