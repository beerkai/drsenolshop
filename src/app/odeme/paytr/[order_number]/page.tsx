import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getOrderByNumber } from '@/lib/orders'
import { isPaytrConfigured } from '@/lib/paytr'
import PaytrIframeClient from './PaytrIframeClient'

export const metadata: Metadata = {
  title: 'Kart ile Ödeme',
  description: 'Güvenli kart ile ödeme sayfası.',
  robots: { index: false, follow: false },
}

type SP = Promise<{ order_number: string }>

export default async function PaytrOdemePage({ params }: { params: SP }) {
  const { order_number } = await params
  const lookup = await getOrderByNumber(order_number)
  if (!lookup) notFound()

  const { order } = lookup
  const configured = isPaytrConfigured()
  const alreadyPaid = order.payment_status === 'captured'

  return (
    <>
      <Header />
      <main style={{ background: 'var(--color-ink)', minHeight: '70vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.3em', color: 'var(--color-gold)', textTransform: 'uppercase', margin: '0 0 14px' }}>
            Sipariş {order.order_number} · Kart ile Ödeme
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 500, margin: '0 0 32px', lineHeight: 1.1 }}>
            Güvenli ödeme.
          </h1>

          {!configured ? (
            <NotConfiguredNotice />
          ) : alreadyPaid ? (
            <AlreadyPaidNotice orderNumber={order.order_number} />
          ) : (
            <PaytrIframeClient orderNumber={order.order_number} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function NotConfiguredNotice() {
  return (
    <div style={{ padding: '24px', border: '1px solid var(--color-alert-soft)', backgroundColor: 'rgba(209,123,106,0.08)', color: 'var(--color-cream)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-alert-soft)', textTransform: 'uppercase', margin: '0 0 10px' }}>
        Hazırlık aşaması
      </p>
      <p style={{ margin: 0, lineHeight: 1.7 }}>
        Kart ile ödeme altyapısı (PayTR) onay aşamasında. Şu an havale/EFT ile ödeme yapabilirsiniz.
      </p>
    </div>
  )
}

function AlreadyPaidNotice({ orderNumber }: { orderNumber: string }) {
  return (
    <div style={{ padding: '24px', border: '1px solid var(--color-success)', backgroundColor: 'rgba(92,122,63,0.1)', color: 'var(--color-cream)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-success-soft)', textTransform: 'uppercase', margin: '0 0 10px' }}>
        ✓ Ödeme alındı
      </p>
      <p style={{ margin: 0, lineHeight: 1.7 }}>
        Bu siparişin ödemesi tamamlanmış. Sipariş detayı için{' '}
        <a href={`/siparis/${orderNumber}`} style={{ color: 'var(--color-gold)' }}>buraya tıklayın</a>.
      </p>
    </div>
  )
}
