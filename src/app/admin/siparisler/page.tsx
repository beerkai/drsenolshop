import { requireAdmin } from '@/lib/admin-auth'
import { listOrders } from '@/lib/admin-data'
import { OrdersTable } from '../page'
import Link from 'next/link'

const STATUS_FILTERS = [
  { value: '',           label: 'Tümü' },
  { value: 'pending',    label: 'Bekliyor' },
  { value: 'paid',       label: 'Ödendi' },
  { value: 'preparing',  label: 'Hazırlanıyor' },
  { value: 'shipped',    label: 'Kargoda' },
  { value: 'delivered',  label: 'Teslim' },
  { value: 'cancelled',  label: 'İptal' },
]

type SP = Promise<{ status?: string; page?: string }>

export default async function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const status = sp.status || undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 30
  const offset = (page - 1) * limit

  const { orders, total } = await listOrders({ status, limit, offset })
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Yönetim
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '32px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
          Siparişler <span style={{ color: '#6E665A', fontSize: '20px' }}>({total})</span>
        </h1>
      </div>

      {/* Filtre çubuğu */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {STATUS_FILTERS.map((f) => {
          const isActive = (status ?? '') === f.value
          const href = f.value ? `/admin/siparisler?status=${f.value}` : '/admin/siparisler'
          return (
            <Link key={f.value || 'all'} href={href}
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                color: isActive ? '#C9A961' : '#B8B0A0',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '8px 14px',
                border: isActive ? '1px solid #C9A961' : '1px solid rgba(244,240,232,0.12)',
                backgroundColor: isActive ? 'rgba(201,169,97,0.06)' : 'transparent',
              }}>
              {f.label}
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <p style={{ color: '#6E665A', fontSize: '14px', padding: '40px', textAlign: 'center', border: '1px dashed rgba(244,240,232,0.08)' }}>
          Bu filtreyle sipariş bulunamadı.
        </p>
      ) : (
        <>
          <OrdersTable orders={orders} />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === page
                const params = new URLSearchParams()
                if (status) params.set('status', status)
                if (p > 1) params.set('page', String(p))
                const href = `/admin/siparisler${params.toString() ? '?' + params.toString() : ''}`
                return (
                  <Link key={p} href={href}
                    style={{
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: '11px',
                      color: isActive ? '#C9A961' : '#B8B0A0',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      border: '1px solid ' + (isActive ? '#C9A961' : 'rgba(244,240,232,0.1)'),
                    }}>
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
