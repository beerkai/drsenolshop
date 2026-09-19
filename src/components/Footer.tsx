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
import { getHomeContent } from '@/lib/cms/home-content'
import type { EditorialFooterContent, EditorialMobileNavItem } from '@/types/editorial-home'

interface Props {
  content?: EditorialFooterContent
  mobileNav?: EditorialMobileNavItem[]
  /** Mobil alt navigasyonu gizle (ör. checkout odak akışı) */
  hideMobileNav?: boolean
}

export default async function Footer({ content, mobileNav, hideMobileNav = false }: Props) {
  const cms = content && mobileNav ? null : (await getHomeContent()).editorial

  return (
    <>
      <EditorialFooter
        content={content ?? cms!.footer}
        padForMobileNav={!hideMobileNav}
      />
      {hideMobileNav ? null : (
        <>
          <div
            aria-hidden
            className="h-[calc(var(--editorial-mobile-nav-height)+env(safe-area-inset-bottom,0px))] lg:hidden"
          />
          <EditorialMobileNav items={mobileNav ?? cms!.mobileNav} />
        </>
      )}
    </>
  )
}
