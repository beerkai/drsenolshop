interface Props {
  value: number // yüzde, ör. 12.4
  label?: string // "vs geçen 7 gün"
  invert?: boolean // bazı metrikler için (örn. iade oranı) negatif iyidir
}

export function TrendChip({ value, label, invert = false }: Props) {
  const isPositive = invert ? value < 0 : value > 0
  const isNegative = invert ? value > 0 : value < 0
  const cls = ['ad-trend', isPositive && 'is-up', isNegative && 'is-down', !isPositive && !isNegative && 'is-flat']
    .filter(Boolean)
    .join(' ')

  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '·'
  const display = `${arrow} ${Math.abs(value).toFixed(1)}%`

  return (
    <span className={cls}>
      <span>{display}</span>
      {label && <span style={{ color: 'var(--ad-fg-faint)', fontWeight: 400 }}>· {label}</span>}
    </span>
  )
}
