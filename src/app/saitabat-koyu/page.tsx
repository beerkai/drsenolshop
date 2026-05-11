import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, Quote, InfoBox, List } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Saitabat Köyü · Dr. Şenol Shop',
  description:
    "Uludağ'ın kuzey eteğinde, endemik bitki örtüsünün doruğa ulaştığı mikro-iklim.",
}

export default function SaitabatKoyuPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Saitabat Köyü"
      title="Uludağ'ın saklı"
      titleAccent="hazinesi."
      intro="Bursa'nın kuzeyinde, endemik bitki örtüsünün doruğa ulaştığı bir mikro-iklim."
      breadcrumbs={[{ label: 'Saitabat Köyü' }]}
    >
      <Eyebrow>Coğrafya</Eyebrow>
      <H2>Mikro-iklimin önemi</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Saitabat Köyü, Uludağ&apos;ın kuzey eteğinde
        600-900 metre rakımda. Bu yükseklik ve coğrafi konum, balın aromasını ve mineral
        içeriğini doğrudan etkiler.
      </P>

      <Eyebrow>Bitki Örtüsü</Eyebrow>
      <H2>Endemik bitkilerin dünyası</H2>
      <P>
        Bu metin yer tutucu. Saitabat&apos;ın bitki örtüsü, balın kalitesini belirleyen en önemli
        faktörlerden biri.
      </P>

      <List
        items={[
          'Kestane ağaçları — Kestane balının ana kaynağı',
          'Yabani kekik — Antimikrobik özellikleriyle bilinen',
          'Lavanta tarlaları — Aromatik bal için',
          'Dağ çiçekleri — Çiçek balının çeşitlilik kaynağı',
          'Çam ormanları — Çam balı için kritik',
        ]}
      />

      <Quote>Coğrafya, balın karakteridir.</Quote>

      <InfoBox title="Kovan Konumu">
        Konum: Saitabat Köyü, Yıldırım, Bursa
        <br />
        Rakım: 600-900 m
        <br />
        Bitki çeşitliliği: 200+ tür
        <br />
        Aktif kovan: 1.247
      </InfoBox>
    </StaticPageLayout>
  )
}
