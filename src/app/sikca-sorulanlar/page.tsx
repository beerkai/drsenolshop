import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { Eyebrow, FAQItem } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Sıkça Sorulanlar · Dr. Şenol Shop',
  description: 'Merak edilen soruların cevapları.',
}

export default function SikcaSorulanlarPage() {
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
        answer="Tüm ballarımız doğal olarak üretilmektedir. Saitabat Köyü'nde endemik bitki örtüsünden, herhangi bir kimyasal müdahale olmaksızın hasat ediyoruz. Akredite laboratuvarlarda HMF, prolin, fenolik madde değerleri için analiz ediyoruz."
      />

      <FAQItem
        question="Bal kristalleşince ne yapmalıyım?"
        answer="Kristalleşme, gerçek balın doğal bir özelliğidir ve kalite göstergesidir. Kavanozu 35-40°C sıcak suya koyarak bal yeniden sıvı hale getirebilirsiniz. Mikrodalga kullanmayın — enzimlere zarar verir."
      />

      <FAQItem
        question="Saklama koşulları nelerdir?"
        answer="Balı oda sıcaklığında, doğrudan güneş ışığından uzakta, kuru bir yerde saklayın. Buzdolabında saklanmasına gerek yoktur. Arı sütü ve polen gibi ürünler için ürün etiketindeki saklama koşullarını takip edin."
      />

      <Eyebrow>Sipariş ve Kargo</Eyebrow>

      <FAQItem
        question="Kargom ne zaman gelir?"
        answer="Hafta içi 14:00'e kadar verilen siparişler aynı gün kargoya verilir. Türkiye'nin her yerine 2-4 iş günü içinde teslimat yapılır."
      />

      <FAQItem
        question="Kargo ücreti ne kadar?"
        answer="500 TL ve üzeri siparişlerde kargo ücretsizdir. 500 TL altı siparişlerde 49,90 TL kargo ücreti uygulanır."
      />

      <FAQItem
        question="Faturamı nasıl alırım?"
        answer="Her siparişle birlikte fatura kargonun içinde gönderilir. Kurumsal fatura talepleriniz için sipariş notuna vergi bilgilerinizi ekleyebilirsiniz."
      />

      <Eyebrow>İade ve Değişim</Eyebrow>

      <FAQItem
        question="İade hakkım var mı?"
        answer="Mesafeli satış sözleşmesi gereği, ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Detaylar için İade & Değişim sayfamızı inceleyiniz."
      />

      <FAQItem
        question="Ürün bozuk/hasarlı geldi, ne yapmalıyım?"
        answer="Lütfen teslim aldığınız anda ürünleri kontrol edin. Herhangi bir hasar veya sorun durumunda 24 saat içinde bilgi@drsenol.shop adresine fotoğrafla birlikte bildirim yapın. Hasarlı ürünleri ücretsiz değiştiriyoruz."
      />
    </StaticPageLayout>
  )
}
