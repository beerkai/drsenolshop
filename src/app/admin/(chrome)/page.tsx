import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import {
  getDashboardStatsV2,
  getLowStock,
  getTopProducts,
  listOrders,
} from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { TopProductsList } from '@/components/admin/dashboard/TopProductsList'
import { RealtimeOrdersBanner } from '@/components/admin/dashboard/RealtimeOrdersBanner'
import { WorkQueue, type WorkQueueRow } from '@/components/admin/dashboard/WorkQueue'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default async function AdminDashboardPage() {
  const ctx = await requireAdmin()

  const [stats, pending, paid, preparing, lowStock, topProducts] = await Promise.all([
    getDashboardStatsV2(),
    listOrders({ status: 'pending', limit: 5 }),
    listOrders({ status: 'paid', limit: 5 }),
    listOrders({ status: 'preparing', limit: 5 }),
    getLowStock(5, 6),
    getTopProducts(30, 5),
  ])

  const name = ctx.admin.full_name?.split(' ')[0] ?? 'Patron'
  const toShip = [...paid.orders, ...preparing.orders]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 5)

  const pendingRows: WorkQueueRow[] = pending.orders.map((order) => ({
    key: order.id,
    href: `/admin/siparisler/${order.order_number}`,
    title: order.customer_name || order.order_number,
    meta: order.order_number,
    aside: formatPrice(order.total_amount),
  }))

  const shipRows: WorkQueueRow[] = toShip.map((order) => ({
    key: order.id,
    href: `/admin/siparisler/${order.order_number}`,
    title: order.customer_name || order.order_number,
    meta: order.status === 'preparing' ? `${order.order_number} · hazırlanıyor` : `${order.order_number} · ödendi`,
    aside: formatPrice(order.total_amount),
  }))

  const stockRows: WorkQueueRow[] = lowStock.map((item) => ({
    key: `${item.product_id}-${item.variant_label ?? 'base'}`,
    href: `/admin/urunler/${item.product_id}`,
    title: item.product_name,
    meta: item.variant_label || 'Stok',
    aside: item.stock === 0 ? 'Tükendi' : `${item.stock} adet`,
  }))

  return (
    <div className="ad-page">
      <RealtimeOrdersBanner />

      <header className="ad-page-head ad-dash-head">
        <div>
          <p className="ad-eyebrow">Bugün</p>
          <h1 className="ad-display ad-page-title">{greeting()}, {name}.</h1>
          <p className="ad-page-lead">
            {stats.today.orders} sipariş · {formatPrice(stats.today.revenue)} ciro · {stats.pending} ödeme bekliyor
          </p>
        </div>
        <div className="ad-dash-actions">
          <Link href="/admin/siparisler?status=pending" className="ad-btn ad-btn-secondary ad-btn-sm">Bekleyenler</Link>
          <Link href="/admin/siparisler?status=paid" className="ad-btn ad-btn-primary ad-btn-sm">Kargoya hazır</Link>
        </div>
      </header>

      <div className="ad-queue-grid">
        <WorkQueue
          title="Ödeme bekliyor"
          hint="Havale veya yarım kalan ödeme"
          href="/admin/siparisler?status=pending"
          empty="Bekleyen ödeme yok."
          rows={pendingRows}
        />
        <WorkQueue
          title="Kargoya ver"
          hint="Ödendi veya hazırlanıyor"
          href="/admin/siparisler?status=paid"
          empty="Kargoya verilecek sipariş yok."
          rows={shipRows}
        />
        <WorkQueue
          title="Stok azalıyor"
          hint="Önce tükenenler"
          href="/admin/stok"
          empty="Stoklar yerinde."
          rows={stockRows}
        />
      </div>

      <div className="metric-grid ad-metric-grid">
        <MetricCard label="Bugün · sipariş" value={stats.today.orders} hint={stats.today.orders === 0 ? 'Henüz sipariş yok' : 'Aktif gün'} />
        <MetricCard label="Bugün · ciro" value={formatPrice(stats.today.revenue)} />
        <MetricCard label="Son 7 gün" value={formatPrice(stats.last7.revenue)} delta={stats.last7.deltaPct} deltaLabel="önceki 7 güne göre" sparkline={stats.last7.sparkline} />
        <MetricCard label="Son 30 gün" value={formatPrice(stats.last30.revenue)} delta={stats.last30.deltaPct} deltaLabel="önceki 30 güne göre" sparkline={stats.last30.sparkline} />
      </div>

      <div className="ad-card">
        <TopProductsList items={topProducts} />
      </div>
    </div>
  )
}
