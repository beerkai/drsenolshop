import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, H2, Eyebrow } from '@/components/StaticContent'

export const metadata: Metadata = {
  title: 'Basında Biz · Dr. Şenol Shop',
  description: "Dr. Şenol'un basında ve medyada yer alan röportajları, haberleri.",
}

export default function BasindaBizPage() {
  return (
    <StaticPageLayout
      eyebrow="Marka · Basında Biz"
      title="Medyada"
      titleAccent="bizim sesimiz."
      intro="Bilim ve doğanın buluştuğu hikâyemizin yansımaları."
      breadcrumbs={[{ label: 'Basında Biz' }]}
    >
      <Eyebrow>Yakında</Eyebrow>
      <H2>Basın kupürleri</H2>
      <P>
        Bu sayfa yer tutucu olarak buradadır. Yakında basında yer alan röportajları, makaleleri
        ve haberleri burada paylaşacağız.
      </P>

      <P>
        İçerik talebi veya iş birliği için:{' '}
        <span style={{ color: '#C9A961' }}>basin@drsenol.shop</span>
      </P>
    </StaticPageLayout>
  )
}
