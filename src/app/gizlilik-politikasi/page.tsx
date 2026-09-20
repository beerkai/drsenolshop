import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List } from '@/components/StaticContent'
import { getLegalCompany, LEGAL_LAST_UPDATED } from '@/lib/legal-info'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası · Dr. Şenol Shop',
  description:
    'drsenol.shop üzerinde hangi bilgileri topladığımız, çerezler, analitik ve veri güvenliği hakkında gizlilik politikası.',
}

export default function GizlilikPolitikasiPage() {
  const co = getLegalCompany()
  const siteUrl = getSiteUrl()

  return (
    <StaticPageLayout
      eyebrow="Yasal · Gizlilik"
      title="Gizlilik"
      titleAccent="politikası"
      intro={`${siteUrl} adresindeki deneyiminizde verilerinizi nasıl kullandığımıza dair özet. KVKK aydınlatma metni ayrı sayfada. Son güncelleme: ${LEGAL_LAST_UPDATED}.`}
      breadcrumbs={[{ label: 'Gizlilik Politikası' }]}
    >
      <Eyebrow>Kapsam</Eyebrow>
      <H2>Bu politika neyi kapsar</H2>
      <P>
        Bu metin, {co.trade_name} e-ticaret sitesinde ( {siteUrl} ) gezinirken, hesap oluştururken ve sipariş verirken
        toplanan bilgilerin genel çerçevesini açıklar. Türkiye&apos;deki yasal yükümlülüklerimiz için ayrıntılı{' '}
        <Link href="/kvkk-aydinlatma" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </Link>
        &apos;ni okumanızı öneririz.
      </P>

      <Eyebrow>Topladığımız bilgiler</Eyebrow>
      <H2>Hangi veriler</H2>
      <List
        items={[
          'Hesap: ad, e-posta, şifrelenmiş parola',
          'Sipariş: teslimat adresi, telefon, sipariş kalemleri ve ödeme durumu',
          'İletişim: bülten aboneliği (yalnızca onayınızla)',
          'Teknik: tarayıcı türü, oturum çerezleri, güvenlik logları',
        ]}
      />

      <Eyebrow>Çerezler & analitik</Eyebrow>
      <H2>Çerezler ve ölçüm</H2>
      <P>
        Zorunlu çerezler oturum ve sepet işlevleri için kullanılır. Detaylar için{' '}
        <Link href="/cerez-politikasi" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          Çerez Politikası
        </Link>
        &apos;na bakın. Trafik ölçümü için çerez kullanmayan Plausible Analytics tercih edilebilir; etkinse site
        trafiği anonim özetlenir.
      </P>

      <Eyebrow>Güvenlik</Eyebrow>
      <H2>Verilerinizi nasıl koruyoruz</H2>
      <P>
        Ödeme kartı bilgileri tarafımızda saklanmaz; ödeme kuruluşuna iletilir. Veritabanı ve barındırma altyapısı
        endüstri standartlarında erişim kontrolü ile korunur. Şüpheli işlem tespitinde hesap veya sipariş askıya
        alınabilir.
      </P>

      <Eyebrow>Haklarınız</Eyebrow>
      <H2>Erişim ve silme</H2>
      <P>
        Hesabınız üzerinden sipariş geçmişinizi görüntüleyebilir; hesap silme talebinde bulunabilirsiniz. KVKK
        kapsamındaki tüm haklar ve resmi başvuru yolu{' '}
        <Link href="/kvkk-aydinlatma" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </Link>
        &apos;nde açıklanmıştır.
      </P>

      <Eyebrow>İletişim</Eyebrow>
      <H2>Gizlilik soruları</H2>
      <P>
        Gizlilik ile ilgili sorularınız için{' '}
        <a href={`mailto:${co.email}`} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {co.email}
        </a>{' '}
        adresine yazabilirsiniz.
      </P>
    </StaticPageLayout>
  )
}
