import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, Eyebrow, InfoBox } from '@/components/StaticContent'
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  SITE_ADDRESS_LINE,
  SITE_ADDRESS_LOCALITY,
  SITE_DIRECTIONS_URL,
  SITE_EMAILS,
  SITE_WHATSAPP_DISPLAY,
  SITE_WHATSAPP_URL,
  mailto,
} from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'İletişim · Dr. Şenol Shop',
  description: 'Sipariş, destek ve genel sorular için Dr. Şenol Shop iletişim bilgileri.',
}

export default function IletisimPage() {
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
          {SITE_ADDRESS_LINE}
          <br />
          {SITE_ADDRESS_LOCALITY}
          <br />
          <a
            href={SITE_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '14px',
              padding: '8px 14px',
              border: '1px solid var(--color-honey-amber)',
              color: 'var(--color-honey-amber)',
              textDecoration: 'none',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <span lang="en">Google</span>
            {' '}ile yol tarifi alın
          </a>
        </InfoBox>

        <InfoBox title="Telefon">
          <a
            href={SITE_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-honey-amber)', textDecoration: 'none' }}
          >
            {SITE_WHATSAPP_DISPLAY}
          </a>
          <br />
          <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>WhatsApp ile yazın</span>
        </InfoBox>

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
