import { requireAdmin } from '@/lib/admin-auth'
import { getAnalysisReports } from '@/lib/analysis-reports'
import AnalysisSlotsEditor from './AnalysisSlotsEditor'

export default async function AdminAnalizlerPage() {
  await requireAdmin()
  const slots = await getAnalysisReports()
  const withPdf = slots.filter((slot) => slot.pdfPath).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="pn-eyebrow" style={{ marginBottom: 12 }}>
          İçerik
        </p>
        <h1
          className="pn-display"
          style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Analizler
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ad-fg-muted)', maxWidth: 640 }}>
          {slots.length} slot · {withPdf} PDF. Yüklenen dosyalar{' '}
          <span lang="en">cdn.drsenol.shop/analizler/…</span> adresinden açılır ve{' '}
          <span lang="en">/analizler</span> sayfasındaki kartlara bağlanır.
        </p>
      </div>
      <AnalysisSlotsEditor initial={slots} />
    </div>
  )
}
