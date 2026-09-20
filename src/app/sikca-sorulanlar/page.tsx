import type { Metadata } from 'next'
import StaticPageLayout from '@/components/StaticPageLayout'
import { Eyebrow, FAQItem } from '@/components/StaticContent'
import { getShippingConfig } from '@/lib/site-settings'
import { shippingCopy } from '@/lib/shipping-copy'
import { getSiteCopy } from '@/lib/site-copy'

export const metadata: Metadata = {
  title: 'Sıkça Sorulanlar · Dr. Şenol Shop',
  description: 'Bal, kargo, fatura, iade ve analiz raporları hakkında sık sorulanlar.',
}

export default async function SikcaSorulanlarPage() {
  const [copy, shippingConfig] = await Promise.all([getSiteCopy(), getShippingConfig()])
  const faq = copy.faq
  const ship = shippingCopy(shippingConfig)

  return (
    <StaticPageLayout
      eyebrow={faq.eyebrow}
      title={faq.title}
      titleAccent={faq.titleAccent}
      intro={faq.intro}
      breadcrumbs={[{ label: 'Sıkça Sorulanlar' }]}
    >
      {faq.sections.map((sec) => (
        <div key={sec.id}>
          <Eyebrow>{sec.eyebrow}</Eyebrow>
          {sec.items.map((item) => {
            let answer = item.answer
            if (item.id === 'fee' || answer.includes('Ayarlar → Kargo')) {
              answer = ship.intro
            }
            return <FAQItem key={item.id} question={item.question} answer={answer} />
          })}
        </div>
      ))}
    </StaticPageLayout>
  )
}
