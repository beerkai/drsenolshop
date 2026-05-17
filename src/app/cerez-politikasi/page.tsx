import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import LegalDraftNotice from '@/components/LegalDraftNotice'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { LEGAL_LAST_UPDATED, getLegalCompany } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: 'Çerez Politikası · Dr. Şenol Shop',
  description: 'Sitemizde kullanılan çerezler, türleri ve tercih yönetimi hakkında bilgi.',
}

export default function CerezPolitikasiPage() {
  const co = getLegalCompany()
  return (
    <StaticPageLayout
      eyebrow="Yasal · Çerezler"
      title="Çerez"
      titleAccent="politikası"
      intro={`Sitemizde kullanılan çerez türleri, amaçları ve tercih yönetimi. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Çerez Politikası' }]}
      topNotice={<LegalDraftNotice />}
    >
      <Eyebrow>Çerez Nedir</Eyebrow>
      <H2>Tarayıcınıza yerleştirilen küçük dosyalar</H2>
      <P>
        Çerezler (cookies), bir web sitesini ziyaret ettiğinizde tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır.
        Sitemizin doğru çalışması, oturumunuzun korunması ve kullanım deneyiminizin iyileştirilmesi için çerezlerden yararlanırız.
      </P>

      <Eyebrow>Türleri</Eyebrow>
      <H2>Hangi çerezleri kullanıyoruz</H2>

      <H2>Zorunlu çerezler</H2>
      <P>
        Sitenin temel işlevleri için gereklidir; devre dışı bırakılamazlar. Oturum, sepet ve güvenlik için kullanılır.
      </P>
      <List
        items={[
          'Supabase auth çerezleri (oturum yönetimi)',
          'Sepet içeriği (localStorage — çerez değil ama benzer amaç)',
          'CSRF koruma ve güvenlik token&apos;ları',
        ]}
      />

      <H2>Performans / analitik çerezler</H2>
      <P>
        Sitenin nasıl kullanıldığını anlamamıza yardımcı olur. Yalnızca açık rızanız ile aktif edilir.
      </P>
      <List
        items={[
          'Sayfa ziyaret istatistikleri (anonim)',
          'Yavaş yüklenen sayfaların tespiti',
        ]}
      />

      <H2>Pazarlama çerezleri</H2>
      <P>
        Şu anda üçüncü taraf pazarlama çerezi kullanmıyoruz. Bu durum değişirse politika güncellenecek ve sizden yeniden rıza istenecektir.
      </P>

      <Eyebrow>Tercih Yönetimi</Eyebrow>
      <H2>Çerezleri nasıl yönetebilirsiniz</H2>
      <P>
        Tarayıcınızın ayarlarından çerezleri reddedebilir, mevcut çerezleri silebilir veya bir çerez yerleştirildiğinde uyarı almayı seçebilirsiniz.
        Ancak zorunlu çerezleri reddederseniz sitenin bazı bölümleri çalışmayabilir.
      </P>
      <List
        items={[
          'Chrome: Ayarlar → Gizlilik ve güvenlik → Çerezler',
          'Safari: Tercihler → Gizlilik → Çerezleri ve site verilerini yönet',
          'Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri',
        ]}
      />

      <InfoBox title="Sorularınız için">
        <a href={`mailto:${co.email}`} style={{ color: '#C9A961' }}>{co.email}</a>
      </InfoBox>
    </StaticPageLayout>
  )
}
