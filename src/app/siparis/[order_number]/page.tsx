import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getOrderByNumber } from '@/lib/orders'
import { getBankInfo } from '@/lib/site-settings'
import { getSupabaseServer } from '@/lib/supabase-server'
import { maskEmail, maskPhone, maskFullName, maskAddressLine } from '@/lib/pii'
import { formatPrice } from '@/types'
import CancelOrderButton from './CancelOrderButton'

type Props = { params: Promise<{ order_number: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { order_number } = await params
  return {
    title: `Sipariş ${order_number}`,
    description: 'Sipariş detaylarınız.',
    robots: { index: false, follow: false },
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ödeme Bekleniyor',
  paid: 'Ödeme Alındı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
}

export default async function OrderPage({ params }: Props) {
  const { order_number } = await params
  const result = await getOrderByNumber(order_number)
  if (!result) notFound()

  const { order, items } = result

  // Sahip kontrolü: logged-in kullanıcı siparişin email'i veya user_id'siyle
  // eşleşiyor mu? Eşleşmezse kişisel verileri maskele (order_number enumerate
  // edilebildiği için yabancı sipariş numarasıyla erişen kişiye PII verme).
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = Boolean(
    user &&
    (
      (user.email && user.email.toLowerCase() === order.customer_email.toLowerCase()) ||
      (order.user_id && user.id === order.user_id)
    )
  )

  const ship = order.shipping_address as Record<string, string> | null
  const isBankTransfer = order.payment_method === 'bank_transfer'
  const isPaytr = order.payment_method === 'paytr'
  const bankInfo = isBankTransfer ? await getBankInfo() : null
  const hasBankInfo = bankInfo && (bankInfo.bank_name || bankInfo.iban)
  const formatIban = (i: string) => i.replace(/(.{4})/g, '$1 ').trim()

  // Görüntü için PII güvenli alanları hazırla
  const displayEmail = isOwner ? order.customer_email : maskEmail(order.customer_email)
  const displayShipName = isOwner ? (ship?.full_name ?? '') : maskFullName(ship?.full_name)
  const displayShipPhone = isOwner ? (ship?.phone ?? '') : maskPhone(ship?.phone)
  const displayShipLine1 = isOwner ? (ship?.address_line1 ?? '') : maskAddressLine(ship?.address_line1)
  const displayShipLine2 = isOwner ? (ship?.address_line2 ?? '') : (ship?.address_line2 ? '***' : '')

  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#15110D', minHeight: '70vh' }}>
        <div className="px-responsive" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '48px', paddingBottom: '96px' }}>

          {/* Üst — başarı */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 20px', border: '1px solid #C9A961', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <span style={{ color: '#C9A961', fontSize: '24px' }}>✓</span>
            </div>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
              Teşekkürler
            </p>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, lineHeight: 1.1, margin: '0 0 12px' }}>
              Siparişiniz alındı.
            </h1>
            <p style={{ color: '#B8B0A0', fontSize: '15px', marginTop: '8px' }}>
              Sipariş No: <span style={{ fontFamily: 'var(--font-jetbrains)', color: '#F4F0E8', letterSpacing: '0.1em' }}>{order.order_number}</span>
            </p>
            {!isOwner && (
              <p style={{ color: '#6E665A', fontSize: '12px', marginTop: '10px', fontStyle: 'italic' }}>
                Tam detaylar için hesabınıza giriş yapın.
              </p>
            )}
          </div>

          {/* PayTR pending — kart ile ödeme CTA'sı */}
          {isPaytr && order.status === 'pending' && (
            <div style={{ backgroundColor: '#1C1814', border: '1px solid rgba(201,169,97,0.3)', padding: '28px', marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
                Kart ile Ödeme
              </p>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '22px', fontWeight: 500, lineHeight: 1.2, margin: '0 0 12px' }}>
                Kart ile ödemenizi tamamlayın.
              </h2>
              <p style={{ color: '#B8B0A0', fontSize: '14px', lineHeight: 1.7, margin: '0 0 24px' }}>
                <strong style={{ color: '#F4F0E8' }}>{formatPrice(Number(order.total_amount))}</strong> tutarındaki ödemenizi güvenli ödeme sayfamızdan tek seferde gerçekleştirebilirsiniz.
              </p>
              <Link
                href={`/odeme/paytr/${order.order_number}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: '#C9A961',
                  color: '#15110D',
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '11px',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Kart ile Öde →
              </Link>
            </div>
          )}

          {/* Banka bilgileri — havale ise */}
          {isBankTransfer && order.status === 'pending' && (
            <div style={{ backgroundColor: '#1C1814', border: '1px solid rgba(201,169,97,0.3)', padding: '28px', marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
                Banka Bilgileri
              </p>
              <p style={{ color: '#B8B0A0', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                Aşağıdaki hesaba <strong style={{ color: '#F4F0E8' }}>{formatPrice(Number(order.total_amount))}</strong> tutarında havale/EFT gönderin.
                Açıklamaya <strong style={{ color: '#C9A961' }}>{order.order_number}</strong> yazmayı unutmayın.
              </p>
              {hasBankInfo ? (
                <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Row label="Banka" value={bankInfo!.bank_name || '—'} />
                  <Row label="Hesap Sahibi" value={bankInfo!.account_holder || '—'} />
                  <Row label="IBAN" value={bankInfo!.iban ? formatIban(bankInfo!.iban) : '—'} />
                </div>
              ) : (
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#6E665A', fontStyle: 'italic' }}>
                  * Banka bilgileri henüz yapılandırılmamış. Lütfen sipariş onayı için bizimle iletişime geçin.
                </p>
              )}
            </div>
          )}

          {/* Sipariş özeti */}
          <div style={{ backgroundColor: '#1C1814', padding: '28px', marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
              Ürünler
            </p>

            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(244,240,232,0.06)' }}>
                <div style={{ width: '64px', height: '80px', flexShrink: 0, backgroundColor: '#15110D', position: 'relative' }}>
                  {it.product_image ? (
                    <Image src={it.product_image} alt={it.product_name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3530', fontSize: '10px' }}>—</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '16px', fontWeight: 500, lineHeight: 1.3, margin: '0 0 4px' }}>
                    {it.product_name}
                  </p>
                  {it.variant_label && (
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      {it.variant_label}
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#B8B0A0', margin: 0 }}>
                    {it.quantity} × {formatPrice(Number(it.unit_price))}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '16px', fontWeight: 500, margin: 0 }}>
                    {formatPrice(Number(it.subtotal))}
                  </p>
                </div>
              </div>
            ))}

            <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SummaryRow label="Ara Toplam" value={formatPrice(Number(order.subtotal))} />
              <SummaryRow label="· içerisinde KDV" value={formatPrice(Number(order.tax_amount ?? 0))} muted />
              <SummaryRow label="Kargo" value={Number(order.shipping_cost ?? 0) > 0 ? formatPrice(Number(order.shipping_cost)) : 'Ücretsiz'} highlight={Number(order.shipping_cost ?? 0) === 0} />
              <div style={{ borderTop: '1px solid rgba(244,240,232,0.12)', marginTop: '8px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', color: '#F4F0E8', textTransform: 'uppercase' }}>Toplam</span>
                <span style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A961', fontSize: '26px', fontWeight: 500 }}>
                  {formatPrice(Number(order.total_amount))}
                </span>
              </div>
            </div>
          </div>

          {/* İletişim — maskeli/açık */}
          <div style={{ backgroundColor: '#1C1814', padding: '28px', marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
              İletişim
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Row label="E-posta" value={displayEmail} />
              {order.customer_phone && (
                <Row label="Telefon" value={isOwner ? order.customer_phone : maskPhone(order.customer_phone)} />
              )}
            </div>
          </div>

          {/* Teslimat adresi */}
          {ship && (
            <div style={{ backgroundColor: '#1C1814', padding: '28px', marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
                Teslimat
              </p>
              <p style={{ color: '#F4F0E8', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                {displayShipName}<br />
                {displayShipLine1}{displayShipLine2 ? `, ${displayShipLine2}` : ''}<br />
                {ship.district}, {ship.city}{ship.postal_code ? ` ${ship.postal_code}` : ''}<br />
                <span style={{ color: '#6E665A', fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }}>{displayShipPhone}</span>
              </p>
            </div>
          )}

          {/* Durum + Devam + İptal */}
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', color: '#B8B0A0', textTransform: 'uppercase', marginBottom: '24px' }}>
              Durum: <span style={{ color: '#C9A961' }}>{STATUS_LABEL[order.status] ?? order.status}</span>
            </p>
            <Link href="/koleksiyon" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', border: '1px solid rgba(244,240,232,0.2)', color: '#F4F0E8', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Alışverişe Devam Et →
            </Link>

            {/* Müşteri iptal — yalnız pending ve sahip */}
            {order.status === 'pending' && isOwner && (
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(244,240,232,0.08)' }}>
                <p style={{ fontSize: '12px', color: '#6E665A', marginBottom: '14px' }}>
                  Henüz ödeme bekleniyor. İhtiyaç halinde siparişinizi iptal edebilirsiniz.
                </p>
                <CancelOrderButton orderNumber={order.order_number} email={order.customer_email} />
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: '#F4F0E8', letterSpacing: '0.08em' }}>{value}</span>
    </div>
  )
}

function SummaryRow({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: muted ? '11px' : '12px', color: muted ? '#6E665A' : '#B8B0A0' }}>
      <span>{label}</span>
      <span style={highlight ? { color: '#5C7A3F' } : undefined}>{value}</span>
    </div>
  )
}
