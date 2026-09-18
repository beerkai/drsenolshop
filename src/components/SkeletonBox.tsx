// Yükleniyor iskeleti — Editorial Minimal (hairline yüzey, kare)
import type { CSSProperties } from 'react'

interface Props {
  width?: number | string
  height?: number | string
  style?: CSSProperties
}

export function SkeletonBox({ width = '100%', height = 16, style }: Props) {
  return (
    <span
      aria-hidden
      className="ed-skeleton"
      style={{ display: 'inline-block', width, height, ...style }}
    />
  )
}
