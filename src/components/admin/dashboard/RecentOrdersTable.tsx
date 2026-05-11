import Link from 'next/link'
import type { ListedOrder } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { StatusBadge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'

interface Props {
  orders: ListedOrder[]
  withHeader?: boolean
}

export function RecentOrdersTable({ orders, withHeader = true }: Props) {
  if (orders.length === 0) {
    return <EmptyState title="Henüz sipariş yok." hint="İlk sipariş geldiğinde burada görünecek." />
  }

  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        {withHeader && (
          <thead>
            <tr>
              <th>Sipariş</th>
              <th>Müşteri</th>
              <th>Durum</th>
              <th>Ödeme</th>
              <th className="is-right">Tutar</th>
              <th className="is-right">Tarih</th>
            </tr>
          </thead>
        )}
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link
                  href={`/admin/siparisler/${o.order_number}`}
                  style={{
                    fontFamily: 'var(--font-jetbrains), monospace',
                    fontSize: '12px',
                    color: 'var(--ad-gold-deep)',
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {o.order_number}
                </Link>
              </td>
              <td>
                <p style={{ color: 'var(--ad-fg)', margin: 0, fontSize: '13px' }}>{o.customer_name}</p>
                <p style={{ color: 'var(--ad-fg-faint)', margin: '2px 0 0', fontSize: '11px' }}>{o.customer_email}</p>
              </td>
              <td><StatusBadge value={o.status} /></td>
              <td>
                <p className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
                  {o.payment_method === 'bank_transfer' ? 'Havale' : o.payment_method}
                </p>
                <p className="ad-mono" style={{ fontSize: '9.5px', color: 'var(--ad-fg-faint)', letterSpacing: '0.1em', margin: '2px 0 0', textTransform: 'uppercase' }}>
                  {o.payment_status}
                </p>
              </td>
              <td className="is-right">
                <span className="ad-display" style={{ fontSize: '17px', fontWeight: 500 }}>{formatPrice(o.total_amount)}</span>
              </td>
              <td className="is-right ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                {new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
