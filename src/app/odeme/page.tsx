import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutClient, { type CheckoutPrefill } from './CheckoutClient'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import type { Order } from '@/types'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Sipariş bilgilerinizi tamamlayın.',
}

// Logged-in müşteri için son siparişten adresi çek (RLS sayesinde sadece kendi siparişleri)
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
  const addr = (last?.shipping_address ?? {}) as Record<string, string | undefined>

  const fullNameMeta = (me.user.user_metadata?.full_name as string | undefined) ?? null

  return {
    email: me.email,
    customer_name: last?.customer_name?.trim() || fullNameMeta || '',
    phone: last?.customer_phone?.trim() || '',
    address: {
      full_name: (addr.full_name as string | undefined)?.trim() || last?.customer_name?.trim() || fullNameMeta || '',
      phone: (addr.phone as string | undefined)?.trim() || last?.customer_phone?.trim() || '',
      address_line1: (addr.address_line1 as string | undefined)?.trim() || '',
      address_line2: (addr.address_line2 as string | undefined)?.trim() || '',
      city: (addr.city as string | undefined)?.trim() || '',
      district: (addr.district as string | undefined)?.trim() || '',
      postal_code: (addr.postal_code as string | undefined)?.trim() || '',
    },
    hasPriorOrder: Boolean(last),
  }
}

export default async function OdemePage() {
  const prefill = await getCustomerPrefill()
  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#0A0908', minHeight: '70vh' }}>
        <CheckoutClient prefill={prefill} />
      </main>
      <Footer />
    </>
  )
}
