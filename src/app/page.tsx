import Hero from '@/components/Hero'
import EditorialHeader from '@/components/editorial/EditorialHeader'
import EditorialMobileNav from '@/components/editorial/EditorialMobileNav'
import HomeCurationStrip from '@/components/editorial/HomeCurationStrip'
import HomeHarvestMetrics from '@/components/editorial/HomeHarvestMetrics'
import EditorialFeedSection from '@/components/editorial/EditorialFeedSection'
import EditorialJournalSection from '@/components/editorial/EditorialJournalSection'
import GoldyliumSpotlightSection from '@/components/editorial/GoldyliumSpotlightSection'
import InstagramCommunitySection from '@/components/editorial/InstagramCommunitySection'
import HomeValuesTicker from '@/components/editorial/HomeValuesTicker'
import EditorialFooter from '@/components/editorial/EditorialFooter'
import { getHomeContent } from '@/lib/cms/home-content'

// İçerik admin tema editöründen geldiği için her istekte tazelenir.
export const revalidate = 0

export default async function HomePage() {
  const { hero, curationStrip, editorial: cms } = await getHomeContent()

  return (
    <>
      <EditorialHeader content={cms.header} />

      <main className="flex w-full flex-col bg-surface pb-28 pt-[var(--editorial-header-stack-mobile)] lg:pb-0 lg:pt-[var(--editorial-header-stack)]">
        <Hero {...hero} />
        <HomeCurationStrip content={curationStrip} />
        <HomeHarvestMetrics cells={cms.harvestMetrics} />
        <EditorialFeedSection header={cms.feed.header} items={cms.feed.items} />
        <EditorialJournalSection content={cms.journal} />
        <GoldyliumSpotlightSection content={cms.goldylium} />
        <InstagramCommunitySection content={cms.instagram} />
        <HomeValuesTicker values={cms.values} />
      </main>

      <EditorialFooter content={cms.footer} />
      <EditorialMobileNav items={cms.mobileNav} />
    </>
  )
}
