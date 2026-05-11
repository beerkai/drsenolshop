import { requireAdmin } from '@/lib/admin-auth'
import { listOrders } from '@/lib/admin-data'
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable'
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
      {/* Başlık */}
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Yönetim</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Siparişler <span style={{ color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '0.55em', letterSpacing: '0.1em', marginLeft: '8px' }}>{total}</span>
        </h1>
      </div>

      {/* Filtre çubuğu */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        {STATUS_FILTERS.map((f) => {
          const isActive = (status ?? '') === f.value
          const href = f.value ? `/admin/siparisler?status=${f.value}` : '/admin/siparisler'
          return (
            <Link key={f.value || 'all'} href={href}
              className={['ad-btn', 'ad-btn-sm', isActive ? 'ad-btn-primary' : 'ad-btn-secondary'].join(' ')}>
              {f.label}
            </Link>
          )
        })}
      </div>

      <RecentOrdersTable orders={orders} />

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === page
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            if (p > 1) params.set('page', String(p))
            const href = `/admin/siparisler${params.toString() ? '?' + params.toString() : ''}`
            return (
              <Link key={p} href={href}
                className={['ad-btn', 'ad-btn-sm', isActive ? 'ad-btn-primary' : 'ad-btn-secondary'].join(' ')}>
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
