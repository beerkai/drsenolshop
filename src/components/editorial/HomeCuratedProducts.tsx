import type { HomeCuratedSettings } from '@/types/home-curated'
import { getHomeCuratedProductSets } from '@/lib/home-curated-products'
import ProductHorizontalRail from './ProductHorizontalRail'
import ProductCard from '@/components/ProductCard'
import HomeCuratedEmptyState from './HomeCuratedEmptyState'
import TrackedLink from './TrackedLink'

interface Props {
  settings: HomeCuratedSettings
}

export default async function HomeCuratedProducts({ settings }: Props) {
  const { mostPreferred, signature, supabaseConfigured } = await getHomeCuratedProductSets(settings)
  const cfgP = settings.mostPreferred
  const cfgS = settings.signature

  const showPreferred = cfgP.enabled
  const showSignature = cfgS.enabled

  if (!showPreferred && !showSignature) return null

  const preferredEmpty = showPreferred && mostPreferred.length === 0
  const signatureEmpty = showSignature && signature.length === 0

  if (!supabaseConfigured && (showPreferred || showSignature)) {
    return (
      <section className="w-full border-b border-hairline-light bg-surface ed-section-y">
        <div className="ed-section-inner">
          <HomeCuratedEmptyState
            title="Katalog bağlantısı bekleniyor"
            message="Ürün vitrinini göstermek için Supabase ortam değişkenlerini yapılandırın. Yerel geliştirmede .env.local dosyasını kontrol edin."
            actionHref="/koleksiyon"
            actionLabel="Koleksiyon sayfasına git"
          />
        </div>
      </section>
    )
  }

  return (
    <>
      {showPreferred ? (
        <section
          id="tercih-edilenler"
          className="w-full border-b border-hairline-light bg-surface ed-section-y"
        >
          <div className="ed-section-inner">
            <div className="ed-section-head mb-space-lg">
              <div className="ed-stack ed-min-w-0">
                <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
                  {cfgP.eyebrow}
                </span>
                <h2 className="font-headline-lg text-headline-lg font-light leading-[1.2] text-on-surface">
                  {cfgP.title}
                </h2>
              </div>
              <div className="flex flex-col items-start gap-space-sm md:items-end">
                {cfgP.description ? (
                  <p className="ed-min-w-0 max-w-sm font-body-sm text-body-sm leading-relaxed text-on-surface-variant md:text-right">
                    {cfgP.description}
                  </p>
                ) : null}
                <TrackedLink
                  href={cfgP.viewAllHref}
                  eventName="Home View All"
                  eventProps={{ section: 'most-preferred' }}
                  className="shrink-0 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {cfgP.viewAllLabel} →
                </TrackedLink>
              </div>
            </div>

            {preferredEmpty ? (
              <HomeCuratedEmptyState
                title="Henüz seçili ürün yok"
                message="Bu bölüm için katalogda ürün bulunamadı. Tema editöründen manuel ürün seçebilir veya bal kategorisine ürün ekleyebilirsiniz."
                actionHref={cfgP.viewAllHref}
                actionLabel={cfgP.viewAllLabel}
              />
            ) : (
              <ProductHorizontalRail products={mostPreferred} sectionKey="most-preferred" />
            )}
          </div>
        </section>
      ) : null}

      {showSignature ? (
        <section className="w-full border-b border-hairline-light bg-surface-container-low ed-section-y">
          <div className="ed-section-inner">
            <div className="ed-section-head mb-space-lg">
              <div className="ed-stack ed-min-w-0">
                <span
                  className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber"
                  lang={cfgS.titleLang === 'en' ? 'en' : undefined}
                >
                  {cfgS.eyebrow}
                </span>
                <h2
                  className="font-headline-lg text-headline-lg font-light leading-[1.2] text-on-surface"
                  lang={cfgS.titleLang === 'en' ? 'en' : undefined}
                >
                  {cfgS.title}
                </h2>
              </div>
              <TrackedLink
                href={cfgS.viewAllHref}
                eventName="Home View All"
                eventProps={{ section: 'signature' }}
                className="shrink-0 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
                lang={cfgS.titleLang === 'en' ? 'en' : undefined}
              >
                {cfgS.viewAllLabel} →
              </TrackedLink>
            </div>

            {signatureEmpty ? (
              <HomeCuratedEmptyState
                title="Signature Series yakında"
                message="Signature kategorisinde henüz listelenen ürün yok. Tema editöründen ürün seçin veya kategoriye yeni hasat ekleyin."
                actionHref={cfgS.viewAllHref}
                actionLabel={cfgS.viewAllLabel}
              />
            ) : (
              <div className="grid grid-cols-2 items-stretch gap-gutter md:gap-gutter">
                {signature.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 2}
                    variant={cfgS.darkCards ? 'dark' : 'light'}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </>
  )
}
