import { requireAdmin } from '@/lib/admin-auth'
import { getHomeHtmlBlocks } from '@/lib/cms/home-html-blocks'
import HtmlBlocksEditor from './HtmlBlocksEditor'

export const dynamic = 'force-dynamic'

export default async function AdminHtmlBlocksPage() {
  await requireAdmin()
  const blocks = await getHomeHtmlBlocks()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
          Anasayfa
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Şeritler
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ad-fg-muted)', maxWidth: 640 }}>
          Parfüm seçkisinin hemen altında görünür. Görsel editörle yazın veya HTML kodu yapıştırın.
          Kapalı ve boş şeritler sitede çıkmaz.
        </p>
      </div>
      <HtmlBlocksEditor initialBlocks={blocks} />
    </div>
  )
}
