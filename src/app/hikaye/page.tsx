import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import MirasJournalSection from '@/components/miras/MirasJournalSection'
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
      below={<MirasJournalSection />}
    >
      <Eyebrow>1985 — Başlangıç</Eyebrow>
      <H2>Uludağ&apos;ın eteklerinde bir köy</H2>
      <P>
        Saitabat, Uludağ&apos;ın 1.100 metre rakımlı flora kuşağında, kestane, ıhlamur ve çamın
        aynı yamaçta buluştuğu bir mikro-iklim. 1985&apos;ten bu yana Dr. Şenol burada arıcılığı
        bir zanaat ve bir bilim olarak ele alıyor: kovanı dinlemek, hasadı belgelemek, balı
        ısıtmadan kavanoza almak.
      </P>
      <P>
        Babasından devralınan köy bilgisi, üniversitedeki laboratuvar disipliniyle birleşince
        ortaya çıkan şey sıradan bir üretim hattı değil. Her parti, kendi hasat kodunu taşır;
        her kavanoz, o mevsimin polen kaydını içerir.
      </P>

      <Quote>Her damla balın arkasında bir bilim insanının imzası var.</Quote>

      <Eyebrow>Bugün — Bilim ve Doğa</Eyebrow>
      <H2>Bilimin titizliği</H2>
      <P>
        Pastörize etmiyoruz. Endüstriyel filtreyle poleni ayırmıyoruz. Bal, kovan sıcaklığına
        yakın bir çizgide süzülür ve cam kavanoza alınır. Kristalleşme bir kusur değil; canlı
        enzimin ve polen zenginliğinin doğal sonucudur.
      </P>
      <P>
        Her hasat, bağımsız akredite laboratuvarda fenolik madde, prolin, diastaz, HMF, nem
        ve şeker profili için analiz edilir. Hedefimiz yasal HMF üst sınırının (40 mg/kg) çok
        altında, tipik olarak 10 mg/kg&apos;ın altında kalmaktır. Yayımlanan belgeler{' '}
        <Link href="/analizler" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          analizler
        </Link>
        {' '}sayfasında, yöntem{' '}
        <Link href="/bilim-yaklasimimiz" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          bilim yaklaşımımız
        </Link>
        {' '}sayfasındadır.
      </P>

      <InfoBox title="Rakamlarla Dr. Şenol">
        1985&apos;ten bu yana · 1.100 m rakım · HMF &lt; 10 mg/kg · Isıl işlemsiz ham bal
      </InfoBox>

      <Eyebrow>Koleksiyon</Eyebrow>
      <H2>Bal, apiterapi, bakım</H2>
      <P>
        Seçki, Saitabat&apos;ın mevsimlik hasatlarından gelir: karakovan çam, ham kestane ve
        ıhlamur, yaban çiçeği ve lavanta. Aynı flora, propolis, polen ve arı sütü hatlarını;
        Goldylium Apithérapie bakım koleksiyonunu da besler.
      </P>
      <P>
        Coğrafyanın kendisi için{' '}
        <Link href="/saitabat-koyu" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          Saitabat Köyü
        </Link>
        {' '}sayfasına geçebilir; güncel seçki için koleksiyonu açabilirsiniz.
      </P>
    </StaticPageLayout>
  )
}
