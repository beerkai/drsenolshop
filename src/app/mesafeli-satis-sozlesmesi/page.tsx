import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import LegalDraftNotice from '@/components/LegalDraftNotice'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getLegalCompany, LEGAL_LAST_UPDATED } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi · Dr. Şenol Shop',
  description:
    'Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında Satıcı ile Alıcı arasında düzenlenen sözleşme metni.',
}

export default function MesafeliSatisSozlesmesiPage() {
  const co = getLegalCompany()
  return (
    <StaticPageLayout
      eyebrow="Yasal · Mesafeli Satış"
      title="Mesafeli satış"
      titleAccent="sözleşmesi"
      intro={`Bu sayfa sözleşmenin genel hükümlerini içerir. Her sipariş için sipariş özetini içeren özelleştirilmiş bir nüsha e-posta ile gönderilir. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Mesafeli Satış Sözleşmesi' }]}
      topNotice={<LegalDraftNotice />}
    >
      <Eyebrow>Madde 1</Eyebrow>
      <H2>Taraflar</H2>

      <H2>1.1. Satıcı</H2>
      <InfoBox title="Satıcı">
        <p style={{ margin: 0 }}>
          Unvan: {co.legal_name}<br />
          Adres: {co.address}, {co.city_country}<br />
          Telefon: {co.phone}<br />
          E-posta: <a href={`mailto:${co.email}`} style={{ color: '#C9A961' }}>{co.email}</a><br />
          MERSIS No: {co.mersis}<br />
          Vergi Dairesi / VKN: {co.tax_office} / {co.tax_number}
        </p>
      </InfoBox>

      <H2>1.2. Alıcı</H2>
      <P>
        Alıcı; ödeme sayfasında belirttiği ad, soyad, e-posta, telefon ve adres bilgileri ile sözleşmeyi kuran tüketicidir.
        Bu bilgiler sipariş sonrası gönderilen sözleşme nüshasında detaylı olarak yer alır.
      </P>

      <Eyebrow>Madde 2</Eyebrow>
      <H2>Konu</H2>
      <P>
        İşbu Sözleşme&apos;nin konusu, Alıcı&apos;nın Satıcı&apos;ya ait <a href={co.website} style={{ color: '#C9A961' }}>{co.website}</a>{' '}
        internet sitesinden elektronik ortamda siparişini yaptığı, aşağıda nitelikleri ve satış fiyatı belirtilen ürünün(lerin) satışı ve
        teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince
        tarafların hak ve yükümlülüklerinin saptanmasıdır.
      </P>

      <Eyebrow>Madde 3</Eyebrow>
      <H2>Sözleşme konusu ürün, ödeme ve teslimat</H2>
      <P>
        Ürünün cinsi ve türü, miktarı, marka/modeli, satış bedeli (KDV dahil), ödeme şekli, teslimat alıcısı, teslimat adresi, kargo ücreti
        ve sipariş tarihine ilişkin bilgiler sipariş onay e-postasında ve hesabınızdaki sipariş detayında yer alır. Söz konusu bilgiler,
        işbu Sözleşme&apos;nin ayrılmaz parçasıdır.
      </P>

      <Eyebrow>Madde 4</Eyebrow>
      <H2>Genel hükümler</H2>
      <List
        items={[
          'Alıcı, sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin tüm ön bilgileri okuyup elektronik ortamda onayladığını kabul ve beyan eder',
          'Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için Alıcı&apos;nın yerleşim yerinin uzaklığına bağlı olarak ön bilgiler içinde açıklanan süre içinde Alıcı veya gösterdiği adresteki kişi/kuruluşa teslim edilir',
          'Sözleşme konusu ürünün teslimatı için sözleşmenin elektronik ortamda onaylanmış olması ve satış bedelinin Alıcı&apos;nın tercih ettiği ödeme şekli ile ödenmiş olması şarttır',
          'Ürünün tesliminden sonra Alıcı&apos;ya ait kredi kartının Alıcı&apos;nın kusurundan kaynaklanmayan bir şekilde yetkisiz kişilerce haksız veya hukuka aykırı olarak kullanılması nedeniyle ilgili banka veya finans kuruluşunun ürün bedelini Satıcı&apos;ya ödememesi halinde, Alıcı&apos;nın kendisine teslim edilmiş olması kaydıyla ürünü 3 (üç) gün içinde Satıcı&apos;ya iade etmesi zorunludur. Bu halde kargo giderleri Alıcı&apos;ya aittir',
          'Mücbir sebepler veya nakliyeyi engelleyen hava muhalefeti, ulaşım kesintisi gibi olağanüstü durumlar nedeni ile sözleşme konusu ürün süresi içinde teslim edilemez ise, durum Alıcı&apos;ya bildirilir; Alıcı siparişin iptal edilmesini, sözleşme konusu ürünün varsa emsali ile değiştirilmesini, ve/veya teslimat süresinin engelleyici durumun ortadan kalkmasına kadar ertelenmesini talep edebilir',
        ]}
      />

      <Eyebrow>Madde 5</Eyebrow>
      <H2>Cayma hakkı</H2>
      <P>
        Alıcı, sözleşme konusu ürünü kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren{' '}
        <strong style={{ color: '#F4F0E8' }}>14 (on dört) gün</strong> içerisinde, Satıcı&apos;ya bildirmek şartıyla hiçbir hukuki ve cezai
        sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı bildirimi yazılı olarak{' '}
        <a href={`mailto:${co.email}`} style={{ color: '#C9A961' }}>{co.email}</a> adresine yapılabilir.
      </P>
      <P>
        Cayma hakkının kullanılması halinde Satıcı, cayma bildiriminin kendisine ulaştığı tarihten itibaren 14 gün içinde tüm ödemeleri,
        teslimat masrafları dahil olmak üzere Alıcı&apos;ya iade eder. Alıcı da iade için ürünü 14 gün içinde Satıcı&apos;ya göndermekle
        yükümlüdür. İade için anlaşmalı kargo kullanıldığında kargo ücreti Satıcı&apos;ya aittir.
      </P>

      <H2>Cayma hakkının kullanılamayacağı haller</H2>
      <List
        items={[
          'Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallar',
          'Çabuk bozulabilen veya son kullanma tarihi geçebilecek mallar',
          'Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan; sağlık veya hijyen açısından iadesi uygun olmayan ürünler (örn. açılmış bal kavanozu)',
          'Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallar',
        ]}
      />

      <Eyebrow>Madde 6</Eyebrow>
      <H2>Temerrüt halleri ve hukuki sonuçları</H2>
      <P>
        Alıcı, kredi kartı ile yapmış olduğu işlemlerde temerrüde düşmesi halinde kart sahibi bankanın yapacağı ek faiz ve ücretlerden
        sorumludur. Bu durumda banka, hukuki yollara başvurabilir; doğacak masrafları ve vekâlet ücretini Alıcı&apos;dan talep edebilir.
      </P>

      <Eyebrow>Madde 7</Eyebrow>
      <H2>Yetkili mahkeme</H2>
      <P>
        İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile Alıcı&apos;nın
        veya Satıcı&apos;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
      </P>

      <Eyebrow>Madde 8</Eyebrow>
      <H2>Yürürlük</H2>
      <P>
        Alıcı, sipariş gerçekleştirdiğinde işbu sözleşmenin tüm koşullarını kabul etmiş sayılır. Sözleşme, sipariş onayı verildiği anda
        karşılıklı olarak yürürlüğe girer.
      </P>
    </StaticPageLayout>
  )
}
