import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getLegalCompany } from '@/lib/legal-info'
import { SITE_EMAILS, mailto } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'İade & Değişim · Dr. Şenol Shop',
  description: '14 günlük cayma hakkı, iade koşulları ve hasarlı teslimat süreci.',
}

export default function IadeDegisimPage() {
  const co = getLegalCompany()
  const contactEmail = SITE_EMAILS.destek

  return (
    <StaticPageLayout
      eyebrow="Yardım · İade & Değişim"
      title="Memnuniyetiniz"
      titleAccent="önceliğimiz."
      intro="Mesafeli Sözleşmeler Yönetmeliği gereği teslimden itibaren 14 gün içinde cayma hakkınız vardır."
      breadcrumbs={[{ label: 'İade & Değişim' }]}
    >
      <Eyebrow>Cayma Hakkı</Eyebrow>
      <H2>14 gün içinde</H2>
      <P>
        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
        uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde herhangi bir gerekçe
        göstermeksizin cayma hakkınızı kullanabilirsiniz. Bildirim için{' '}
        <a href={mailto(contactEmail)} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {contactEmail}
        </a>
        {' '}adresine sipariş numaranızı yazmanız yeterlidir. Tam metin{' '}
        <Link href="/mesafeli-satis-sozlesmesi" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          mesafeli satış sözleşmesinde
        </Link>
        {' '}ve{' '}
        <Link href="/on-bilgilendirme-formu" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          ön bilgilendirme formunda
        </Link>
        {' '}yer alır.
      </P>
      <P>
        Cayma bildiriminiz bize ulaştıktan sonra ödemenizi 14 gün içinde, teslimat bedeli
        dahil iade ederiz. Ürünü de 14 gün içinde göndermeniz gerekir. Anlaşmalı kargo ile
        yapılan iadede kargo ücreti satıcıya aittir.
      </P>

      <Eyebrow>İade Koşulları</Eyebrow>
      <H2>Hangi durumlarda iade alabilirsiniz?</H2>
      <List
        items={[
          'Ürünün açılmamış, kullanılmamış ve orijinal ambalajında olması',
          'Koruyucu bant, mühür veya etiketinin sökülmemiş olması',
          'Fatura veya sipariş numarasının iade ile birlikte bildirilmesi',
          'Gıda ve hijyen ürünleri (açılmış bal kavanozu, damlalık, bakım ürünü): Yönetmelik m.15 gereği cayma hakkı kullanılamaz',
          'Hasarlı, bozuk veya yanlış ürün tesliminde: açılmış olsa da ücretsiz değişim veya iade',
        ]}
      />

      <Eyebrow>Hasarlı teslimat</Eyebrow>
      <H2>Kutu veya cam zarar gördüyse</H2>
      <P>
        Teslimatta ambalajı kontrol edin. Kırık cam, sızıntı veya ezik kutu varsa kuryenin
        yanında tutanak tutturun; 24 saat içinde fotoğraflarla {contactEmail} adresine yazın.
        Hasarlı ürünü ücretsiz değiştirir veya bedelini iade ederiz.
      </P>

      <InfoBox title="İade talebi">
        14 gün içinde e-posta:{' '}
        <a href={mailto(contactEmail)} style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }} lang="en">
          {contactEmail}
        </a>
        <br />
        Konuya sipariş numaranızı ve talebin türünü (cayma / hasar / yanlış ürün) yazın.
        {co.phone ? (
          <>
            <br />
            Telefon: {co.phone}
          </>
        ) : null}
      </InfoBox>
    </StaticPageLayout>
  )
}
