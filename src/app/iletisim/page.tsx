import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, Eyebrow, InfoBox } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'İletişim · Dr. Şenol Shop',
  description: 'Bizimle iletişime geçin.',
}

export default function IletisimPage() {
  return (
    <StaticPageLayout
      eyebrow="Yardım · İletişim"
      title="Bize"
      titleAccent="ulaşın."
      intro="Saitabat'tan size en kısa sürede dönüyoruz."
      breadcrumbs={[{ label: 'İletişim' }]}
    >
      <Eyebrow>İletişim Bilgileri</Eyebrow>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          margin: '32px 0',
        }}
      >
        <InfoBox title="Adres">
          Saitabat Köyü, Yıldırım
          <br />
          Bursa, Türkiye
        </InfoBox>

        <InfoBox title="Telefon">
          <a href="tel:+902241234567" style={{ color: '#C9A961', textDecoration: 'none' }}>
            +90 224 123 45 67
          </a>
          <br />
          <span style={{ fontSize: '12px', color: '#6E665A' }}>Hafta içi 09:00 - 18:00</span>
        </InfoBox>

        <InfoBox title="E-posta">
          Genel:{' '}
          <a href="mailto:bilgi@drsenol.shop" style={{ color: '#C9A961', textDecoration: 'none' }}>
            bilgi@drsenol.shop
          </a>
          <br />
          Sipariş:{' '}
          <a
            href="mailto:siparis@drsenol.shop"
            style={{ color: '#C9A961', textDecoration: 'none' }}
          >
            siparis@drsenol.shop
          </a>
          <br />
          Basın:{' '}
          <a href="mailto:basin@drsenol.shop" style={{ color: '#C9A961', textDecoration: 'none' }}>
            basin@drsenol.shop
          </a>
        </InfoBox>

        <InfoBox title="WhatsApp">
          <a
            href="https://wa.me/902241234567"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#C9A961', textDecoration: 'none' }}
          >
            +90 224 123 45 67
          </a>
          <br />
          <span style={{ fontSize: '12px', color: '#6E665A' }}>
            Hızlı sipariş ve sorularınız için
          </span>
        </InfoBox>
      </div>

      <Eyebrow>Sosyal Medya</Eyebrow>
      <P>
        <a
          href="https://instagram.com/drsenolshop"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#C9A961', textDecoration: 'none', marginRight: '24px' }}
        >
          Instagram
        </a>
        <a
          href="https://youtube.com/@drsenol"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#C9A961', textDecoration: 'none' }}
          lang="en"
        >
          YouTube
        </a>
      </P>
    </StaticPageLayout>
  )
}
