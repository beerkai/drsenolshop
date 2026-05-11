import Link from 'next/link'
import { formatPrice } from '@/types'
import type { TopProductRow } from '@/lib/admin-data'
import { EmptyState } from '../ui/EmptyState'

interface Props {
  items: TopProductRow[]
  periodLabel?: string
}

export function TopProductsList({ items, periodLabel = 'Son 30 gün' }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p className="ad-eyebrow-muted">Çok Satan Ürünler</p>
        <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.1em' }}>
          {periodLabel}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Henüz satış verisi yok." hint="İlk sipariş geldiğinde burada görünecek." />
      ) : (
        <div>
          {items.map((p, idx) => {
            const rank = String(idx + 1).padStart(2, '0')
            return (
              <Link
                key={p.product_id ?? p.product_name}
                href={p.product_slug ? `/admin/urunler` : '#'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 4px',
                  borderBottom: '1px solid var(--ad-line-faint)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 120ms',
                }}
              >
                <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: 'var(--ad-gold)', letterSpacing: '0.1em', minWidth: '24px' }}>
                  {rank}
                </span>
                <span style={{ flex: 1, color: 'var(--ad-fg)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.product_name}
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: 'var(--ad-fg-faint)', minWidth: '60px', textAlign: 'right' }}>
                  {p.units} adet
                </span>
                <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '17px', color: 'var(--ad-fg)', fontWeight: 500, minWidth: '90px', textAlign: 'right' }}>
                  {formatPrice(p.revenue)}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
