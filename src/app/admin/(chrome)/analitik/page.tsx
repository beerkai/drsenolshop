import { requireAdmin } from '@/lib/admin-auth'
import { getAnalyticsSnapshot } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'
import { Sparkline } from '@/components/admin/ui/Sparkline'

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const snap = await getAnalyticsSnapshot()

  const dailyRevenue = snap.series30.map((d) => d.revenue)
  const dailyOrders = snap.series30.map((d) => d.orders)
  const maxRev = Math.max(...dailyRevenue, 1)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>İçgörü</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Analitik
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Tüm zamanlar — sipariş ve ciro odaklı temel metrikler.
        </p>
      </div>

      {/* Metrik kartları */}
      <div className="an-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <style>{`
          @media (max-width: 1024px) { .an-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px)  { .an-grid { grid-template-columns: 1fr !important; } }
        `}</style>
        <MetricCard label="Toplam Sipariş" value={snap.totalOrders} hint="Tüm zamanlar" />
        <MetricCard label="Toplam Ciro" value={formatPrice(snap.totalRevenue)} valueGold hint="İptal/iade hariç" />
        <MetricCard label="Tekil Müşteri" value={snap.totalCustomers} hint="Email bazında" />
        <MetricCard label="Ortalama Sepet" value={formatPrice(snap.avgOrderValue)} hint="Başarılı sipariş ort." />
      </div>

      {/* 30 günlük ciro bar chart */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p className="ad-eyebrow-muted">Son 30 Gün · Günlük Ciro</p>
          <span className="ad-display" style={{ fontSize: '20px', fontWeight: 500, color: 'var(--ad-gold-deep)' }}>
            {formatPrice(snap.series30.reduce((s, d) => s + d.revenue, 0))}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px' }}>
          {snap.series30.map((d, i) => {
            const h = (d.revenue / maxRev) * 100
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} title={`${d.date}: ${formatPrice(d.revenue)} · ${d.orders} sipariş`}>
                <span
                  style={{
                    width: '100%',
                    minHeight: d.revenue > 0 ? '2px' : '0',
                    height: `${h}%`,
                    backgroundColor: d.revenue === 0 ? 'var(--ad-line-faint)' : 'var(--ad-gold)',
                    opacity: d.revenue === 0 ? 0.4 : 1,
                  }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
          <span>{snap.series30[0]?.date.slice(5) ?? ''}</span>
          <span>{snap.series30[Math.floor(snap.series30.length / 2)]?.date.slice(5) ?? ''}</span>
          <span>{snap.series30[snap.series30.length - 1]?.date.slice(5) ?? ''}</span>
        </div>
      </div>

      {/* Sipariş hacmi sparkline */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p className="ad-eyebrow-muted">Son 30 Gün · Günlük Sipariş Hacmi</p>
          <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)' }}>
            toplam <strong style={{ color: 'var(--ad-fg)' }}>{snap.series30.reduce((s, d) => s + d.orders, 0)}</strong>
          </span>
        </div>
        <Sparkline data={dailyOrders} width={680} height={60} color="var(--ad-gold-deep)" fillColor="var(--ad-gold)" />
      </div>

      {/* Durum dağılımı */}
      <div className="ad-card">
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Sipariş Durum Dağılımı</p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <StatRow label="Başarılı (paid/preparing/shipped/delivered)" value={snap.paidOrders} color="var(--ad-success)" />
          <StatRow label="İptal" value={snap.cancelledOrders} color="var(--ad-danger)" />
          <StatRow label="Diğer (pending vs.)" value={Math.max(0, snap.totalOrders - snap.paidOrders - snap.cancelledOrders)} color="var(--ad-fg-faint)" />
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p className="ad-display" style={{ fontSize: '28px', fontWeight: 500, color, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}
