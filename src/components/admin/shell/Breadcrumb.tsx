import Link from 'next/link'

export interface Crumb {
  label: string
  href?: string
}

interface Props {
  items: Crumb[]
}

/** Mono breadcrumb: "Admin › Siparişler › DS-2026-0001" */
export function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="ad-breadcrumb">
      {items.map((crumb, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className={isLast ? 'is-current' : undefined}>{crumb.label}</span>
            )}
            {!isLast && <span className="ad-breadcrumb-sep">›</span>}
          </span>
        )
      })}
    </nav>
  )
}
