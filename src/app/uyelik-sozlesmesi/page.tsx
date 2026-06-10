import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import LegalDraftNotice from '@/components/LegalDraftNotice'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getLegalCompany, LEGAL_LAST_UPDATED } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: 'Üyelik Sözleşmesi · Dr. Şenol Shop',
  description: 'Dr. Şenol Shop üyelik koşulları ve kullanım kuralları.',
}

export default function UyelikSozlesmesiPage() {
  const co = getLegalCompany()
  return (
    <StaticPageLayout
      eyebrow="Yasal · Üyelik"
      title="Üyelik"
      titleAccent="sözleşmesi"
      intro={`Hesap oluşturarak kabul ettiğiniz kullanım koşulları. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Üyelik Sözleşmesi' }]}
      topNotice={<LegalDraftNotice />}
    >
      <Eyebrow>Taraflar</Eyebrow>
      <H2>Sözleşmenin tarafları</H2>
      <P>
        İşbu Üyelik Sözleşmesi (&ldquo;Sözleşme&rdquo;), <strong style={{ color: 'var(--color-cream)' }}>{co.legal_name}</strong> (&ldquo;{co.trade_name}&rdquo;)
        ile <a href={co.website} style={{ color: 'var(--color-gold)' }}>{co.website}</a> sitesine üye olan gerçek/tüzel kişi (&ldquo;Üye&rdquo;) arasında
        elektronik ortamda akdedilir. Üye, hesap oluşturma işlemini tamamlayarak bu sözleşmenin tüm hükümlerini okuyup kabul ettiğini
        beyan eder.
      </P>

      <Eyebrow>Üyelik Koşulları</Eyebrow>
      <H2>Kim üye olabilir</H2>
      <List
        items={[
          '18 yaşını doldurmuş, fiil ehliyetine sahip gerçek kişiler veya tüzel kişiler üye olabilir',
          'Üye, kayıt sırasında verdiği bilgilerin doğruluğundan sorumludur',
          'Bir gerçek kişi yalnızca bir hesap açabilir; çoklu hesap tespit edilirse hesaplar askıya alınabilir',
          'Şifrenizin güvenliği sizin sorumluluğunuzdadır; üçüncü kişilerle paylaşmayınız',
        ]}
      />

      <Eyebrow>Hak ve Yükümlülükler</Eyebrow>
      <H2>Üye yükümlülükleri</H2>
      <List
        items={[
          'Site içeriğini hukuka, ahlaka ve genel kullanım kurallarına uygun kullanmak',
          'Diğer kullanıcıların haklarını ihlal edecek davranışlardan kaçınmak',
          'Sitenin çalışmasını engelleyici, yavaşlatıcı eylemlerde bulunmamak (otomatik script, scraping vb.)',
          'Telif hakkı ve fikri mülkiyet haklarına saygı göstermek',
          'Yanıltıcı bilgi ile sipariş vermemek, sahte ödeme girişiminde bulunmamak',
        ]}
      />

      <H2>Şirket yükümlülükleri</H2>
      <List
        items={[
          'Hizmeti makul özen ve dikkat çerçevesinde sunmak',
          'Kişisel verileri KVKK ve Gizlilik Politikası&apos;na uygun işlemek',
          'Üyenin talebi halinde hesabı kapatmak ve verileri yasal saklama süreleri dışında silmek',
          'Sözleşme şartlarında önemli bir değişiklik olursa Üye&apos;ye bildirim yapmak',
        ]}
      />

      <Eyebrow>Fesih</Eyebrow>
      <H2>Üyeliğin sona ermesi</H2>
      <P>
        Üye dilediği zaman <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a> üzerinden hesabının silinmesini talep edebilir.
        Şirket, sözleşme hükümlerine aykırılık halinde üyeliği önceden bildirim yaparak veya işin niteliği gereği bildirimsiz olarak
        askıya alma / sonlandırma hakkını saklı tutar.
      </P>

      <Eyebrow>Değişiklikler</Eyebrow>
      <H2>Sözleşmede güncellemeler</H2>
      <P>
        Şirket, işbu Sözleşmeyi tek taraflı olarak güncelleme hakkına sahiptir. Önemli değişiklikler e-posta veya site içi bildirim ile
        duyurulacaktır. Üyenin değişiklikten sonraki ilk girişi, güncellenmiş sözleşmeyi kabul ettiği anlamına gelir.
      </P>

      <Eyebrow>Uyuşmazlık</Eyebrow>
      <H2>Uygulanacak hukuk ve yetkili mahkeme</H2>
      <P>
        İşbu Sözleşmeden doğacak uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. Tüketici uyuşmazlıkları için Tüketici Hakem Heyetleri
        ve Tüketici Mahkemeleri; diğer uyuşmazlıklar için Bursa Mahkemeleri ve İcra Daireleri yetkilidir.
      </P>

      <InfoBox title="İletişim">
        <p style={{ margin: 0 }}>
          {co.legal_name}<br />
          {co.address}<br />
          E-posta: <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a>
        </p>
      </InfoBox>
    </StaticPageLayout>
  )
}
