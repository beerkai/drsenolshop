// ═══════════════════════════════════════════════════════════════
// /admin/gorseller — anasayfa yer tutucu fotoğrafları
// ═══════════════════════════════════════════════════════════════

import { requireAdmin } from '@/lib/admin-auth'
import { getHomeContent } from '@/lib/cms/home-content'
import { listEditorialSlots } from '@/lib/cms/editorial-slots'
import EditorialImagesClient from './EditorialImagesClient'

export const dynamic = 'force-dynamic'

export default async function AdminGorsellerPage() {
  await requireAdmin()
  const content = await getHomeContent()
  const slots = listEditorialSlots(content)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
          İçerik
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Görseller
        </h1>
      </div>
      <EditorialImagesClient initial={slots} />
    </div>
  )
}
