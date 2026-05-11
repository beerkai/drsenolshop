import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, Quote, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Bilim Yaklaşımımız · Dr. Şenol Shop',
  description: 'Arıcılığı bir bilim olarak ele alıyoruz. Her aşama belgelenir.',
}

export default function BilimYaklasimimizPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Bilim Yaklaşımımız"
      title="Doğanın titizliği,"
      titleAccent="bilimin gözüyle."
      intro="Her kavanozun arkasında yıllarca süren bilimsel araştırma ve laboratuvar testleri var."
      breadcrumbs={[{ label: 'Bilim Yaklaşımımız' }]}
    >
      <Eyebrow>Metodoloji</Eyebrow>
      <H2>Akredite laboratuvar testleri</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Her hasat, akredite bağımsız laboratuvarda
        fenolik madde, prolin, diastaz ve HMF değerleri için analiz edilir.
      </P>

      <H2>Test ettiğimiz değerler</H2>
      <P>Bu metin yer tutucu. Detaylı bilgi sonradan gelecek.</P>

      <InfoBox title="Test parametreleri">
        Fenolik madde · Prolin · Diastaz · HMF (Hidroksimetilfurfural) · Nem · Şeker profili ·
        Polen analizi
      </InfoBox>

      <Eyebrow>Şeffaflık</Eyebrow>
      <H2>QR kod ile lot takibi</H2>
      <P>
        Bu metin yer tutucu. Her ürünün etiketinde QR kod var. Tarayınca o lota ait analiz
        raporuna ulaşırsınız. Tam şeffaflık.
      </P>

      <Quote>Şüpheye yer bırakmayan bilim.</Quote>
    </StaticPageLayout>
  )
}
