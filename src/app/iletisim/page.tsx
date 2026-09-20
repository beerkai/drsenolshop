import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, Eyebrow, InfoBox } from '@/components/StaticContent'
import { getLegalCompany, phoneDigits } from '@/lib/legal-info'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_EMAILS, mailto } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'İletişim · Dr. Şenol Shop',
  description: 'Sipariş, destek ve genel sorular için Dr. Şenol Shop iletişim bilgileri.',
}

export default function IletisimPage() {
  const co = getLegalCompany()
  const digits = phoneDigits(co.phone)

  return (
    <StaticPageLayout
      eyebrow="Yardım · İletişim"
      title="Bize"
      titleAccent="ulaşın."
      intro="Saitabat'tan, iş günlerinde en kısa sürede dönüyoruz."
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
          {co.address}
          {co.city_country ? (
            <>
              <br />
              {co.city_country}
            </>
          ) : null}
        </InfoBox>

        {co.phone && digits ? (
          <InfoBox title="Telefon">
            <a href={`tel:+${digits}`} style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }}>
              {co.phone}
            </a>
            <br />
            <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Hafta içi 09:00 – 18:00</span>
          </InfoBox>
        ) : null}

        <InfoBox title="E-posta">
          Genel:{' '}
          <a href={mailto(SITE_EMAILS.hello)} style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }} lang="en">
            {SITE_EMAILS.hello}
          </a>
          <br />
          Destek:{' '}
          <a href={mailto(SITE_EMAILS.destek)} style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }} lang="en">
            {SITE_EMAILS.destek}
          </a>
          <br />
          Sipariş:{' '}
          <a href={mailto(SITE_EMAILS.siparis)} style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }} lang="en">
            {SITE_EMAILS.siparis}
          </a>
        </InfoBox>

        {digits ? (
          <InfoBox title="WhatsApp">
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }}
            >
              {co.phone}
            </a>
            <br />
            <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>
              Sipariş ve kısa sorular için
            </span>
          </InfoBox>
        ) : null}
      </div>

      <Eyebrow>Sosyal Medya</Eyebrow>
      <P>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-honey-amber)', textDecoration: 'none', marginRight: '24px' }}
          lang="en"
        >
          {INSTAGRAM_HANDLE}
        </a>
        <a
          href="https://youtube.com/@drsenol"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }}
          lang="en"
        >
          YouTube
        </a>
      </P>
    </StaticPageLayout>
  )
}
