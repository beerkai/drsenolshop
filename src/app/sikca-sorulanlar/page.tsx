import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { Eyebrow, FAQItem } from '@/components/StaticContent'
import { getShippingConfig } from '@/lib/site-settings'
import { shippingCopy, SHIPPING_CUTOFF, SHIPPING_WINDOW } from '@/lib/shipping-copy'
import { SITE_EMAILS } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Sıkça Sorulanlar · Dr. Şenol Shop',
  description: 'Bal, kargo, fatura, iade ve analiz raporları hakkında sık sorulanlar.',
}

export default async function SikcaSorulanlarPage() {
  const copy = shippingCopy(await getShippingConfig())

  return (
    <StaticPageLayout
      eyebrow="Yardım · Sıkça Sorulanlar"
      title="Sorularınızın"
      titleAccent="cevabı."
      intro="Müşterilerimizin en çok merak ettiği konuların cevapları."
      breadcrumbs={[{ label: 'Sıkça Sorulanlar' }]}
    >
      <Eyebrow>Ürünlerimiz</Eyebrow>

      <FAQItem
        question="Ballarınız organik mi?"
        answer="Ballarımız Saitabat Köyü'nde, kimyasal müdahale olmadan hasat edilir; pastörize edilmez ve endüstriyel filtre görmez. Organik sertifika iddiası yerine her partiyi akredite laboratuvarda HMF, prolin, diastaz, nem ve şeker profili ile belgeleriz."
      />

      <FAQItem
        question="Bal kristalleşince ne yapmalıyım?"
        answer="Kristalleşme, gerçek balın doğal bir özelliğidir ve kalite göstergesidir. Kavanozu 35–40°C ılık suya koyarak balı yeniden akışkan hale getirebilirsiniz. Mikrodalga kullanmayın — enzimlere zarar verir."
      />

      <FAQItem
        question="Saklama koşulları nelerdir?"
        answer="Balı oda sıcaklığında, doğrudan güneş ışığından uzakta, kuru bir yerde saklayın. Buzdolabına koymayın. Arı sütü, polen ve Goldylium bakım ürünleri için etiket üzerindeki saklama talimatını izleyin."
      />

      <FAQItem
        question="Analiz raporuna nasıl ulaşırım?"
        answer={`Etiketteki QR kod, o lota ait analiz özetini açar. Tam rapor için sipariş numarası ve lot koduyla ${SITE_EMAILS.hello} adresine yazabilirsiniz.`}
      />

      <Eyebrow>Sipariş ve Kargo</Eyebrow>

      <FAQItem
        question="Kargom ne zaman gelir?"
        answer={`${SHIPPING_CUTOFF.charAt(0).toUpperCase()}${SHIPPING_CUTOFF.slice(1)}'e kadar ödemesi onaylanan siparişler aynı iş günü kargoya verilir. Türkiye içi teslimat tipik olarak ${SHIPPING_WINDOW} sürer.`}
      />

      <FAQItem
        question="Kargo ücreti ne kadar?"
        answer={copy.intro}
      />

      <FAQItem
        question="Faturamı nasıl alırım?"
        answer="Fatura, kargonun içinde veya e-posta ile iletilir. Kurumsal fatura için sipariş notuna unvan, vergi dairesi ve VKN bilgilerinizi ekleyin."
      />

      <Eyebrow>İade ve Değişim</Eyebrow>

      <FAQItem
        question="İade hakkım var mı?"
        answer="Teslimden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Açılmış gıda ve hijyen ürünlerinde Yönetmelik gereği cayma hakkı yoktur; hasarlı teslimatta ücretsiz değişim yapılır. Ayrıntı İade & Değişim sayfasındadır."
      />

      <FAQItem
        question="Ürün bozuk veya hasarlı geldi, ne yapmalıyım?"
        answer={`Teslimatta ürünü kontrol edin. Hasar varsa 24 saat içinde ${SITE_EMAILS.destek} adresine fotoğrafla bildirin. Hasarlı ürünü ücretsiz değiştiririz.`}
      />
    </StaticPageLayout>
  )
}
