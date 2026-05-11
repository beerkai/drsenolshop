interface Props {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  showDots?: boolean
}

/** Minimal inline SVG sparkline. Veri yoksa boş çizgi. */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#C9A961',
  fillColor,
  showDots = false,
}: Props) {
  if (!data || data.length === 0) {
    return <div style={{ width, height, opacity: 0.2 }} />
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = Math.max(max - min, 1)
  const step = data.length > 1 ? width / (data.length - 1) : width

  const points = data.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 2) - 1
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ')

  const areaPath = fillColor
    ? `${linePath} L ${width} ${height} L 0 ${height} Z`
    : null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline"
    >
      {areaPath && <path d={areaPath} fill={fillColor} opacity={0.18} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill={color} />
      ))}
    </svg>
  )
}
