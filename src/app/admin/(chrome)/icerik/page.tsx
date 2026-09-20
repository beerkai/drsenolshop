import { requireAdmin } from '@/lib/admin-auth'
import { getSiteCopy } from '@/lib/site-copy'
import SiteCopyEditor from './SiteCopyEditor'

export default async function AdminSiteCopyPage() {
  await requireAdmin()
  const copy = await getSiteCopy()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
          İçerik
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Site metinleri
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ad-fg-muted)' }}>
          Yardım sayfaları ve SSS. Anasayfa için tema editörünü kullanın.
        </p>
      </div>
      <SiteCopyEditor initialCopy={copy} />
    </div>
  )
}
