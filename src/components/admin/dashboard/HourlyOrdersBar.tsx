interface Props {
  hours: number[] // 24 öğe
}

/** Bugünün saat saat sipariş bar chart (0-23) */
export function HourlyOrdersBar({ hours }: Props) {
  const max = Math.max(...hours, 1)
  const totalToday = hours.reduce((a, b) => a + b, 0)
  const now = new Date()
  const currentHour = now.getHours()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p className="ad-eyebrow-muted">Bugün · Saat Bazında Sipariş</p>
        <p className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)' }}>
          Toplam <span style={{ color: 'var(--ad-fg)', fontWeight: 500 }}>{totalToday}</span>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px' }}>
        {hours.map((count, h) => {
          const heightPct = (count / max) * 100
          const isPast = h < currentHour
          const isCurrent = h === currentHour
          const isFuture = h > currentHour
          return (
            <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <span
                title={`${String(h).padStart(2, '0')}:00 — ${count} sipariş`}
                style={{
                  width: '100%',
                  minHeight: count > 0 ? '2px' : '0',
                  height: `${heightPct}%`,
                  backgroundColor: isFuture ? 'var(--ad-line-faint)' : isCurrent ? 'var(--ad-gold)' : 'var(--ad-gold-deep)',
                  opacity: isFuture ? 0.4 : 1,
                  transition: 'height 240ms ease',
                }}
              />
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </div>
  )
}
