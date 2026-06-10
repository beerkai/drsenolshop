import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import LegalDraftNotice from '@/components/LegalDraftNotice'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getLegalCompany, LEGAL_LAST_UPDATED } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu · Dr. Şenol Shop',
  description:
    'Mesafeli sözleşme öncesi tüketiciye sunulan ön bilgilendirme — satıcı bilgileri, cayma hakkı, teslimat ve ödeme koşulları.',
}

export default function OnBilgilendirmePage() {
  const co = getLegalCompany()
  return (
    <StaticPageLayout
      eyebrow="Yasal · Ön Bilgilendirme"
      title="Ön bilgilendirme"
      titleAccent="formu"
      intro={`6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, sipariş tamamlanmadan önce sunulan zorunlu bilgilendirme. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Ön Bilgilendirme Formu' }]}
      topNotice={<LegalDraftNotice />}
    >
      <Eyebrow>Madde 1</Eyebrow>
      <H2>Satıcı bilgileri</H2>
      <InfoBox title="Satıcı">
        <p style={{ margin: 0 }}>
          Unvan: {co.legal_name}<br />
          Adres: {co.address}, {co.city_country}<br />
          E-posta: <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a><br />
          Telefon: {co.phone}<br />
          MERSIS No: {co.mersis}<br />
          Vergi Dairesi / VKN: {co.tax_office} / {co.tax_number}
        </p>
      </InfoBox>

      <Eyebrow>Madde 2</Eyebrow>
      <H2>Sözleşme konusu ürün</H2>
      <P>
        Sözleşme konusu ürün(ler)in temel niteliği, satış fiyatı (KDV dahil), ödeme şekli ve teslimata ilişkin bilgiler ödeme sayfasında ve
        sipariş özetinde gösterilir. Listede yer alan ve sipariş onayı verilen ürünler, ön bilgilendirme formunun ayrılmaz parçasıdır.
      </P>

      <Eyebrow>Madde 3</Eyebrow>
      <H2>Toplam bedel</H2>
      <P>
        Ürün(lerin) KDV dahil satış bedeli, kargo ücreti (uygulanıyorsa) ve diğer tüm vergi ve harçlar dahil olmak üzere ödenecek toplam
        tutar, sipariş özetinde gösterilir ve faturada belirtilir.
      </P>

      <Eyebrow>Madde 4</Eyebrow>
      <H2>Ödeme</H2>
      <List
        items={[
          'Havale / EFT: Sipariş onayı sonrası iletilen banka hesabına yapılan ödeme bankaya geçtikten sonra sipariş işleme alınır',
          'Kredi / Banka Kartı: Sanal POS altyapısı üzerinden güvenli ödeme; kart bilgileriniz tarafımızda saklanmaz',
          '3D Secure: Kart hamilinin ek onayı için bankanız tarafından SMS doğrulama istenebilir',
        ]}
      />

      <Eyebrow>Madde 5</Eyebrow>
      <H2>Teslimat</H2>
      <P>
        Ürün, ödemenin alındığı tarihten itibaren en geç <strong style={{ color: 'var(--color-cream)' }}>30 gün</strong> içinde anlaşmalı kargo şirketi
        aracılığıyla Alıcı&apos;ya teslim edilir. Tipik teslimat süresi 2-4 iş günüdür.
        Kargo ücreti, sipariş tutarına ve uygulanan kampanyalara göre değişebilir; ödeme sayfasında ayrıca gösterilir.
      </P>

      <Eyebrow>Madde 6</Eyebrow>
      <H2>Cayma hakkı</H2>
      <P>
        Alıcı, sözleşme konusu ürünü teslim aldığı tarihten itibaren{' '}
        <strong style={{ color: 'var(--color-cream)' }}>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma
        hakkını kullanabilir. Cayma bildirimi yazılı olarak{' '}
        <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a> adresine yapılır. Cayma hakkının kullanılmasından itibaren
        14 gün içinde ürün Satıcı&apos;ya iade edilir; iade kargo ücreti{' '}
        <strong style={{ color: 'var(--color-cream)' }}>anlaşmalı kargo ile yapıldığında Satıcı&apos;ya aittir</strong>, aksi halde Alıcı tarafından karşılanır.
      </P>

      <H2>Cayma hakkı kullanılamayacak ürünler</H2>
      <P>
        Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca aşağıdaki ürünlerde cayma hakkı kullanılamaz:
      </P>
      <List
        items={[
          'Tüketicinin istekleri doğrultusunda hazırlanan, kişiselleştirilmiş ürünler',
          'Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler',
          'Tesliminden sonra ambalaj, bant, mühür gibi koruyucu unsurları açılmış olan ve sağlık/hijyen açısından iadesi uygun olmayan ürünler (örn. açılmış bal kavanozu)',
        ]}
      />

      <Eyebrow>Madde 7</Eyebrow>
      <H2>Şikayet ve uyuşmazlık çözüm yolları</H2>
      <P>
        Tüketici, talep ve şikayetlerini öncelikle{' '}
        <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a> adresine veya {co.phone} numarasına iletebilir.
        Uyuşmazlık halinde, T.C. Ticaret Bakanlığı tarafından belirlenen parasal sınırlar dahilinde tüketicinin yerleşim yerindeki veya
        tüketici işleminin yapıldığı yerdeki <strong style={{ color: 'var(--color-cream)' }}>Tüketici Hakem Heyetleri</strong> veya{' '}
        <strong style={{ color: 'var(--color-cream)' }}>Tüketici Mahkemeleri</strong> yetkilidir.
      </P>

      <Eyebrow>Madde 8</Eyebrow>
      <H2>Ön bilgilendirme onayı</H2>
      <P>
        Alıcı, ödeme sayfasında işbu Ön Bilgilendirme Formu&apos;nu okuduğunu ve bilgi sahibi olduğunu beyan ederek siparişi onaylar.
        Sipariş onayı verilmeden bu form ve Mesafeli Satış Sözleşmesi&apos;nin Alıcı&apos;ya elektronik ortamda iletilmiş olması zorunludur.
      </P>
    </StaticPageLayout>
  )
}
