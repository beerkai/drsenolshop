// ═══════════════════════════════════════════════════════════════
// Site footer — Editorial Minimal (Stitch)
//
// Footer + mobil alt navigasyon birlikte gelir; mobil nav sabit
// olduğu için altında güvenlik boşluğu bırakılır.
//
// Anasayfa EditorialFooter / EditorialMobileNav'ı doğrudan kullanır.
// ═══════════════════════════════════════════════════════════════

import EditorialFooter from '@/components/editorial/EditorialFooter'
import EditorialMobileNav from '@/components/editorial/EditorialMobileNav'
import { editorialHomeContent } from '@/lib/cms/home-page'
import type { EditorialFooterContent, EditorialMobileNavItem } from '@/types/editorial-home'

interface Props {
  content?: EditorialFooterContent
  mobileNav?: EditorialMobileNavItem[]
  /** Mobil alt navigasyonu gizle (ör. checkout odak akışı) */
  hideMobileNav?: boolean
}

export default function Footer({ content, mobileNav, hideMobileNav = false }: Props) {
  return (
    <>
      <EditorialFooter content={content ?? editorialHomeContent.footer} />
      {hideMobileNav ? null : (
        <>
          <div aria-hidden className="h-16 lg:hidden" />
          <EditorialMobileNav items={mobileNav ?? editorialHomeContent.mobileNav} />
        </>
      )}
    </>
  )
}
