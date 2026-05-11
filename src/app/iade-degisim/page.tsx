import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'İade & Değişim · Dr. Şenol Shop',
  description: 'İade ve değişim koşulları.',
}

export default function IadeDegisimPage() {
  return (
    <StaticPageLayout
      eyebrow="Yardım · İade & Değişim"
      title="Memnuniyetiniz"
      titleAccent="önceliğimiz."
      intro="Mesafeli satış sözleşmesi gereği 14 günlük cayma hakkınızdır."
      breadcrumbs={[{ label: 'İade & Değişim' }]}
    >
      <Eyebrow>Cayma Hakkı</Eyebrow>
      <H2>14 gün içinde</H2>
      <P>
        Bu metin yer tutucu olarak buradadır. Mesafeli Sözleşmeler Yönetmeliği gereğince, ürünü
        teslim aldığınız tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin
        cayma hakkınızı kullanabilirsiniz.
      </P>

      <Eyebrow>İade Koşulları</Eyebrow>
      <H2>Hangi durumlarda iade alabilirsiniz?</H2>

      <List
        items={[
          'Ürünün açılmamış ve kullanılmamış olması',
          'Orijinal ambalajında bulunması',
          'Etiketinin sökülmemiş olması',
          'Faturasının iade ile birlikte gönderilmesi',
          'Sıvı gıda ürünleri (bal vb.): Sadece hasarlı ve bozuk teslim edildiğinde',
        ]}
      />

      <InfoBox title="İade için">
        İade talepleri için 14 gün içinde:
        <br />
        E-posta: <span style={{ color: '#C9A961' }}>iade@drsenol.shop</span>
        <br />
        Telefon: <span style={{ color: '#C9A961' }}>+90 224 123 45 67</span>
      </InfoBox>

      <P>
        Bu metin yer tutucu olarak buradadır. Yasal mesafeli satış sözleşmesi metni yakında
        eklenecektir.
      </P>
    </StaticPageLayout>
  )
}
