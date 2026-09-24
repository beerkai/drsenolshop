import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, Quote, InfoBox, List } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Saitabat Köyü · Dr. Şenol Shop',
  description:
    "Uludağ eteklerinde 1.100 metre rakımda, endemik bitki örtüsünün balın karakterini yazdığı mikro-iklim.",
}

export default function SaitabatKoyuPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Saitabat Köyü"
      title="Uludağ'ın saklı"
      titleAccent="hazinesi."
      intro="Bursa'nın Kestel ilçesinde, 1.100 metre rakımda, kestane ve çamın aynı yamaçta buluştuğu bir mikro-iklim."
      breadcrumbs={[{ label: 'Saitabat Köyü' }]}
    >
      <Eyebrow>Coğrafya</Eyebrow>
      <H2>Mikro-iklimin önemi</H2>
      <P>
        Saitabat Köyü, Uludağ&apos;ın güney yamaçlarında 1.100 metre rakımdadır. Bu yükseklik,
        gece-gündüz sıcaklık farkı ve nem dengesi; balın aromasını, mineral içeriğini ve
        kristalleşme hızını doğrudan etkiler. Kovanlar, endüstriyel tarım kuşağından uzak,
        orman ve dağ çayırının kesiştiği hatlara yerleştirilir.
      </P>
      <P>
        Hasat notlarımızda konum GPS 40.1683° N, 29.2155° E olarak kaydedilir. Rakım ve flora
        kaydı, her partinin analiz sertifikasıyla birlikte saklanır.
      </P>

      <Eyebrow>Bitki Örtüsü</Eyebrow>
      <H2>Endemik bitkilerin dünyası</H2>
      <P>
        Saitabat&apos;ın bitki örtüsü, balın karakterini yazan asıl kaynaktır. Aynı yamaçta
        kestane ve ıhlamur, biraz yukarıda çam ormanı, açıklıklarda kekik ve yaban çiçeği
        bulunur. Mevsim hangi kaynağı açarsa, o hasadın adı ve aroması değişir.
      </P>

      <List
        items={[
          'Kestane — koyu gövde, tannik aroma; Saitabat kestane balının ana kaynağı',
          'Ihlamur — erken yaz çiçeklenmesi, açık renk ve çiçeksi uç',
          'Çam ormanları — karakovan çam balı için salgı kaynağı',
          'Yabani kekik ve dağ çiçekleri — antimikrobiyal karakter ve çeşitlilik',
          'Lavanta ve yaban çiçeği kuşakları — aromatik, açık renkli seçkiler',
        ]}
      />

      <Quote>Coğrafya, balın karakteridir.</Quote>

      <InfoBox title="Kovan Konumu">
        Konum: Saitabat Köyü, Kestel / Bursa
        <br />
        Rakım: 1.100 m · Uludağ endemik flora kuşağı
        <br />
        GPS: 40.1683° N, 29.2155° E
        <br />
        Hasat: 1985&apos;ten bu yana tek hasat, ısıl işlemsiz
      </InfoBox>

      <P>
        Bu coğrafyadan çıkan seçkiyi{' '}
        <Link href="/koleksiyon" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          koleksiyonda
        </Link>
        ; laboratuvar kaydını{' '}
        <Link href="/analizler" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          analiz raporlarında
        </Link>
        {' '}inceleyebilirsiniz.
      </P>
    </StaticPageLayout>
  )
}
