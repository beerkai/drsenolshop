import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Analiz Raporları · Dr. Şenol Shop',
  description: 'Her lotun akredite laboratuvar analiz raporu.',
}

export default function AnalizRaporlariPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Analiz Raporları"
      title="Her lot için"
      titleAccent="şeffaf belge."
      intro="Akredite laboratuvarlarda yapılan tüm analiz raporlarına buradan ulaşabilirsiniz."
      breadcrumbs={[{ label: 'Analiz Raporları' }]}
    >
      <Eyebrow>Yöntem</Eyebrow>
      <H2>Nasıl test ediyoruz?</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Her hasat dönemi sonrası numuneler bağımsız
        akredite laboratuvarlara gönderiliyor.
      </P>

      <Eyebrow>Arşiv</Eyebrow>
      <H2>Yakında — Lot bazlı arşiv</H2>
      <P>
        Bu metin yer tutucu. Yakında her ürüne ait analiz raporlarını buradan indirebileceksiniz.
        Şu an için sipariş verdiğiniz ürünün etiketindeki QR kodu okutarak rapora ulaşabilirsiniz.
      </P>

      <InfoBox title="Akredite Laboratuvarlar">
        TÜRKAK akreditasyonu olan bağımsız laboratuvarlarda test edilir.
      </InfoBox>
    </StaticPageLayout>
  )
}
