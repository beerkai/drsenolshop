import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import {
  getDashboardStatsV2,
  getHourlyOrdersToday,
  getTopProducts,
  getLowStock,
  listOrders,
} from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { HourlyOrdersBar } from '@/components/admin/dashboard/HourlyOrdersBar'
import { TopProductsList } from '@/components/admin/dashboard/TopProductsList'
import { LowStockList } from '@/components/admin/dashboard/LowStockList'
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable'
import { RealtimeOrdersBanner } from '@/components/admin/dashboard/RealtimeOrdersBanner'
import { IconArrowRight } from '@/components/admin/ui/Icon'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default async function AdminDashboardPage() {
  const ctx = await requireAdmin()

  // Tüm verileri paralel çek
  const [stats, hourly, topProducts, lowStock, recent] = await Promise.all([
    getDashboardStatsV2(),
    getHourlyOrdersToday(),
    getTopProducts(30, 5),
    getLowStock(5, 6),
    listOrders({ limit: 6 }),
  ])

  const name = ctx.admin.full_name?.split(' ')[0] ?? 'Patron'

  return (
    <div>
      {/* Realtime canlı sipariş banner'ı */}
      <RealtimeOrdersBanner />

      {/* Hero — selamlama + günün özeti */}
      <div className="pano-hero" style={{ marginBottom: '28px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <style>{`
          @media (max-width: 640px) {
            .pano-hero h1 { font-size: 22px !important; line-height: 1.15 !important; }
            .pano-hero .pano-actions { width: 100%; }
            .pano-hero .pano-actions > * { flex: 1; }
          }
        `}</style>
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Pano</p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: '0 0 10px' }}>
            {greeting()},{' '}
            <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400 }}>{name}.</span>
          </h1>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '14px', margin: 0 }}>
            Bugün <strong style={{ color: 'var(--ad-fg)', fontVariantNumeric: 'tabular-nums' }}>{stats.today.orders}</strong> sipariş ·
            {' '}<strong style={{ color: 'var(--ad-fg)' }}>{formatPrice(stats.today.revenue)}</strong> ciro ·
            {' '}<strong style={{ color: stats.pending > 0 ? 'var(--ad-warning)' : 'var(--ad-fg)' }}>{stats.pending}</strong> bekleyen
          </p>
        </div>

        <div className="pano-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/admin/siparisler?status=pending" className="ad-btn ad-btn-secondary ad-btn-sm">
            Bekleyenler
          </Link>
          <Link href="/admin/siparisler" className="ad-btn ad-btn-primary ad-btn-sm">
            Tüm Siparişler <IconArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <style>{`
          @media (max-width: 1024px) { .metric-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px)  { .metric-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        <MetricCard
          label="Bugün · Sipariş"
          value={stats.today.orders}
          hint={stats.today.orders === 0 ? 'Henüz bugün sipariş yok' : 'Aktif gün'}
        />
        <MetricCard
          label="Bugün · Ciro"
          value={formatPrice(stats.today.revenue)}
          valueGold
        />
        <MetricCard
          label="Son 7 Gün · Ciro"
          value={formatPrice(stats.last7.revenue)}
          delta={stats.last7.deltaPct}
          deltaLabel="vs önceki 7 gün"
          sparkline={stats.last7.sparkline}
        />
        <MetricCard
          label="Son 30 Gün · Ciro"
          value={formatPrice(stats.last30.revenue)}
          delta={stats.last30.deltaPct}
          deltaLabel="vs önceki 30 gün"
          sparkline={stats.last30.sparkline}
        />
      </div>

      {/* Saat saat + Düşük stok */}
      <div className="dash-row-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <style>{`
          @media (max-width: 900px) { .dash-row-2 { grid-template-columns: 1fr !important; } }
        `}</style>

        <div className="ad-card">
          <HourlyOrdersBar hours={hourly} />
        </div>

        <div className="ad-card">
          <LowStockList items={lowStock} />
        </div>
      </div>

      {/* Top satan + Son siparişler */}
      <div className="dash-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="ad-card">
          <TopProductsList items={topProducts} />
        </div>

        <div className="ad-card">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p className="ad-eyebrow-muted">Son Siparişler</p>
            <Link href="/admin/siparisler" style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: 'var(--ad-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Tümü →
            </Link>
          </div>
          {recent.orders.length === 0 ? (
            <p style={{ color: 'var(--ad-fg-faint)', fontSize: '13px', padding: '12px 0' }}>Henüz sipariş yok.</p>
          ) : (
            <div>
              {recent.orders.slice(0, 6).map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/siparisler/${o.order_number}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--ad-line-faint)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: 'var(--ad-gold-deep)', letterSpacing: '0.06em', minWidth: '110px' }}>
                    {o.order_number}
                  </span>
                  <span style={{ flex: 1, color: 'var(--ad-fg)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.customer_name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '16px', fontWeight: 500, minWidth: '80px', textAlign: 'right' }}>
                    {formatPrice(o.total_amount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sistem durumu */}
      <div className="ad-card">
        <p className="ad-eyebrow-muted" style={{ marginBottom: '14px' }}>Sistem Durumu</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <SystemPill label="Veritabanı" status="ok" />
          <SystemPill label="Storage" status="ok" />
          <SystemPill label="Telegram Bot" status={process.env.TELEGRAM_BOT_TOKEN ? 'ok' : 'idle'} />
          <SystemPill label="Ödeme" status="idle" hint="Iyzico bekliyor" />
        </div>
      </div>
    </div>
  )
}

function SystemPill({ label, status, hint }: { label: string; status: 'ok' | 'idle' | 'down'; hint?: string }) {
  const color = status === 'ok' ? 'var(--ad-success)' : status === 'idle' ? 'var(--ad-fg-faint)' : 'var(--ad-danger)'
  const dotState = status === 'ok' ? 'is-idle' : status === 'idle' ? 'is-offline' : ''
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 14px', border: '1px solid var(--ad-line-faint)' }}>
      <span className={`ad-live-dot ${dotState}`} aria-hidden style={{ width: '6px', height: '6px' }} />
      <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '12px', color: 'var(--ad-fg)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', letterSpacing: '0.1em', color, textTransform: 'uppercase' }}>
        {status === 'ok' ? 'Çalışıyor' : status === 'idle' ? 'Bekliyor' : 'Çevrimdışı'}
      </span>
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>· {hint}</span>
      )}
    </div>
  )
}
