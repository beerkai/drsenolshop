import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Sipariş bilgilerinizi tamamlayın.',
}

export default function OdemePage() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#0A0908', minHeight: '70vh' }}>
        <CheckoutClient />
      </main>
      <Footer />
    </>
  )
}
