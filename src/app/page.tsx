import Hero from '@/components/Hero'
import HomeCuratedProducts from '@/components/editorial/HomeCuratedProducts'
import EditorialHeader from '@/components/editorial/EditorialHeader'
import Footer from '@/components/Footer'
import HomeHarvestMetrics from '@/components/editorial/HomeHarvestMetrics'
import HomeHtmlBlocks from '@/components/editorial/HomeHtmlBlocks'
import EditorialFeedSection from '@/components/editorial/EditorialFeedSection'
import EditorialJournalSection from '@/components/editorial/EditorialJournalSection'
import HomeGoldyliumCatalogTeaser from '@/components/editorial/HomeGoldyliumCatalogTeaser'
import InstagramCommunitySection from '@/components/editorial/InstagramCommunitySection'
import HomeValuesTicker from '@/components/editorial/HomeValuesTicker'
import { getHomeContent } from '@/lib/cms/home-content'
import { getHomeHtmlBlocks } from '@/lib/cms/home-html-blocks'

// İçerik admin tema editöründen geldiği için her istekte tazelenir.
export const revalidate = 0

// GoldyliumSpotlightSection (Apiterapi placeholder) anasayfada kapalı.

export default async function HomePage() {
  const [{ hero, editorial: cms, curated }, htmlBlocks] = await Promise.all([
    getHomeContent(),
    getHomeHtmlBlocks(),
  ])

  return (
    <>
      <EditorialHeader content={cms.header} />

      <main className="flex w-full flex-col bg-surface pt-[var(--editorial-header-stack-mobile)] lg:pt-[var(--editorial-header-stack)]">
        <Hero {...hero} />
        <HomeCuratedProducts settings={curated} />
        <HomeGoldyliumCatalogTeaser />
        <HomeHtmlBlocks blocks={htmlBlocks} />
        <HomeHarvestMetrics cells={cms.harvestMetrics} />
        {curated.legacyFeedEnabled ? (
          <EditorialFeedSection header={cms.feed.header} items={cms.feed.items} />
        ) : null}
        <EditorialJournalSection content={cms.journal} />
        <InstagramCommunitySection content={cms.instagram} />
        <HomeValuesTicker values={cms.values} />
      </main>

      <Footer />
    </>
  )
}
