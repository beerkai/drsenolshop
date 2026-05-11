import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getCustomerDetail } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { StatusBadge, Badge } from '@/components/admin/ui/Badge'
import { MetricCard } from '@/components/admin/dashboard/MetricCard'

type Props = { params: Promise<{ email: string }> }

export default async function CustomerDetailPage({ params }: Props) {
  await requireAdmin()
  const { email: emailRaw } = await params
  const email = decodeURIComponent(emailRaw)
  const detail = await getCustomerDetail(email)
  if (!detail) notFound()

  return (
    <div>
      <Link
        href="/admin/musteriler"
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: 'var(--ad-fg-muted)',
          textTransform: 'uppercase',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '20px',
        }}
      >
        ← Müşteriler
      </Link>

      {/* Üst — Müşteri kimlik kartı */}
      <div className="ad-card" style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '10px' }}>Müşteri</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, color: 'var(--ad-fg)', lineHeight: 1.1, margin: '0 0 8px' }}>
          {detail.name}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'baseline' }}>
          <a href={`mailto:${detail.email}`} className="ad-mono" style={{ fontSize: '13px', color: 'var(--ad-fg-muted)', textDecoration: 'none' }}>
            {detail.email}
          </a>
          {detail.phone && (
            <a href={`tel:${detail.phone}`} className="ad-mono" style={{ fontSize: '13px', color: 'var(--ad-fg-muted)', textDecoration: 'none' }}>
              {detail.phone}
            </a>
          )}
          <Badge tone="gold" bracketed>
            {detail.total_orders} sipariş
          </Badge>
        </div>
      </div>

      {/* Metrikler */}
      <div className="customer-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <style>{`
          @media (max-width: 1024px) { .customer-metrics { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px)  { .customer-metrics { grid-template-columns: 1fr !important; } }
        `}</style>
        <MetricCard label="Toplam Sipariş" value={detail.total_orders} />
        <MetricCard label="Toplam Ciro" value={formatPrice(detail.total_revenue)} valueGold hint="İptal/iade hariç" />
        <MetricCard label="Ortalama Sepet" value={formatPrice(detail.avg_order_value)} />
        <MetricCard
          label="İlk Sipariş"
          value={new Date(detail.first_order_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
          hint={`Son: ${new Date(detail.last_order_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        />
      </div>

      {/* 2 sütun — Siparişler / Adresler */}
      <div className="customer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <style>{`
          @media (max-width: 1024px) { .customer-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Siparişler tablosu */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p className="ad-eyebrow-muted">Siparişler · {detail.orders.length}</p>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Durum</th>
                  <th className="is-right">Adet</th>
                  <th className="is-right">Tutar</th>
                  <th className="is-right">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {detail.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link
                        href={`/admin/siparisler/${o.order_number}`}
                        className="ad-mono"
                        style={{ fontSize: '12px', color: 'var(--ad-gold-deep)', letterSpacing: '0.06em', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td><StatusBadge value={o.status} /></td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)' }}>
                      {o.item_count}
                    </td>
                    <td className="is-right">
                      <span className="ad-display" style={{ fontSize: '15px', fontWeight: 500 }}>
                        {formatPrice(o.total_amount)}
                      </span>
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                      {new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adresler */}
        <div>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '12px' }}>
            Adresler · {detail.addresses.length}
          </p>
          {detail.addresses.length === 0 ? (
            <div className="ad-empty">
              <p className="ad-empty-hint">Adres kaydı yok.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detail.addresses.map((a, i) => (
                <div key={i} className="ad-card ad-card-sm" style={{ padding: '14px' }}>
                  <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: '0 0 4px', fontWeight: 500 }}>
                    {a.full_name}
                  </p>
                  <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                    {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}
                    <br />
                    {a.district}, {a.city}{a.postal_code ? ` ${a.postal_code}` : ''}
                  </p>
                  <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '6px', letterSpacing: '0.05em' }}>
                    {a.phone}
                  </p>
                  <p className="ad-mono" style={{ fontSize: '9.5px', color: 'var(--ad-fg-faint)', marginTop: '6px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Son: {new Date(a.last_used_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
