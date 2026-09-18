import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { GoldyliumSpotlightContent } from '@/types/editorial-home'
import EditorialPicture from './EditorialPicture'

export default function GoldyliumSpotlightSection({ content }: { content: GoldyliumSpotlightContent }) {
  return (
    <section className="w-full bg-charcoal-pure ed-section-y text-surface-container-lowest">
      <div className="ed-section-inner">
        <div className="ed-section-head ed-section-head--dark">
          <div className="ed-stack ed-min-w-0">
            <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
              {content.eyebrow}
            </span>
            <h2 className="font-headline-lg text-headline-lg font-light leading-[1.2] tracking-tight text-surface-container-lowest">
              {content.title}
            </h2>
          </div>
          <p className="ed-min-w-0 max-w-md font-body-md font-light leading-[1.65] text-surface-dim md:text-right">
            {content.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-space-md md:grid-cols-3">
          {content.products.map((product) => (
            <article
              key={product.id}
              className="ed-goldylium-card group border border-hairline-subtle/20 bg-[#141312]"
            >
              <div>
                <div className="relative mb-space-md aspect-[4/5] w-full overflow-hidden bg-charcoal-pure">
                  <EditorialPicture
                    image={product.image}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute left-2 top-2 bg-charcoal-pure/80 px-2 py-0.5 font-label-spec text-[9px] uppercase tracking-widest text-honey-amber">
                    {product.phaseBadge}
                  </span>
                </div>
                <div className="ed-goldylium-card__copy">
                  <span className="block font-editorial-caption text-[10px] uppercase leading-relaxed tracking-wider text-surface-dim">
                    {product.category}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-light text-surface-container-lowest">
                    {product.title}
                  </h3>
                  <p className="font-body-sm text-[12px] font-light text-hairline-subtle">{product.description}</p>
                </div>
              </div>
              <div className="ed-goldylium-card__footer">
                <span className="font-price-tag text-price-tag font-semibold text-honey-amber">{product.price}</span>
                <Link
                  href={product.href}
                  className="shrink-0 font-nav-caps text-[10px] uppercase tracking-widest text-surface-container-lowest transition-colors hover:text-honey-amber"
                >
                  {product.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md border-t border-hairline-subtle/30 pt-space-md text-surface-dim sm:flex-row">
          <span className="text-center font-label-spec text-label-spec uppercase leading-relaxed tracking-widest text-honey-amber sm:text-left">
            {content.assurance}
          </span>
          <Link
            href={content.collectionLink.href}
            className="flex shrink-0 items-center gap-2 font-nav-caps text-nav-caps uppercase tracking-widest text-surface-container-lowest transition-colors hover:text-honey-amber"
          >
            <span>{content.collectionLink.label}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
