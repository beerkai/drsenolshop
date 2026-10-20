import Link from 'next/link'
import type { ListedOrder } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { StatusBadge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'

const PAYMENT_METHOD_TR: Record<string, string> = {
  bank_transfer: 'Havale',
  paytr: 'Kart',
  iyzico: 'Kart',
  stripe: 'Kart',
  cash_on_delivery: 'Kapıda ödeme',
}

const PAYMENT_STATUS_TR: Record<string, string> = {
  pending: 'Bekliyor',
  authorized: 'Onay bekliyor',
  captured: 'Alındı',
  failed: 'Başarısız',
  refunded: 'İade',
}

interface Props {
  orders: ListedOrder[]
  withHeader?: boolean
}

export function RecentOrdersTable({ orders, withHeader = true }: Props) {
  if (orders.length === 0) {
    return <EmptyState title="Henüz sipariş yok." hint="İlk sipariş geldiğinde burada görünecek." />
  }

  return (
    <div className="pn-table-wrap">
      <table className="pn-table pn-table-mobile">
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
              <td className="is-row-head" data-label="Sipariş">
                <Link href={`/admin/siparisler/${o.order_number}`} className="pn-order-link">
                  {o.order_number}
                </Link>
              </td>
              <td data-label="Müşteri">
                <p style={{ color: 'var(--ad-fg)', margin: 0, fontSize: '13px' }}>{o.customer_name}</p>
                <p style={{ color: 'var(--ad-fg-faint)', margin: '2px 0 0', fontSize: '11px' }}>{o.customer_email}</p>
              </td>
              <td data-label="Durum"><StatusBadge value={o.status} /></td>
              <td data-label="Ödeme">
                <p className="pn-pay-method">{PAYMENT_METHOD_TR[o.payment_method] ?? o.payment_method}</p>
                <p className="pn-pay-status">{PAYMENT_STATUS_TR[o.payment_status] ?? o.payment_status}</p>
              </td>
              <td className="is-right" data-label="Tutar">
                <span className="pn-display" style={{ fontSize: '17px', fontWeight: 500 }}>{formatPrice(o.total_amount)}</span>
              </td>
              <td className="is-right pn-mono" data-label="Tarih" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                {new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
