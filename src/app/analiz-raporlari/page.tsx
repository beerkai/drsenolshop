import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, InfoBox, List } from '@/components/StaticContent'
import { SITE_EMAILS, mailto } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Analiz Raporları · Dr. Şenol Shop',
  description: 'Her hasat partisinin akredite laboratuvar analizine nasıl ulaşacağınız.',
}

export default function AnalizRaporlariPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Analiz Raporları"
      title="Her lot için"
      titleAccent="şeffaf belge."
      intro="Akredite laboratuvarlarda yapılan analizler, etiket QR'ı ve talep üzerine paylaşılır."
      breadcrumbs={[{ label: 'Analiz Raporları' }]}
    >
      <Eyebrow>Yöntem</Eyebrow>
      <H2>Nasıl test ediyoruz?</H2>
      <P>
        Her hasat dönemi kapandıktan sonra partiden alınan numuneler, TÜRKAK akreditasyonuna
        sahip bağımsız laboratuvarlara gönderilir. Panel; HMF, prolin, diastaz, nem, şeker
        profili ve polen analizini kapsar. Ölçümlerin anlamı{' '}
        <Link href="/bilim-yaklasimimiz" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          bilim yaklaşımımız
        </Link>
        {' '}sayfasında açıklanır. Rapor onaylanmadan o lot satışa çıkmaz.
      </P>

      <Eyebrow>Erişim</Eyebrow>
      <H2>Raporunuza nasıl ulaşırsınız</H2>
      <P>
        Satın aldığınız kavanozun etiketindeki QR kod, o lota ait analiz özetini açar. QR
        okunmuyorsa veya tam raporun kopyasını istiyorsanız, sipariş numaranız ve lot / hasat
        koduyla bize yazın.
      </P>
      <List
        items={[
          'Etiketteki QR kodu okutun — lot özeti açılır',
          'Sipariş numaranızı ve lot kodunu e-postaya ekleyin',
          'Hasarlı etiket veya kayıp kod için sipariş kaydından yardımcı oluruz',
        ]}
      />

      <InfoBox title="Rapor talebi">
        <a href={mailto(SITE_EMAILS.hello)} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {SITE_EMAILS.hello}
        </a>
        <br />
        Konuya sipariş numarası ve lot / hasat kodunu yazmanız yeterlidir. Talepler iş günlerinde
        yanıtlanır.
      </InfoBox>
    </StaticPageLayout>
  )
}
