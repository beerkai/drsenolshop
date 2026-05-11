import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="ad-empty">
      {icon && <div className="ad-empty-icon">{icon}</div>}
      <p className="ad-empty-title">{title}</p>
      {hint && <p className="ad-empty-hint">{hint}</p>}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}
