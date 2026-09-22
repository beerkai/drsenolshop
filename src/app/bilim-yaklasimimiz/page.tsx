import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, Quote, InfoBox, List } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Bilim Yaklaşımımız · Dr. Şenol Shop',
  description: 'Arıcılığı bir bilim olarak ele alıyoruz. Her hasat belgelenir, her lot izlenir.',
}

export default function BilimYaklasimimizPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Bilim Yaklaşımımız"
      title="Doğanın titizliği,"
      titleAccent="bilimin gözüyle."
      intro="Her kavanozun arkasında hasat kaydı, laboratuvar analizi ve lot takibi vardır."
      breadcrumbs={[{ label: 'Bilim Yaklaşımımız' }]}
    >
      <Eyebrow>Metodoloji</Eyebrow>
      <H2>Akredite laboratuvar testleri</H2>
      <P>
        Hasat kapandıktan sonra her partiden numune alınır ve TÜRKAK akreditasyonuna sahip
        bağımsız laboratuvarlara gönderilir. Rapor onaylanmadan o lot satışa çıkmaz. Isıl
        işlem uygulanmaz; süzüm, enzimleri koruyacak sıcaklık bandında tutulur.
      </P>

      <H2>Test ettiğimiz değerler</H2>
      <P>
        Analiz paneli, balın botanik kaynağını, tazeliğini ve ısıl geçmişini birlikte okur.
        Aşağıdaki parametreler her partinin dosyasına işlenir:
      </P>
      <List
        items={[
          'HMF (hidroksimetilfurfural) — ısıl işlem veya uzun beklemenin izi; hedef < 10 mg/kg, yasal üst sınır 40 mg/kg',
          'Prolin — balın olgunluğu ve doğal protein izi',
          'Diastaz (amilaz) aktivitesi — canlı enzim; aşırı ısıda düşer',
          'Fenolik madde — flora ve oksidatif profil',
          'Nem — fermentasyon riskini kontrol eder',
          'Şeker profili ve C4 — ilave şeker / şurup karışımının tespiti',
          'Polen analizi — botanik kaynak (kestane, ıhlamur, çiçek vb.)',
        ]}
      />

      <InfoBox title="Test parametreleri">
        Fenolik madde · Prolin · Diastaz · HMF · Nem · Şeker profili · Polen analizi
      </InfoBox>

      <Eyebrow>Şeffaflık</Eyebrow>
      <H2>Yayımlanan raporlar</H2>
      <P>
        Laboratuvar belgeleri{' '}
        <Link href="/analizler" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          analizler
        </Link>
        {' '}sayfasında PDF olarak yer alır.
      </P>

      <Quote>Şüpheye yer bırakmayan bilim.</Quote>
    </StaticPageLayout>
  )
}
