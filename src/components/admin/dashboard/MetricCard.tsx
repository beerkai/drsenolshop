import type { ReactNode } from 'react'
import { Sparkline } from '../ui/Sparkline'
import { TrendChip } from '../ui/TrendChip'

interface Props {
  label: string
  value: ReactNode
  valueGold?: boolean
  sparkline?: number[]
  delta?: number // yüzde (TrendChip için)
  deltaLabel?: string
  hint?: string
}

export function MetricCard({ label, value, valueGold, sparkline, delta, deltaLabel, hint }: Props) {
  return (
    <div className="pn-metric">
      <p className="pn-metric-label">{label}</p>
      <p className={['pn-metric-value', valueGold && 'is-gold'].filter(Boolean).join(' ')}>
        {value}
      </p>

      {(delta !== undefined || hint) && (
        <div className="pn-metric-meta">
          {delta !== undefined && <TrendChip value={delta} label={deltaLabel} />}
          {hint && !delta && (
            <span style={{ color: 'var(--ad-fg-faint)' }}>{hint}</span>
          )}
        </div>
      )}

      {sparkline && sparkline.length > 0 && (
        <div className="pn-metric-sparkline">
          <Sparkline data={sparkline} width={70} height={20} color="var(--ad-gold)" fillColor="var(--ad-gold)" />
        </div>
      )}
    </div>
  )
}
