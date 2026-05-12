import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getOrderByNumber } from '@/lib/orders'
import { formatPrice } from '@/types'

export const metadata: Metadata = {
  title: 'Sipariş Takibi',
  description: 'Sipariş numaranızla siparişinizin durumunu kontrol edin.',
  robots: { index: false, follow: false },
}

const STATUS_TIMELINE: Array<{ key: string; label: string; description: string }> = [
  { key: 'pending', label: 'Ödeme Bekleniyor', description: 'Havale/EFT bekleniyor' },
  { key: 'paid', label: 'Ödeme Alındı', description: 'Ödemeniz onaylandı' },
  { key: 'preparing', label: 'Hazırlanıyor', description: 'Siparişiniz paketleniyor' },
  { key: 'shipped', label: 'Kargoda', description: 'Kargo firmasına teslim edildi' },
  { key: 'delivered', label: 'Teslim Edildi', description: 'Siparişiniz size ulaştı' },
]

function statusIndex(status: string): number {
  const i = STATUS_TIMELINE.findIndex((s) => s.key === status)
  return i === -1 ? 0 : i
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

type SP = Promise<{ order?: string; email?: string }>

export default async function SiparisTakibiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const orderInput = sp.order?.trim().toUpperCase() ?? ''
  const emailInput = sp.email?.trim().toLowerCase() ?? ''
  const submitted = orderInput.length > 0 && emailInput.length > 0

  let result: Awaited<ReturnType<typeof getOrderByNumber>> = null
  let queryError: string | null = null

  if (submitted) {
    result = await getOrderByNumber(orderInput)
    if (!result) {
      queryError = `${orderInput} numaralı bir sipariş bulunamadı.`
    } else if (result.order.customer_email.toLowerCase() !== emailInput) {
      // Email eşleşmiyorsa siparişi gizli tut — saldırgana ipucu verme
      queryError = 'Sipariş numarası ve e-posta eşleşmiyor. Bilgileri kontrol edin.'
      result = null
    }
  }

  return (
    <>
      <Header />
      <main style={{ background: '#0A0908', minHeight: '70vh' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{ padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 48px)', borderBottom: '1px solid rgba(244,240,232,0.08)' }}
        >
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', textDecoration: 'none' }}>
              Anasayfa
            </Link>
            <span style={{ color: 'rgba(244,240,232,0.15)', fontSize: '10px' }}>·</span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#C9A961', textTransform: 'uppercase' }}>
              Sipariş Takibi
            </span>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ paddingTop: 'clamp(48px, 8vw, 80px)', paddingBottom: 'clamp(24px, 5vw, 48px)' }}>
          <div className="px-responsive" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 'clamp(10px, 2vw, 11px)', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
              Yardım · Sipariş Takibi
            </p>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#C9A961', margin: '0 auto 32px' }} />
            <h1 className="font-display" style={{ color: '#F4F0E8', fontSize: 'clamp(34px, 6vw, 56px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
              Siparişiniz{' '}
              <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>şimdi nerede?</span>
            </h1>
            <p style={{ color: '#B8B0A0', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: 1.7, marginTop: '24px', maxWidth: '480px', margin: '24px auto 0' }}>
              Sipariş numaranız ve sipariş anında girdiğiniz e-posta adresiyle siparişinizin güncel durumunu görün.
            </p>
          </div>
        </section>

        {/* Form */}
        <section style={{ paddingBottom: 'clamp(40px, 6vw, 64px)' }}>
          <div className="px-responsive" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <form
              method="get"
              style={{
                background: '#141210',
                border: '1px solid rgba(244,240,232,0.08)',
                padding: 'clamp(20px, 4vw, 32px)',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <label htmlFor="order" style={labelStyle}>Sipariş Numarası</label>
                <input
                  id="order"
                  name="order"
                  type="text"
                  required
                  defaultValue={orderInput}
                  placeholder="DS-2026-0001"
                  spellCheck={false}
                  style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-jetbrains), monospace' }}
                />
                <p style={hintStyle}>
                  Sipariş onay sayfasındaki <strong style={{ color: '#C9A961' }}>DS-YYYY-NNNN</strong> formatlı numara.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="email" style={labelStyle}>E-posta Adresi</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={emailInput}
                  placeholder="ornek@mail.com"
                  style={inputStyle}
                />
                <p style={hintStyle}>Sipariş verirken girdiğiniz e-posta.</p>
              </div>

              {queryError && (
                <div
                  role="alert"
                  style={{
                    padding: '12px 14px',
                    border: '1px solid #C8472D',
                    backgroundColor: 'rgba(200,71,45,0.08)',
                    color: '#F4F0E8',
                    fontSize: '13px',
                    marginBottom: '18px',
                  }}
                >
                  {queryError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 3vw, 16px)',
                  backgroundColor: '#C9A961',
                  color: '#0A0908',
                  fontFamily: 'var(--font-jetbrains), monospace',
                  fontSize: '11px',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Sorgula →
              </button>
            </form>
          </div>
        </section>

        {/* Sonuç */}
        {result && (
          <section style={{ paddingBottom: 'clamp(80px, 10vw, 120px)' }}>
            <div className="px-responsive" style={{ maxWidth: '880px', margin: '0 auto' }}>
              <OrderResultPanel order={result.order} items={result.items} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  letterSpacing: '0.22em',
  color: '#9B9285',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.15)',
  color: '#F4F0E8',
  fontSize: '14px',
  fontFamily: 'var(--font-sans), system-ui, sans-serif',
  outline: 'none',
  borderRadius: 0,
  minHeight: '44px',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  color: '#6E665A',
  letterSpacing: '0.05em',
  marginTop: '6px',
  lineHeight: 1.5,
}

// ─── Sonuç Paneli ──────────────────────────────────────────────
import type { Order, OrderItem } from '@/types'

function OrderResultPanel({ order, items }: { order: Order; items: OrderItem[] }) {
  const ship = order.shipping_address as Record<string, string> | null
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const curIdx = statusIndex(order.status)

  return (
    <div>
      {/* Üst — başarılı sorgu rozet */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#5C7A3F', textTransform: 'uppercase', margin: '0 0 12px' }}>
          ✓ Sipariş bulundu
        </p>
        <h2 className="font-display" style={{ color: '#F4F0E8', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
          {order.order_number}
        </h2>
        <p style={{ color: '#9B9285', fontSize: '13px', marginTop: '6px' }}>
          {new Date(order.created_at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      {/* Status timeline */}
      {!isCancelled ? (
        <div style={{ background: '#141210', border: '1px solid rgba(244,240,232,0.08)', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Durum
          </p>

          {/* Desktop: yatay; mobile: dikey */}
          <ol className="status-timeline" style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '0', counterReset: 'step' }}>
            <style>{`
              @media (max-width: 768px) {
                .status-timeline { flex-direction: column !important; gap: 0 !important; }
                .status-timeline .step { flex: 0 0 auto !important; }
                .status-timeline .step-connector { width: 1px !important; height: 24px !important; margin-left: 11px !important; }
              }
            `}</style>
            {STATUS_TIMELINE.map((s, i) => {
              const done = i <= curIdx
              const isCurrent = i === curIdx
              return (
                <li key={s.key} className="step" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      aria-hidden
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: done ? '#C9A961' : 'transparent',
                        border: done ? 'none' : '1px solid rgba(244,240,232,0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0A0908',
                        fontFamily: 'var(--font-jetbrains), monospace',
                        fontSize: '11px',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    {i < STATUS_TIMELINE.length - 1 && (
                      <span
                        className="step-connector"
                        style={{
                          flex: 1,
                          height: '1px',
                          background: i < curIdx ? '#C9A961' : 'rgba(244,240,232,0.1)',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: '10px', paddingRight: '8px' }}>
                    <p style={{ fontFamily: 'var(--font-cormorant), serif', color: isCurrent ? '#F4F0E8' : done ? '#B8B0A0' : '#6E665A', fontSize: '15px', fontWeight: 500, margin: 0, lineHeight: 1.2 }}>
                      {s.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#6E665A', letterSpacing: '0.05em', marginTop: '4px', lineHeight: 1.4 }}>
                      {s.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          {order.tracking_number && (order.status === 'shipped' || order.status === 'delivered') && (
            <div style={{ marginTop: '28px', padding: '14px 16px', background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.25)' }}>
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 4px' }}>
                Kargo Takip No
              </p>
              <p className="font-mono" style={{ color: '#F4F0E8', fontSize: '14px', margin: 0, letterSpacing: '0.05em', wordBreak: 'break-all' }}>
                {order.tracking_number}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'rgba(200,71,45,0.06)', border: '1px solid rgba(200,71,45,0.3)', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.3em', color: '#C8472D', textTransform: 'uppercase', margin: '0 0 10px' }}>
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
          <p style={{ color: '#B8B0A0', fontSize: '14px', margin: 0 }}>
            Bu sipariş {order.status === 'cancelled' ? 'iptal edilmiştir' : 'iade edilmiştir'}. Bilgi için bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      )}

      {/* Ürünler */}
      <div style={{ background: '#141210', border: '1px solid rgba(244,240,232,0.08)', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '24px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
          Ürünler
        </p>
        {items.map((it) => (
          <div key={it.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(244,240,232,0.05)' }}>
            <div style={{ width: '64px', height: '80px', flexShrink: 0, background: '#0A0908', position: 'relative' }}>
              {it.product_image ? (
                <Image src={it.product_image} alt={it.product_name} fill sizes="64px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3530', fontSize: '10px' }}>—</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-display" style={{ color: '#F4F0E8', fontSize: '16px', fontWeight: 500, lineHeight: 1.25, margin: 0 }}>
                {it.product_name}
              </p>
              {it.variant_label && (
                <p className="font-mono" style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', margin: '4px 0 0' }}>
                  {it.variant_label}
                </p>
              )}
              <p className="font-mono" style={{ fontSize: '11px', color: '#B8B0A0', margin: '6px 0 0' }}>
                {it.quantity} × {formatPrice(Number(it.unit_price))}
              </p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <p className="font-display" style={{ fontSize: '17px', fontWeight: 500, color: '#F4F0E8', margin: 0 }}>
                {formatPrice(Number(it.subtotal))}
              </p>
            </div>
          </div>
        ))}

        <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SumRow label="Ara Toplam" value={formatPrice(Number(order.subtotal))} />
          <SumRow label="· içerisinde KDV" value={formatPrice(Number(order.tax_amount ?? 0))} muted />
          <SumRow label="Kargo" value={Number(order.shipping_cost ?? 0) > 0 ? formatPrice(Number(order.shipping_cost)) : 'Ücretsiz'} highlight={Number(order.shipping_cost ?? 0) === 0} />
          <div style={{ borderTop: '1px solid rgba(244,240,232,0.12)', marginTop: '8px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#F4F0E8', textTransform: 'uppercase' }}>Toplam</span>
            <span className="font-display" style={{ color: '#C9A961', fontSize: '24px', fontWeight: 500 }}>
              {formatPrice(Number(order.total_amount))}
            </span>
          </div>
        </div>
      </div>

      {/* Teslimat adresi */}
      {ship && (
        <div style={{ background: '#141210', border: '1px solid rgba(244,240,232,0.08)', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Teslimat Adresi
          </p>
          <p style={{ color: '#F4F0E8', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
            {ship.full_name}<br />
            {ship.address_line1}{ship.address_line2 ? `, ${ship.address_line2}` : ''}<br />
            {ship.district}, {ship.city}{ship.postal_code ? ` ${ship.postal_code}` : ''}<br />
            <span className="font-mono" style={{ color: '#9B9285', fontSize: '12px' }}>{ship.phone}</span>
          </p>
        </div>
      )}

      {/* İletişim */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <p style={{ color: '#9B9285', fontSize: '13px', margin: '0 0 10px' }}>
          Sipariş hakkında soruların mı var?
        </p>
        <Link
          href="/iletisim"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            border: '1px solid rgba(244,240,232,0.2)',
            color: '#F4F0E8',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          İletişime Geç →
        </Link>
      </div>
    </div>
  )
}

function SumRow({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: muted ? '11px' : '12px', color: muted ? '#6E665A' : '#B8B0A0' }}>
      <span>{label}</span>
      <span style={highlight ? { color: '#5C7A3F' } : undefined}>{value}</span>
    </div>
  )
}
