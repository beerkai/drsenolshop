interface Props {
  width?: number | string
  height?: number | string
  className?: string
}

export function Skeleton({ width = '100%', height = 16, className }: Props) {
  return (
    <span
      className={['ad-skeleton', className].filter(Boolean).join(' ')}
      style={{ width, height, display: 'inline-block' }}
      aria-hidden
    />
  )
}
