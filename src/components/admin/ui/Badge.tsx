import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'neutral'

interface Props {
  tone?: Tone
  bracketed?: boolean
  children: ReactNode
  className?: string
}

const toneClass: Record<Tone, string> = {
  success: 'ad-badge-success',
  warning: 'ad-badge-warning',
  danger: 'ad-badge-danger',
  info: 'ad-badge-info',
  gold: 'ad-badge-gold',
  neutral: 'ad-badge-neutral',
}

export function Badge({ tone = 'neutral', bracketed = false, children, className }: Props) {
  return (
    <span className={['ad-badge', toneClass[tone], className].filter(Boolean).join(' ')}>
      {bracketed && <span style={{ marginRight: '4px', opacity: 0.5 }}>[</span>}
      {children}
      {bracketed && <span style={{ marginLeft: '4px', opacity: 0.5 }}>]</span>}
    </span>
  )
}

// ─── Sipariş durumu için özel pill ─────────────────────────────
const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: 'warning', label: 'Bekliyor' },
  paid: { tone: 'success', label: 'Ödendi' },
  preparing: { tone: 'gold', label: 'Hazırlanıyor' },
  shipped: { tone: 'info', label: 'Kargoda' },
  delivered: { tone: 'success', label: 'Teslim' },
  cancelled: { tone: 'neutral', label: 'İptal' },
  refunded: { tone: 'neutral', label: 'İade' },
}

export function StatusBadge({ value }: { value: string }) {
  const s = STATUS_MAP[value] ?? { tone: 'neutral' as Tone, label: value }
  return <Badge tone={s.tone} bracketed>{s.label}</Badge>
}
