import Link from 'next/link'
import type { LowStockRow } from '@/lib/admin-data'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'

interface Props {
  items: LowStockRow[]
}

export function LowStockList({ items }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p className="ad-eyebrow-muted">Düşük Stok Uyarısı</p>
        {items.length > 0 && (
          <Link href="/admin/stok"
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px',
              color: 'var(--ad-gold)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
            Tümü →
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Stok seviyeleri sağlıklı." hint="Hiç düşük stok ürün yok." />
      ) : (
        <div>
          {items.map((it) => {
            const tone = it.stock === 0 ? 'danger' : it.stock <= 2 ? 'warning' : 'gold'
            return (
              <Link
                key={`${it.product_id}-${it.variant_label ?? 'base'}`}
                href={`/admin/urunler/${it.product_id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 4px',
                  borderBottom: '1px solid var(--ad-line-faint)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.product_name}
                  </p>
                  {it.variant_label && (
                    <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: 'var(--ad-fg-faint)', margin: '2px 0 0', letterSpacing: '0.1em' }}>
                      {it.variant_label}
                    </p>
                  )}
                </span>
                <Badge tone={tone} bracketed>
                  {it.stock} ADET
                </Badge>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
