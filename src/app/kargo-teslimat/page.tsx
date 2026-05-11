import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Kargo & Teslimat · Dr. Şenol Shop',
  description: 'Kargo ve teslimat koşullarımız.',
}

export default function KargoTeslimatPage() {
  return (
    <StaticPageLayout
      eyebrow="Yardım · Kargo & Teslimat"
      title="Kovan kapınızda,"
      titleAccent="sağlam ve hızlı."
      intro="Premium ürünlerimiz, özel ambalajla en taze haliyle size ulaşıyor."
      breadcrumbs={[{ label: 'Kargo & Teslimat' }]}
    >
      <Eyebrow>Kargo Süresi</Eyebrow>
      <H2>Teslimat zamanı</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Siparişiniz, hafta içi 14:00&apos;e kadar
        verildiğinde aynı gün kargoya verilir. Türkiye&apos;nin her yerine 2-4 iş günü içinde
        teslim edilir.
      </P>

      <Eyebrow>Kargo Ücretleri</Eyebrow>
      <H2>Ücretsiz kargo</H2>
      <P>Bu metin yer tutucu. 500 TL ve üzeri tüm siparişlerde kargo ücretsizdir.</P>

      <List
        items={[
          '500 TL altı siparişler: 49,90 TL',
          '500 TL üstü siparişler: Ücretsiz',
          "Aynı gün kargo: Hafta içi 14:00'e kadar",
          'Türkiye geneli teslimat: 2-4 iş günü',
        ]}
      />

      <Eyebrow>Ambalaj</Eyebrow>
      <H2>Premium ambalaj</H2>
      <P>
        Bu metin yer tutucu. Tüm ürünlerimiz, kırılmaya karşı özel ambalajla, soğuk zincir
        gerektirenler özel kutuda gönderilir.
      </P>

      <InfoBox title="Anlaşmalı Kargo">Yurtiçi Kargo, Aras Kargo, MNG Kargo</InfoBox>
    </StaticPageLayout>
  )
}
