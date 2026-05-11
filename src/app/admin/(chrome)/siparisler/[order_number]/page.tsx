import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/types'
import { StatusBadge } from '@/components/admin/ui/Badge'
import { IconExternal } from '@/components/admin/ui/Icon'
import OrderActions from './OrderActions'

type Props = { params: Promise<{ order_number: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin()
  const { order_number } = await params

  const supabase = getSupabaseAdmin()
  const { data: order } = await supabase.from('orders').select('*').eq('order_number', order_number).maybeSingle()
  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  const ship = order.shipping_address as Record<string, string> | null

  return (
    <div>
      <Link
        href="/admin/siparisler"
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
        ← Siparişler
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <p
            className="ad-mono"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: 'var(--ad-gold-deep)',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              fontWeight: 500,
            }}
          >
            {order.order_number}
          </p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
            Sipariş Detayı
          </h1>
          <p style={{ color: 'var(--ad-fg-faint)', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-jetbrains), monospace' }}>
            {new Date(order.created_at).toLocaleString('tr-TR')}
          </p>
        </div>
        <StatusBadge value={order.status} />
      </div>

      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        <style>{`
          @media (max-width: 1024px) { .order-detail-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* SOL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Items */}
          <div className="ad-card">
            <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>
              Ürünler · {items?.length ?? 0}
            </p>
            {(items ?? []).map((it) => (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '14px',
                  marginBottom: '14px',
                  borderBottom: '1px solid var(--ad-line-faint)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '70px',
                    flexShrink: 0,
                    backgroundColor: 'var(--ad-surface-2)',
                    position: 'relative',
                    border: '1px solid var(--ad-line-faint)',
                  }}
                >
                  {it.product_image ? (
                    <Image src={it.product_image} alt={it.product_name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-fg-faint)' }}>
                      —
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--ad-fg)', fontSize: '14px', fontWeight: 500, lineHeight: 1.3, margin: '0 0 4px' }}>
                    {it.product_name}
                  </p>
                  {it.variant_label && (
                    <p
                      className="ad-mono"
                      style={{
                        fontSize: '9.5px',
                        letterSpacing: '0.18em',
                        color: 'var(--ad-fg-faint)',
                        textTransform: 'uppercase',
                        margin: '0 0 6px',
                      }}
                    >
                      {it.variant_label}
                    </p>
                  )}
                  <p className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', margin: 0 }}>
                    {it.quantity} × {formatPrice(Number(it.unit_price))} · KDV %{Number(it.tax_rate ?? 0)}
                  </p>
                  {it.product_slug && (
                    <Link
                      href={`/urun/${it.product_slug}`}
                      target="_blank"
                      style={{
                        fontFamily: 'var(--font-jetbrains), monospace',
                        fontSize: '9.5px',
                        letterSpacing: '0.18em',
                        color: 'var(--ad-gold-deep)',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Siteye git <IconExternal size={9} />
                    </Link>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p className="ad-display" style={{ fontSize: '17px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0 }}>
                    {formatPrice(Number(it.subtotal))}
                  </p>
                </div>
              </div>
            ))}

            {/* Toplamlar */}
            <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <SumRow label="Ara Toplam" value={formatPrice(Number(order.subtotal))} />
              <SumRow label="· içerisinde KDV" value={formatPrice(Number(order.tax_amount ?? 0))} muted />
              <SumRow
                label="Kargo"
                value={Number(order.shipping_cost ?? 0) > 0 ? formatPrice(Number(order.shipping_cost)) : 'Ücretsiz'}
              />
              <div
                style={{
                  borderTop: '1px solid var(--ad-line)',
                  marginTop: '8px',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  className="ad-mono"
                  style={{ fontSize: '11px', letterSpacing: '0.22em', color: 'var(--ad-fg)', textTransform: 'uppercase' }}
                >
                  Toplam
                </span>
                <span className="ad-display" style={{ fontSize: '24px', fontWeight: 500, color: 'var(--ad-gold-deep)' }}>
                  {formatPrice(Number(order.total_amount))}
                </span>
              </div>
            </div>
          </div>

          {/* Müşteri */}
          <div className="ad-card">
            <p className="ad-eyebrow-muted" style={{ marginBottom: '14px' }}>Müşteri</p>
            <p style={{ color: 'var(--ad-fg)', fontSize: '15px', margin: '0 0 4px', fontWeight: 500 }}>{order.customer_name}</p>
            <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '0 0 2px' }}>{order.customer_email}</p>
            {order.customer_phone && (
              <p className="ad-mono" style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: 0 }}>
                {order.customer_phone}
              </p>
            )}
          </div>

          {/* Adres */}
          {ship && (
            <div className="ad-card">
              <p className="ad-eyebrow-muted" style={{ marginBottom: '14px' }}>Teslimat Adresi</p>
              <p style={{ color: 'var(--ad-fg)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                <strong>{ship.full_name}</strong>
                <br />
                {ship.address_line1}
                {ship.address_line2 ? `, ${ship.address_line2}` : ''}
                <br />
                {ship.district}, {ship.city}
                {ship.postal_code ? ` ${ship.postal_code}` : ''}
                <br />
                <span className="ad-mono" style={{ color: 'var(--ad-fg-faint)', fontSize: '12px' }}>{ship.phone}</span>
              </p>
            </div>
          )}

          {order.notes && (
            <div className="ad-card">
              <p className="ad-eyebrow-muted" style={{ marginBottom: '12px' }}>Müşteri Notu</p>
              <p style={{ color: 'var(--ad-fg)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* SAĞ — Aksiyon Paneli */}
        <div>
          <OrderActions
            orderId={order.id}
            orderNumber={order.order_number}
            status={order.status}
            paymentStatus={order.payment_status}
            paymentMethod={order.payment_method}
            paymentRef={order.payment_ref}
            trackingNumber={order.tracking_number}
          />
        </div>
      </div>
    </div>
  )
}

function SumRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className="ad-mono"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: muted ? '11px' : '12px',
        color: muted ? 'var(--ad-fg-faint)' : 'var(--ad-fg-muted)',
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
