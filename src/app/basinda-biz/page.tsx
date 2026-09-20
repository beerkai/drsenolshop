import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow, List, InfoBox } from '@/components/StaticContent'
import { SITE_EMAILS, mailto } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Basında Biz · Dr. Şenol Shop',
  description: 'Dr. Şenol Shop basın ve iş birliği iletişimi.',
}

export default function BasindaBizPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Basında Biz"
      title="Medya ve"
      titleAccent="iş birliği."
      intro="Saitabat arıcılığı, laboratuvar kayıtları ve hasat seçkisi üzerine röportaj, görsel ve bilgi talepleri."
      breadcrumbs={[{ label: 'Basında Biz' }]}
    >
      <Eyebrow>İletişim</Eyebrow>
      <H2>Basın ve içerik talebi</H2>
      <P>
        Marka hikâyesi, hasat görselleri, laboratuvar yöntemi veya ürün bilgisi için aşağıdaki
        adrese yazın. Konuya yayının adı, teslim tarihi ve ihtiyaç duyduğunuz malzemeyi eklemeniz
        yanıtı hızlandırır.
      </P>
      <List
        items={[
          'Kısa marka özeti ve kurucu notu',
          'Saitabat konum ve flora bilgisi',
          'Analiz yöntemi (HMF, prolin, diastaz, polen)',
          'Yüksek çözünürlüklü ürün ve hasat görselleri (müsaade üzerine)',
        ]}
      />

      <InfoBox title="Basın hattı">
        <a href={mailto(SITE_EMAILS.hello)} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {SITE_EMAILS.hello}
        </a>
        <br />
        Konu satırına &quot;Basın&quot; yazmanız yeterlidir.
      </InfoBox>

      <P>
        Marka anlatısı için{' '}
        <Link href="/hikaye" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          hikâyemiz
        </Link>
        , yöntem için{' '}
        <Link href="/bilim-yaklasimimiz" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          bilim yaklaşımımız
        </Link>
        {' '}sayfalarını kullanabilirsiniz.
      </P>
    </StaticPageLayout>
  )
}
