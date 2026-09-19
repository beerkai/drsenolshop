// ═══════════════════════════════════════════════════════════════
// Site header — Editorial Minimal (Stitch)
//
// Anasayfa EditorialHeader'ı doğrudan kullanır (hero header'ın altına
// taşar). Diğer sayfalar bu sarmalayıcıyı kullanır: sabit header +
// altında onu telafi eden spacer, böylece içerik header'ın altına
// girmez.
//
// İçerik CMS snapshot'ından gelir; admin paneline taşındığında
// yalnızca bu import değişir.
// ═══════════════════════════════════════════════════════════════

import EditorialHeader from '@/components/editorial/EditorialHeader'
import { getHomeContent } from '@/lib/cms/home-content'
import type { EditorialHeaderContent } from '@/types/editorial-home'

interface Props {
  /** Farklı bir header içeriği (ileride sayfa bazlı CMS) */
  content?: EditorialHeaderContent
  /** Hero gibi header'ın altına taşan bölümlerde spacer istenmez */
  underlap?: boolean
}

export default async function Header({ content, underlap = false }: Props) {
  const resolved = content ?? (await getHomeContent()).editorial.header

  return (
    <>
      <EditorialHeader content={resolved} />
      {underlap ? null : <div aria-hidden className="ed-header-spacer" />}
    </>
  )
}
