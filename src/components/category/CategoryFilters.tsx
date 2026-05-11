'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { Category } from '@/types'

export interface FilterState {
  inStockOnly: boolean
}

interface CategoryFiltersProps {
  categories: Array<Category & { product_count?: number; children?: Array<Category & { product_count?: number }> }>
  activeCategorySlug: string | null
  totalProducts: number
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isMobile: boolean
  isOpen: boolean
  onClose: () => void
  resultCount: number
}

export default function CategoryFilters({
  categories,
  activeCategorySlug,
  totalProducts,
  filters,
  onFiltersChange,
  isMobile,
  isOpen,
  onClose,
  resultCount,
}: CategoryFiltersProps) {
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, isOpen])

  const panelContent = (
    <div
      lang="tr"
      style={{
        padding: isMobile ? '20px' : '32px 28px',
      }}
    >
      {isMobile && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(244,240,232,0.08)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '22px',
              fontWeight: 500,
              color: '#F4F0E8',
              margin: 0,
            }}
          >
            Filtrele
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#B8B0A0',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <p
        style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '9px',
          letterSpacing: '0.25em',
          color: '#C9A961',
          textTransform: 'uppercase',
          margin: '0 0 14px',
        }}
      >
        Kategoriler
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 32px',
          fontSize: '13px',
          lineHeight: 2.1,
        }}
      >
        <li
          style={{
            color: activeCategorySlug === null ? '#F4F0E8' : '#B8B0A0',
            fontWeight: activeCategorySlug === null ? 500 : 400,
            borderLeft: activeCategorySlug === null ? '2px solid #C9A961' : 'none',
            paddingLeft: activeCategorySlug === null ? '10px' : '12px',
            marginLeft: activeCategorySlug === null ? '-12px' : '0',
            transition: 'all 0.2s',
          }}
        >
          <Link
            href="/koleksiyon"
            style={{ color: 'inherit', textDecoration: 'none' }}
            onClick={isMobile ? onClose : undefined}
          >
            Tüm Ürünler · {totalProducts}
          </Link>
        </li>
        {categories.map((cat) => (
          <li
            key={cat.id}
            style={{
              color: activeCategorySlug === cat.slug ? '#F4F0E8' : '#B8B0A0',
              fontWeight: activeCategorySlug === cat.slug ? 500 : 400,
              borderLeft: activeCategorySlug === cat.slug ? '2px solid #C9A961' : 'none',
              paddingLeft: activeCategorySlug === cat.slug ? '10px' : '12px',
              marginLeft: activeCategorySlug === cat.slug ? '-12px' : '0',
              transition: 'all 0.2s',
            }}
          >
            <Link
              href={`/kategori/${cat.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              onClick={isMobile ? onClose : undefined}
            >
              {cat.name} · {cat.product_count ?? 0}
            </Link>
          </li>
        ))}
      </ul>

      <p
        style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '9px',
          letterSpacing: '0.25em',
          color: '#C9A961',
          textTransform: 'uppercase',
          margin: '0 0 14px',
        }}
      >
        Stok Durumu
      </p>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '10px',
          color: filters.inStockOnly ? '#F4F0E8' : '#B8B0A0',
        }}
      >
        <input
          type="radio"
          checked={filters.inStockOnly}
          onChange={() => onFiltersChange({ ...filters, inStockOnly: true })}
          style={{ display: 'none' }}
        />
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '1px solid #C9A961',
            background: filters.inStockOnly ? '#C9A961' : 'transparent',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {filters.inStockOnly && (
            <span
              style={{
                position: 'absolute',
                top: '0',
                left: '4px',
                color: '#0A0908',
                fontSize: '11px',
                lineHeight: 1,
              }}
            >
              ✓
            </span>
          )}
        </span>
        Stokta Olanlar
      </label>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          color: !filters.inStockOnly ? '#F4F0E8' : '#B8B0A0',
        }}
      >
        <input
          type="radio"
          checked={!filters.inStockOnly}
          onChange={() => onFiltersChange({ ...filters, inStockOnly: false })}
          style={{ display: 'none' }}
        />
        <span
          style={{
            width: '14px',
            height: '14px',
            border: `1px solid ${!filters.inStockOnly ? '#C9A961' : 'rgba(244,240,232,0.3)'}`,
            background: !filters.inStockOnly ? '#C9A961' : 'transparent',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {!filters.inStockOnly && (
            <span
              style={{
                position: 'absolute',
                top: '0',
                left: '4px',
                color: '#0A0908',
                fontSize: '11px',
                lineHeight: 1,
              }}
            >
              ✓
            </span>
          )}
        </span>
        Tüm Ürünler
      </label>

      {isMobile && (
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#C9A961',
              color: '#0A0908',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              padding: '16px',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Sonuçları Göster ({resultCount})
          </button>
          <button
            type="button"
            onClick={() => onFiltersChange({ inStockOnly: true })}
            style={{
              background: 'transparent',
              color: '#6E665A',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              padding: '10px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  )

  if (!isMobile) {
    return (
      <aside
        lang="tr"
        style={{
          width: '240px',
          borderRight: '1px solid rgba(244,240,232,0.08)',
          background: '#0A0908',
          flexShrink: 0,
        }}
      >
        {panelContent}
      </aside>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,9,8,0.7)',
            zIndex: 100,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '85vw',
          maxWidth: '320px',
          background: '#0A0908',
          borderRight: '1px solid rgba(244,240,232,0.08)',
          zIndex: 101,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out',
          overflowY: 'auto',
        }}
      >
        {panelContent}
      </div>
    </>
  )
}
