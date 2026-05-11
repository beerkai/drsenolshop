import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Sipariş Takibi · Dr. Şenol Shop',
  description: 'Siparişinizin durumunu kontrol edin.',
}

export default function SiparisTakibiPage() {
  return (
    <StaticPageLayout
      eyebrow="Yardım · Sipariş Takibi"
      title="Siparişiniz"
      titleAccent="şimdi nerede?"
      intro="Sipariş numaranızla siparişinizin durumunu öğrenin."
      breadcrumbs={[{ label: 'Sipariş Takibi' }]}
    >
      <Eyebrow>Yakında</Eyebrow>
      <H2>Sipariş sorgulama</H2>
      <P>
        Bu sayfa yer tutucu olarak buradadır. Yakında sipariş numaranızı girerek siparişinizin
        güncel durumunu öğrenebileceksiniz.
      </P>

      <InfoBox title="Şu an için">
        Sipariş takibi için lütfen bizimle iletişime geçin:
        <br />
        E-posta: <span style={{ color: '#C9A961' }}>bilgi@drsenol.shop</span>
        <br />
        Telefon: <span style={{ color: '#C9A961' }}>+90 224 123 45 67</span>
      </InfoBox>
    </StaticPageLayout>
  )
}
