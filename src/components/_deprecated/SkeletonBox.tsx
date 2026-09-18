import type { CSSProperties } from 'react'

interface Props {
  width?: number | string
  height?: number | string
  style?: CSSProperties
}

/**
 * Public site (ink temalı) için skeleton kutusu.
 * Shimmer animasyonu globals.css'te tanımlı (@keyframes shimmer).
 */
export function SkeletonBox({ width = '100%', height = 16, style }: Props) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(244,240,232,0.04) 0%, rgba(244,240,232,0.08) 50%, rgba(244,240,232,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}
