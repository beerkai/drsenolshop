import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import LegalDraftNotice from '@/components/LegalDraftNotice'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { getLegalCompany, LEGAL_LAST_UPDATED } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası · Dr. Şenol Shop',
  description:
    'KVKK kapsamında kişisel verilerin işlenmesi, aktarımı ve haklarınız hakkında aydınlatma metni.',
}

export default function GizlilikPolitikasiPage() {
  const co = getLegalCompany()
  return (
    <StaticPageLayout
      eyebrow="Yasal · Gizlilik"
      title="Gizlilik"
      titleAccent="politikası"
      intro={`KVKK kapsamında kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında aydınlatma. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Gizlilik Politikası' }]}
      topNotice={<LegalDraftNotice />}
    >
      <Eyebrow>Veri Sorumlusu</Eyebrow>
      <H2>Kim olduğumuz</H2>
      <P>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca veri sorumlusu sıfatıyla{' '}
        <strong style={{ color: 'var(--color-cream)' }}>{co.legal_name}</strong> (&ldquo;Şirket&rdquo; / &ldquo;{co.trade_name}&rdquo;) hareket etmektedir.
        Aşağıda kişisel verilerinizin hangi amaçlarla işlendiği, kimlerle paylaşılabileceği ve KVKK kapsamındaki haklarınız açıklanmıştır.
      </P>

      <InfoBox title="Veri Sorumlusu">
        <p style={{ margin: 0 }}>
          {co.legal_name}<br />
          {co.address}<br />
          {co.city_country}<br />
          E-posta: <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a><br />
          Telefon: {co.phone}<br />
          KEP: {co.kep}<br />
          MERSIS: {co.mersis}
        </p>
      </InfoBox>

      <Eyebrow>İşlenen Veriler</Eyebrow>
      <H2>Hangi verilerinizi topluyoruz</H2>
      <P>
        Sitemizi kullandığınızda, sipariş verdiğinizde veya hesap oluşturduğunuzda aşağıdaki veri kategorilerini işleyebiliriz:
      </P>
      <List
        items={[
          'Kimlik bilgileri: ad, soyad',
          'İletişim bilgileri: e-posta adresi, telefon numarası, teslimat ve fatura adresi',
          'Müşteri işlem bilgileri: sipariş geçmişi, fatura/irsaliye bilgileri, talep ve şikayet kayıtları',
          'Hesap bilgileri: kullanıcı adı, şifrelenmiş parola, oturum çerezleri',
          'İşlem güvenliği: IP adresi, log kayıtları, tarayıcı bilgisi',
          'Pazarlama izinleri: bülten aboneliği, kampanya tercih bilgileri (yalnızca açık rıza ile)',
        ]}
      />

      <Eyebrow>İşleme Amaçları</Eyebrow>
      <H2>Verilerinizi neden işliyoruz</H2>
      <List
        items={[
          'Sipariş oluşturma, ödeme alma, fatura düzenleme ve kargo süreçlerinin yürütülmesi',
          'Müşteri ilişkileri yönetimi, talep ve şikayetlerin değerlendirilmesi',
          'Hesap güvenliği, dolandırıcılığın önlenmesi ve hukuki yükümlülüklerin yerine getirilmesi',
          'Vergi mevzuatı, e-ticaret ve tüketici hukuku gereği saklama yükümlülükleri',
          'Açık rıza vermeniz halinde tanıtım, kampanya bildirimi ve pazarlama iletişimi',
        ]}
      />

      <Eyebrow>Hukuki Sebep</Eyebrow>
      <H2>Hangi temele dayanıyoruz</H2>
      <P>
        Kişisel verileriniz KVKK m.5/2 kapsamında <em>sözleşmenin kurulması veya ifası</em>, <em>hukuki yükümlülüğün
        yerine getirilmesi</em>, <em>meşru menfaat</em> ve gerektiği hallerde <em>açık rıza</em> hukuki sebeplerine
        dayanılarak işlenir.
      </P>

      <Eyebrow>Veri Aktarımı</Eyebrow>
      <H2>Kimlerle paylaşıyoruz</H2>
      <P>
        Verileriniz aşağıda sayılan üçüncü kişilerle, yalnızca hizmetin gerektirdiği ölçüde ve KVKK&apos;ya uygun
        olarak paylaşılır:
      </P>
      <List
        items={[
          'Kargo şirketleri (teslimat için ad, adres, telefon)',
          'Ödeme/sanal POS sağlayıcıları (kart bilgileriniz tarafımızda saklanmaz, doğrudan ödeme kuruluşuna iletilir)',
          'E-posta gönderim altyapısı sağlayıcısı (sipariş bildirimi, parola sıfırlama)',
          'Barındırma (hosting), veritabanı ve bulut sağlayıcıları',
          'Yasal yükümlülük halinde yetkili kamu kurumları',
        ]}
      />

      <Eyebrow>Saklama Süresi</Eyebrow>
      <H2>Ne kadar süre saklıyoruz</H2>
      <P>
        Sipariş ve fatura kayıtları Vergi Usul Kanunu ile Türk Ticaret Kanunu uyarınca <strong style={{ color: 'var(--color-cream)' }}>10 yıl</strong>{' '}
        saklanır. Hesap verileriniz, hesabınızı silmediğiniz sürece üyeliğiniz boyunca tutulur. Pazarlama izinleri
        izninizi geri çekene kadar geçerlidir.
      </P>

      <Eyebrow>Haklarınız</Eyebrow>
      <H2>KVKK m.11 kapsamındaki haklarınız</H2>
      <List
        items={[
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
          'İşlenmişse buna ilişkin bilgi talep etme',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
          'Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
          'Silinmesini veya yok edilmesini isteme (kanuni saklama süreleri saklı kalmak kaydıyla)',
          'Otomatik sistemlerle aleyhinize bir sonuç ortaya çıkmışsa buna itiraz etme',
          'Kanuna aykırı işleme nedeniyle zarara uğradıysanız tazminat talep etme',
        ]}
      />

      <Eyebrow>Başvuru</Eyebrow>
      <H2>Bize nasıl ulaşırsınız</H2>
      <P>
        Yukarıdaki haklarınızı kullanmak için talebinizi <a href={`mailto:${co.email}`} style={{ color: 'var(--color-gold)' }}>{co.email}</a>{' '}
        e-posta adresimize veya yazılı olarak şirket adresimize iletebilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanır.
      </P>

      <InfoBox title="Son Güncelleme">{LEGAL_LAST_UPDATED}</InfoBox>
    </StaticPageLayout>
  )
}
