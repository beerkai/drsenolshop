import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getOrderByNumber } from '@/lib/orders'
import { getSupabaseServer } from '@/lib/supabase-server'
import { maskEmail } from '@/lib/pii'
import { formatPrice } from '@/types'

export const metadata: Metadata = {
  title: 'Ödeme Başarılı',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SP = Promise<{ no?: string; oid?: string }>

export default async function OdemeBasariliPage({ searchParams }: { searchParams: SP }) {
  const { no, oid } = await searchParams
  const orderNumber = no?.trim() || oid?.trim()
  const lookup = orderNumber ? await getOrderByNumber(orderNumber) : null
  const order = lookup?.order ?? null

  // Sahip kontrolü — değilse e-posta maskeli gösterilir (enumerate koruması).
  let isOwner = false
  if (order) {
    const supabase = await getSupabaseServer()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      isOwner = Boolean(
        user &&
        (
          (user.email && user.email.toLowerCase() === order.customer_email.toLowerCase()) ||
          (order.user_id && user.id === order.user_id)
        )
      )
    }
  }
  const displayEmail = order
    ? (isOwner ? order.customer_email : maskEmail(order.customer_email))
    : 'e-posta adresinize'

  return (
    <>
      <Header />
      <main
        style={{
          background: 'var(--color-surface)',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(32px, 8vw, 96px) clamp(16px, 4vw, 48px)',
        }}
      >
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--color-charcoal-pure)',
              margin: '0 auto 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke='var(--color-surface)' strokeWidth="2.5" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-label-spec)',
              fontSize: 'clamp(10px, 2vw, 11px)',
              letterSpacing: '0.3em',
              color: 'var(--color-honey-amber)',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            Ödeme Başarılı
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-headline-lg)',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 500,
              color: 'var(--color-on-surface)',
              margin: '0 0 24px',
              lineHeight: 1.2,
            }}
          >
            Siparişiniz alındı, teşekkürler.
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              lineHeight: 1.7,
              color: 'var(--color-on-surface-variant)',
              margin: '0 0 32px',
            }}
          >
            Sipariş onay e-postası birazdan {displayEmail} gönderilecek.
            Siparişiniz kargolandığında ayrıca bilgilendirileceksiniz.
          </p>

          {order && orderNumber && (
            <div
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-hairline-light)',
                padding: 'clamp(20px, 4vw, 32px)',
                margin: '0 0 32px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-hairline-light)' }}>
                <span style={{ fontFamily: 'var(--font-label-spec)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--color-outline)', textTransform: 'uppercase' }}>
                  Sipariş No
                </span>
                <span style={{ fontFamily: 'var(--font-label-spec)', fontSize: '11px', color: 'var(--color-on-surface)' }}>
                  {order.order_number}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontFamily: 'var(--font-label-spec)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--color-outline)', textTransform: 'uppercase' }}>
                  Tutar
                </span>
                <span style={{ fontFamily: 'var(--font-headline-lg)', fontSize: '18px', color: 'var(--color-honey-amber)', fontWeight: 500 }}>
                  {formatPrice(Number(order.total_amount))}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {orderNumber && (
              <Link
                href={`/siparis/${orderNumber}`}
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-hairline-light)',
                  fontFamily: 'var(--font-label-spec)',
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Sipariş Detayı
              </Link>
            )}
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '16px 48px',
                background: 'var(--color-charcoal-pure)',
                color: 'var(--color-surface-container-lowest)',
                fontFamily: 'var(--font-label-spec)',
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Anasayfaya Dön
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
