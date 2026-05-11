import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { getDashboardStats, listOrders } from '@/lib/admin-data'
import { formatPrice } from '@/types'

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getDashboardStats()
  const recent = await listOrders({ limit: 8 })

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Pano
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '36px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
          Genel bakış.
        </h1>
      </div>

      {/* İstatistik kartları */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'rgba(244,240,232,0.08)', border: '1px solid rgba(244,240,232,0.08)', marginBottom: '48px' }}>
        <style>{`
          @media (max-width: 768px) { .stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr !important; } }
        `}</style>
        <Stat label="Bugün · Sipariş" value={String(stats.todayOrders)} />
        <Stat label="Bugün · Ciro" value={formatPrice(stats.todayRevenue)} />
        <Stat label="Bekleyen" value={String(stats.pendingOrders)} highlight={stats.pendingOrders > 0} />
        <Stat label="Düşük Stok" value={String(stats.lowStockProducts)} highlight={stats.lowStockProducts > 0} />
      </div>

      {/* 30 günlük */}
      <div style={{ marginBottom: '48px', padding: '24px', backgroundColor: '#141210', border: '1px solid rgba(244,240,232,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Son 30 Gün
        </p>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '32px', fontWeight: 500, lineHeight: 1, margin: 0 }}>
              {stats.totalOrders30d}
            </p>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', color: '#6E665A', textTransform: 'uppercase', marginTop: '6px' }}>
              Sipariş
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A961', fontSize: '32px', fontWeight: 500, lineHeight: 1, margin: 0 }}>
              {formatPrice(stats.totalRevenue30d)}
            </p>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', color: '#6E665A', textTransform: 'uppercase', marginTop: '6px' }}>
              Ciro
            </p>
          </div>
        </div>
      </div>

      {/* Son siparişler */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '22px', fontWeight: 500, margin: 0 }}>
            Son siparişler
          </h2>
          <Link href="/admin/siparisler" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#C9A961', textTransform: 'uppercase', textDecoration: 'none' }}>
            Tümü →
          </Link>
        </div>

        {recent.orders.length === 0 ? (
          <p style={{ color: '#6E665A', fontSize: '14px', padding: '24px', textAlign: 'center', border: '1px dashed rgba(244,240,232,0.08)' }}>
            Henüz sipariş yok.
          </p>
        ) : (
          <OrdersTable orders={recent.orders} />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ backgroundColor: '#141210', padding: '24px' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.25em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 12px' }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-cormorant)',
        color: highlight ? '#C9A961' : '#F4F0E8',
        fontSize: '28px',
        fontWeight: 500,
        lineHeight: 1,
        margin: 0,
      }}>
        {value}
      </p>
    </div>
  )
}

// Pano + listeleme sayfasının ortak tablo bileşeni
import type { ListedOrder } from '@/lib/admin-data'

export function OrdersTable({ orders }: { orders: ListedOrder[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', backgroundColor: '#141210' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(244,240,232,0.1)' }}>
            <Th>Sipariş No</Th>
            <Th>Müşteri</Th>
            <Th>Durum</Th>
            <Th>Ödeme</Th>
            <Th align="right">Tutar</Th>
            <Th align="right">Tarih</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid rgba(244,240,232,0.04)' }}>
              <td style={{ padding: '14px 16px' }}>
                <Link href={`/admin/siparisler/${o.order_number}`}
                  style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: '#C9A961', letterSpacing: '0.08em', textDecoration: 'none' }}>
                  {o.order_number}
                </Link>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ color: '#F4F0E8', fontSize: '13px', margin: 0 }}>{o.customer_name}</p>
                <p style={{ color: '#6E665A', fontSize: '11px', margin: '2px 0 0' }}>{o.customer_email}</p>
              </td>
              <td style={{ padding: '14px 16px' }}><StatusPill value={o.status} /></td>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#B8B0A0', textTransform: 'uppercase', margin: 0 }}>
                  {o.payment_method === 'bank_transfer' ? 'Havale' : o.payment_method}
                </p>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#6E665A', textTransform: 'uppercase', margin: '2px 0 0' }}>
                  {o.payment_status}
                </p>
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '17px', fontWeight: 500 }}>
                {formatPrice(o.total_amount)}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#6E665A' }}>
                {new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      padding: '14px 16px',
      textAlign: align ?? 'left',
      fontFamily: 'var(--font-jetbrains)',
      fontSize: '9px',
      letterSpacing: '0.22em',
      color: '#6E665A',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>
      {children}
    </th>
  )
}

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  pending:    { bg: 'rgba(200,71,45,0.12)',  fg: '#D4715A', label: 'Bekliyor' },
  paid:       { bg: 'rgba(92,122,63,0.12)',  fg: '#8AA868', label: 'Ödendi' },
  preparing:  { bg: 'rgba(201,169,97,0.12)', fg: '#C9A961', label: 'Hazırlanıyor' },
  shipped:    { bg: 'rgba(201,169,97,0.18)', fg: '#D4B570', label: 'Kargoda' },
  delivered:  { bg: 'rgba(92,122,63,0.18)',  fg: '#A6C481', label: 'Teslim' },
  cancelled:  { bg: 'rgba(244,240,232,0.06)', fg: '#6E665A', label: 'İptal' },
  refunded:   { bg: 'rgba(244,240,232,0.06)', fg: '#6E665A', label: 'İade' },
}

export function StatusPill({ value }: { value: string }) {
  const s = STATUS_STYLES[value] ?? { bg: 'rgba(244,240,232,0.06)', fg: '#B8B0A0', label: value }
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: s.bg,
      color: s.fg,
      fontFamily: 'var(--font-jetbrains)',
      fontSize: '10px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '4px 8px',
    }}>
      {s.label}
    </span>
  )
}
