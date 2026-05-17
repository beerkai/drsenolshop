import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { formatPrice, type Order } from '@/types'
import LogoutButton from './LogoutButton'
import ProfileForm, { type ProfileInitial } from './ProfileForm'

export const metadata: Metadata = {
  title: 'Hesabım',
  description: 'Hesap bilgileriniz ve sipariş geçmişiniz.',
  robots: { index: false, follow: false },
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ödeme Bekleniyor',
  paid: 'Ödeme Alındı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
  refunded: 'İade Edildi',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#B8B0A0',
  paid: '#C9A961',
  preparing: '#C9A961',
  shipped: '#7AAD8B',
  delivered: '#7AAD8B',
  cancelled: '#D17B6A',
  refunded: '#D17B6A',
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default async function HesabimPage() {
  const me = await getCurrentCustomer()
  if (!me) redirect('/giris?next=/hesabim')

  // RLS sayesinde sadece kendi siparişleri gelecek (email match)
  const supabase = await getSupabaseServer()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const orderList = (orders ?? []) as Order[]

  // Profil ön doldurma: user_metadata > son sipariş > boş
  const meta = (me.user.user_metadata ?? {}) as Record<string, unknown>
  const lastOrder = orderList[0]
  const lastAddr = ((lastOrder?.shipping_address ?? {}) as Record<string, unknown>)
  const profileInitial: ProfileInitial = {
    full_name: str(meta.full_name) || str(lastOrder?.customer_name),
    phone: str(meta.phone) || str(lastOrder?.customer_phone),
    address_line1: str(meta.address_line1) || str(lastAddr.address_line1),
    address_line2: str(meta.address_line2) || str(lastAddr.address_line2),
    district: str(meta.district) || str(lastAddr.district),
    city: str(meta.city) || str(lastAddr.city),
    postal_code: str(meta.postal_code) || str(lastAddr.postal_code),
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
            <Link href="/" style={crumbDim}>Anasayfa</Link>
            <span style={crumbSep}>·</span>
            <span style={crumbActive}>Hesabım</span>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ paddingTop: 'clamp(48px, 6vw, 72px)', paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
          <div className="px-responsive" style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Hesabım
                </p>
                <h1
                  className="font-display"
                  style={{ color: '#F4F0E8', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.015em', margin: 0 }}
                >
                  Hoş geldiniz,{' '}
                  <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>
                    {(me.user.user_metadata?.full_name as string | undefined) || me.email.split('@')[0]}
                  </span>
                </h1>
                <p style={{ color: '#B8B0A0', fontSize: '14px', marginTop: '14px', fontFamily: 'var(--font-jetbrains), monospace' }}>
                  {me.email}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/favoriler" style={pillBtnStyle}>
                  Favorilerim
                </Link>
                {me.isAdmin && (
                  <Link href="/admin" style={{ ...pillBtnStyle, borderColor: '#C9A961', color: '#C9A961' }}>
                    Admin Paneli
                  </Link>
                )}
                <LogoutButton />
              </div>
            </div>
          </div>
        </section>

        {/* Profil & Adres */}
        <section style={{ paddingBottom: 'clamp(32px, 5vw, 48px)' }}>
          <div className="px-responsive" style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="font-display" style={{ color: '#F4F0E8', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
                Profil & Adres
              </h2>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6E665A' }}>
                Bir sonraki siparişte otomatik dolar
              </span>
            </div>
            <div style={{ border: '1px solid rgba(244,240,232,0.08)', backgroundColor: 'rgba(244,240,232,0.02)', padding: 'clamp(20px, 4vw, 28px)' }}>
              <ProfileForm initial={profileInitial} />
            </div>
          </div>
        </section>

        {/* Orders */}
        <section style={{ paddingBottom: 'clamp(56px, 10vw, 96px)' }}>
          <div className="px-responsive" style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="font-display" style={{ color: '#F4F0E8', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
                Sipariş Geçmişim
              </h2>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6E665A' }}>
                {orderList.length} sipariş
              </span>
            </div>

            {orderList.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderList.map((order) => (
                  <OrderCard key={order.id} order={order} email={me.email} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        border: '1px solid rgba(244,240,232,0.1)',
        backgroundColor: 'rgba(244,240,232,0.02)',
        padding: 'clamp(32px, 6vw, 56px)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A961', margin: '0 0 16px' }}>
        Henüz sipariş yok
      </p>
      <p style={{ color: '#B8B0A0', fontSize: '14px', lineHeight: 1.7, margin: '0 auto 24px', maxWidth: '420px' }}>
        İlk siparişiniz burada görünecek. Koleksiyondan başlayın.
      </p>
      <Link href="/koleksiyon" style={pillBtnStyle}>
        Koleksiyona göz at →
      </Link>
    </div>
  )
}

function OrderCard({ order, email }: { order: Order; email: string }) {
  const statusColor = STATUS_COLOR[order.status] || '#B8B0A0'
  const statusLabel = STATUS_LABEL[order.status] || order.status
  const trackingHref = `/siparis-takibi?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(email)}`

  return (
    <Link
      href={trackingHref}
      style={{
        display: 'block',
        textDecoration: 'none',
        border: '1px solid rgba(244,240,232,0.1)',
        backgroundColor: 'rgba(244,240,232,0.02)',
        padding: 'clamp(18px, 3vw, 24px)',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6E665A', margin: '0 0 8px' }}>
            Sipariş No
          </p>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px', color: '#F4F0E8', margin: 0, letterSpacing: '0.03em' }}>
            {order.order_number}
          </p>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#6E665A', margin: '8px 0 0' }}>
            {formatDate(order.created_at)}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '5px 10px',
              border: `1px solid ${statusColor}`,
              color: statusColor,
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            {statusLabel}
          </span>
          <p
            className="font-display"
            style={{ color: '#F4F0E8', fontSize: 'clamp(20px, 2.5vw, 24px)', margin: 0, letterSpacing: '-0.01em' }}
          >
            {formatPrice(order.total_amount)}
          </p>
        </div>
      </div>

      {order.tracking_number && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(244,240,232,0.06)', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#B8B0A0' }}>
          <span style={{ color: '#6E665A', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Kargo No · </span>
          <span style={{ color: '#C9A961', letterSpacing: '0.05em' }}>{order.tracking_number}</span>
        </div>
      )}

      <div style={{ marginTop: '12px', fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A961' }}>
        Detayları gör →
      </div>
    </Link>
  )
}

const crumbDim: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em',
  color: '#6E665A', textTransform: 'uppercase', textDecoration: 'none',
}
const crumbSep: React.CSSProperties = { color: 'rgba(244,240,232,0.15)', fontSize: '10px' }
const crumbActive: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em',
  color: '#C9A961', textTransform: 'uppercase',
}

const pillBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '11px 18px',
  backgroundColor: 'transparent',
  border: '1px solid rgba(244,240,232,0.2)',
  color: '#F4F0E8',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
}
