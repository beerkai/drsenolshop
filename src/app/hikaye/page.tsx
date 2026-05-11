import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, Quote, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Hikâyemiz · Dr. Şenol Shop',
  description:
    "1985'ten bu yana Saitabat Köyü'nde, üç kuşak arıcılığın bilime dönüşen mirası.",
}

export default function HikayemizPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Hikâyemiz"
      title="Bir köy, bir laboratuvar,"
      titleAccent="kırk yıl."
      intro="Saitabat Köyü'nde 1985'te başlayan bir hikâye. Üç kuşak boyunca süren bir tutku."
      breadcrumbs={[{ label: 'Hikâyemiz' }]}
    >
      <Eyebrow>1985 — Başlangıç</Eyebrow>
      <H2>Uludağ&apos;ın eteklerinde bir köy</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Saitabat Köyü, Uludağ&apos;ın kuzey eteğinde,
        endemik bitki örtüsünün doruğa ulaştığı bir mikro-iklim. 1985&apos;ten bu yana Dr.
        Şenol burada arıcılığı bir bilim olarak ele alıyor.
      </P>
      <P>
        Bu metin yer tutucu olarak buradadır. Dr. Şenol&apos;un babasından devraldığı bilgi,
        üniversitedeki bilimsel eğitimle birleşince, sıradan bir arıcılıktan çok daha fazlası
        ortaya çıktı.
      </P>

      <Quote>Her damla balın arkasında bir bilim insanının imzası var.</Quote>

      <Eyebrow>Bugün — Bilim ve Doğa</Eyebrow>
      <H2>Bilimin titizliği</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Her hasat, akredite laboratuvarda fenolik madde,
        prolin, diastaz ve HMF değerleri için analiz edilir. Etiketin altındaki QR kod,
        ürününüze ait analiz raporuna açılır.
      </P>

      <InfoBox title="Rakamlarla Dr. Şenol">
        40+ yıl deneyim · 1.247 aktif kovan · %100 doğal üretim · 3 kuşak miras
      </InfoBox>

      <P>Bu metin yer tutucu. İçeriği daha sonra dolduracağız.</P>
    </StaticPageLayout>
  )
}
