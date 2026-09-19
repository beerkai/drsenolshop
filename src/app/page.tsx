import Hero from '@/components/Hero'
import HomeCuratedProducts from '@/components/editorial/HomeCuratedProducts'
import EditorialHeader from '@/components/editorial/EditorialHeader'
import Footer from '@/components/Footer'
import HomeCurationStrip from '@/components/editorial/HomeCurationStrip'
import HomeHarvestMetrics from '@/components/editorial/HomeHarvestMetrics'
import EditorialFeedSection from '@/components/editorial/EditorialFeedSection'
import EditorialJournalSection from '@/components/editorial/EditorialJournalSection'
import GoldyliumSpotlightSection from '@/components/editorial/GoldyliumSpotlightSection'
import InstagramCommunitySection from '@/components/editorial/InstagramCommunitySection'
import HomeValuesTicker from '@/components/editorial/HomeValuesTicker'
import { getHomeContent } from '@/lib/cms/home-content'

// İçerik admin tema editöründen geldiği için her istekte tazelenir.
export const revalidate = 0

export default async function HomePage() {
  const { hero, curationStrip, editorial: cms, curated } = await getHomeContent()

  return (
    <>
      <EditorialHeader content={cms.header} />

      <main className="flex w-full flex-col bg-surface pt-[var(--editorial-header-stack-mobile)] lg:pt-[var(--editorial-header-stack)]">
        <Hero {...hero} />
        <HomeCuratedProducts settings={curated} />
        <HomeCurationStrip content={curationStrip} />
        <HomeHarvestMetrics cells={cms.harvestMetrics} />
        {curated.legacyFeedEnabled ? (
          <EditorialFeedSection header={cms.feed.header} items={cms.feed.items} />
        ) : null}
        <EditorialJournalSection content={cms.journal} />
        <GoldyliumSpotlightSection content={cms.goldylium} />
        <InstagramCommunitySection content={cms.instagram} />
        <HomeValuesTicker values={cms.values} />
      </main>

      <Footer />
    </>
  )
}
