import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getShippingConfig } from '@/lib/site-settings'
import { shippingCopy, SHIPPING_CUTOFF, SHIPPING_WINDOW } from '@/lib/shipping-copy'
import { SITE_EMAILS, mailto } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Kargo & Teslimat · Dr. Şenol Shop',
  description: 'Kargo ücreti, teslimat süresi ve ambalaj koşullarımız.',
}

export default async function KargoTeslimatPage() {
  const copy = shippingCopy(await getShippingConfig())

  return (
    <StaticPageLayout
      eyebrow="Yardım · Kargo & Teslimat"
      title="Kovan kapınızda,"
      titleAccent="sağlam ve hızlı."
      intro="Cam kavanozlar ısı korumalı, kırılmaya karşı güçlendirilmiş ambalajla yola çıkar."
      breadcrumbs={[{ label: 'Kargo & Teslimat' }]}
    >
      <Eyebrow>Kargo Süresi</Eyebrow>
      <H2>Teslimat zamanı</H2>
      <P>
        Ödemesi onaylanan siparişler, {SHIPPING_CUTOFF}&apos;e kadar aynı iş günü kargoya verilir.
        Bu saatten sonra veya hafta sonu / resmi tatilde gelen siparişler bir sonraki iş günü
        işleme alınır. Türkiye içi teslimat süresi tipik olarak {SHIPPING_WINDOW}&apos;dür; yasal
        azami süre 30 gündür.
      </P>

      <Eyebrow>Kargo Ücretleri</Eyebrow>
      <H2>Gönderim bedeli</H2>
      <P>{copy.intro}</P>

      <List items={copy.items} />

      <Eyebrow>Ambalaj</Eyebrow>
      <H2>Isı korumalı paket</H2>
      <P>
        Cam kavanozlar, kırılmaya karşı iç destekli kutuda ve sıcaklık dalgalanmasına karşı
        yalıtımlı olarak paketlenir. Soğuk zincir gerektiren apiterapi ürünleri ayrı protokolle
        gönderilir. Teslimatta ambalaj hasarlıysa kuryenin yanında tutanak tutturmanızı ve
        fotoğrafla{' '}
        <Link href="/iade-degisim" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          iade & değişim
        </Link>
        {' '}sürecini başlatmanızı rica ederiz.
      </P>

      <InfoBox title="Kargo ve takip">
        {copy.courierLine ? (
          <>
            {copy.courierLine}
            <br />
          </>
        ) : null}
        Takip numarası, sipariş &quot;Kargoda&quot; olduğunda e-posta ile iletilir.{' '}
        <Link href="/siparis-takibi" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          Sipariş takibi
        </Link>
        {' '}sayfasından da durumu kontrol edebilirsiniz.
        <br />
        Destek:{' '}
        <a href={mailto(SITE_EMAILS.destek)} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {SITE_EMAILS.destek}
        </a>
      </InfoBox>
    </StaticPageLayout>
  )
}
