import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/types'
import { StatusBadge } from '@/components/admin/ui/Badge'
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
      <Link href="/admin/siparisler"
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
        ← Siparişler
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {order.order_number}
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '28px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
            Sipariş Detayı
          </h1>
          <p style={{ color: '#6E665A', fontSize: '12px', marginTop: '6px' }}>
            {new Date(order.created_at).toLocaleString('tr-TR')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusBadge value={order.status} />
        </div>
      </div>

      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        <style>{`
          @media (max-width: 1024px) { .order-detail-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* SOL — items + müşteri */}
        <div>
          {/* Items */}
          <div style={{ backgroundColor: '#141210', padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Ürünler ({items?.length ?? 0})
            </p>
            {(items ?? []).map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(244,240,232,0.05)' }}>
                <div style={{ width: '56px', height: '70px', flexShrink: 0, backgroundColor: '#0A0908', position: 'relative' }}>
                  {it.product_image ? (
                    <Image src={it.product_image} alt={it.product_name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3530' }}>—</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '15px', fontWeight: 500, lineHeight: 1.25, margin: '0 0 4px' }}>
                    {it.product_name}
                  </p>
                  {it.variant_label && (
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      {it.variant_label}
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#B8B0A0', margin: 0 }}>
                    {it.quantity} × {formatPrice(Number(it.unit_price))} · KDV %{Number(it.tax_rate ?? 0)}
                  </p>
                  {it.product_slug && (
                    <Link href={`/urun/${it.product_slug}`} target="_blank"
                      style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.18em', color: '#C9A961', textTransform: 'uppercase', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>
                      Siteye git ↗
                    </Link>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '16px', fontWeight: 500, margin: 0 }}>
                    {formatPrice(Number(it.subtotal))}
                  </p>
                </div>
              </div>
            ))}

            <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <SumRow label="Ara Toplam" value={formatPrice(Number(order.subtotal))} />
              <SumRow label="· içerisinde KDV" value={formatPrice(Number(order.tax_amount ?? 0))} muted />
              <SumRow label="Kargo" value={Number(order.shipping_cost ?? 0) > 0 ? formatPrice(Number(order.shipping_cost)) : 'Ücretsiz'} />
              <div style={{ borderTop: '1px solid rgba(244,240,232,0.12)', marginTop: '6px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', color: '#F4F0E8', textTransform: 'uppercase' }}>Toplam</span>
                <span style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A961', fontSize: '22px', fontWeight: 500 }}>
                  {formatPrice(Number(order.total_amount))}
                </span>
              </div>
            </div>
          </div>

          {/* Müşteri + adres */}
          <div style={{ backgroundColor: '#141210', padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Müşteri
            </p>
            <p style={{ color: '#F4F0E8', fontSize: '15px', margin: '0 0 4px' }}>{order.customer_name}</p>
            <p style={{ color: '#B8B0A0', fontSize: '13px', margin: '0 0 2px' }}>{order.customer_email}</p>
            {order.customer_phone && <p style={{ color: '#B8B0A0', fontSize: '13px', margin: 0 }}>{order.customer_phone}</p>}
          </div>

          {ship && (
            <div style={{ backgroundColor: '#141210', padding: '24px' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 16px' }}>
                Teslimat Adresi
              </p>
              <p style={{ color: '#F4F0E8', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {ship.full_name}<br />
                {ship.address_line1}{ship.address_line2 ? `, ${ship.address_line2}` : ''}<br />
                {ship.district}, {ship.city}{ship.postal_code ? ` ${ship.postal_code}` : ''}<br />
                <span style={{ color: '#6E665A', fontSize: '12px' }}>{ship.phone}</span>
              </p>
            </div>
          )}

          {order.notes && (
            <div style={{ backgroundColor: '#141210', padding: '24px', marginTop: '20px' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Müşteri Notu
              </p>
              <p style={{ color: '#F4F0E8', fontSize: '13px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* SAĞ — aksiyon paneli */}
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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: muted ? '11px' : '12px', color: muted ? '#6E665A' : '#B8B0A0' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
