import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutClient, { type CheckoutPrefill } from './CheckoutClient'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { isPaytrConfigured } from '@/lib/paytr'
import type { Order } from '@/types'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Sipariş bilgilerinizi tamamlayın.',
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

// Logged-in müşteri için ön doldurma:
//   1) Önceki sipariş adresi (varsa) — en taze
//   2) user_metadata (hesabım profil formundan) — sipariş yoksa fallback
// RLS sayesinde sadece kendi siparişleri okunabilir.
async function getCustomerPrefill(): Promise<CheckoutPrefill | null> {
  const me = await getCurrentCustomer()
  if (!me) return null

  const supabase = await getSupabaseServer()
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_name, customer_phone, shipping_address')
    .order('created_at', { ascending: false })
    .limit(1)

  const last = (orders ?? [])[0] as Pick<Order, 'customer_name' | 'customer_phone' | 'shipping_address'> | undefined
  const addr = (last?.shipping_address ?? {}) as Record<string, unknown>
  const meta = (me.user.user_metadata ?? {}) as Record<string, unknown>

  // Pick: önce sipariş, sonra metadata, sonra boş
  const pick = (orderVal: unknown, metaKey: string) => str(orderVal) || str(meta[metaKey])

  const customerName = pick(last?.customer_name, 'full_name')
  const phone = pick(last?.customer_phone, 'phone')

  return {
    email: me.email,
    customer_name: customerName,
    phone,
    address: {
      full_name: pick(addr.full_name, 'full_name') || customerName,
      phone: pick(addr.phone, 'phone') || phone,
      address_line1: pick(addr.address_line1, 'address_line1'),
      address_line2: pick(addr.address_line2, 'address_line2'),
      city: pick(addr.city, 'city'),
      district: pick(addr.district, 'district'),
      postal_code: pick(addr.postal_code, 'postal_code'),
    },
    // "Önceki adres otomatik dolduruldu" banner'ı için: sipariş VEYA profil dolu mu?
    hasPriorOrder: Boolean(last) || Boolean(str(meta.address_line1)),
  }
}

export default async function OdemePage() {
  const prefill = await getCustomerPrefill()
  const paytrEnabled = isPaytrConfigured()
  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#0A0908', minHeight: '70vh' }}>
        <CheckoutClient prefill={prefill} paytrEnabled={paytrEnabled} />
      </main>
      <Footer />
    </>
  )
}
