'use client'

import { useState } from 'react'
import { useWishlist, type WishlistItem } from '@/lib/wishlist-context'

interface Props {
  product: Omit<WishlistItem, 'addedAt'>
  variant?: 'icon' | 'pill'
  className?: string
}

export default function WishlistButton({ product, variant = 'icon', className }: Props) {
  const { isInWishlist, toggle } = useWishlist()
  const [pulse, setPulse] = useState(false)
  const active = isInWishlist(product.productId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
    setPulse(true)
    setTimeout(() => setPulse(false), 240)
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: 'transparent',
          border: `1px solid ${active ? '#C9A961' : 'rgba(244,240,232,0.2)'}`,
          color: active ? '#C9A961' : '#F4F0E8',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '44px',
        }}
      >
        <HeartIcon filled={active} pulse={pulse} size={14} />
        <span>{active ? 'Favori' : 'Favorile'}</span>
      </button>
    )
  }

  // icon variant — kart üstüne overlay olarak
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        backgroundColor: 'rgba(10,9,8,0.55)',
        border: '1px solid rgba(244,240,232,0.15)',
        cursor: 'pointer',
        color: active ? '#C9A961' : '#F4F0E8',
        transition: 'all 0.2s',
        backdropFilter: 'blur(4px)',
      }}
    >
      <HeartIcon filled={active} pulse={pulse} size={14} />
    </button>
  )
}

function HeartIcon({ filled, pulse, size = 14 }: { filled: boolean; pulse: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: pulse ? 'scale(1.35)' : 'scale(1)',
      }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
