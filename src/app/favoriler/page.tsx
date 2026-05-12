import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FavorilerClient from './FavorilerClient'

export const metadata: Metadata = {
  title: 'Favorilerim',
  description: 'Beğendiğin ve sonra dönmek istediğin ürünler.',
  robots: { index: false, follow: false },
}

export default function FavorilerPage() {
  return (
    <>
      <Header />
      <main style={{ background: '#0A0908', minHeight: '70vh' }}>
        <FavorilerClient />
      </main>
      <Footer />
    </>
  )
}
