import type { Metadata } from 'next'
import AnalysisReportGrid from '@/components/analizler/AnalysisReportGrid'
import StaticPageLayout from '@/components/StaticPageLayout'
import { getAnalysisReports } from '@/lib/analysis-reports'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Analizler · Dr. Şenol Shop',
  description: 'Yayımladığımız laboratuvar analiz raporları.',
}

export default async function AnalizlerPage() {
  const slots = await getAnalysisReports()
  const visible = slots.filter((slot) => slot.published && slot.pdfPath)

  return (
    <StaticPageLayout
      eyebrow="Marka · Analizler"
      title="Laboratuvar"
      titleAccent="raporları."
      intro="Yayımladığımız analiz belgeleri burada."
      breadcrumbs={[{ label: 'Analizler' }]}
    >
      <AnalysisReportGrid slots={visible} />
    </StaticPageLayout>
  )
}
