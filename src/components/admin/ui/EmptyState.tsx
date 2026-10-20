import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="pn-empty">
      {icon && <div className="pn-empty-icon">{icon}</div>}
      <p className="pn-empty-title">{title}</p>
      {hint && <p className="pn-empty-hint">{hint}</p>}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}
