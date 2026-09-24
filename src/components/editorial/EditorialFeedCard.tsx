import { Link } from '@/i18n/navigation'
import { ArrowRight, Plus, Quote } from 'lucide-react'
import type { EditorialFeedItem } from '@/types/editorial-home'
import EditorialPicture from './EditorialPicture'

function ProductCta({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-1.5 font-nav-caps text-[10px] uppercase tracking-wider text-on-surface transition-colors hover:text-honey-amber"
    >
      <span>{label}</span>
      <Plus className="h-3 w-3" strokeWidth={1.5} />
    </Link>
  )
}

export default function EditorialFeedCard({ item }: { item: EditorialFeedItem }) {
  switch (item.type) {
    case 'product':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-light bg-surface-container-lowest transition-all duration-300">
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-surface-container-low">
            <EditorialPicture
              image={item.image}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {item.badge ? (
              <div
                className={
                  item.badge.position === 'right'
                    ? 'absolute right-2 top-2 border border-hairline-light bg-surface-container-lowest/90 px-2 py-1 font-label-spec text-[9px] uppercase tracking-wider text-on-surface'
                    : 'absolute left-2 top-2 bg-charcoal-pure px-2 py-1 font-nav-caps text-[9px] uppercase tracking-widest text-surface-container-lowest'
                }
              >
                {item.badge.text}
              </div>
            ) : null}
          </div>
          <div className="ed-card-body bg-surface-container-lowest">
            <div>
              <span className="ed-card-eyebrow font-editorial-caption text-[10px] uppercase tracking-wider text-on-surface-variant">
                {item.category}
              </span>
              <h3 className="ed-card-title font-headline-sm text-headline-sm font-normal leading-snug text-on-surface">
                {item.title}
              </h3>
              {item.subtitle ? (
                <span className="ed-card-desc block font-label-spec text-[10px] text-on-surface-variant">
                  {item.subtitle}
                </span>
              ) : null}
            </div>
            <div className="ed-card-footer">
              <span className="font-price-tag text-price-tag font-medium text-honey-amber">{item.price}</span>
              <ProductCta label={item.ctaLabel} href={item.href} />
            </div>
          </div>
        </article>
      )

    case 'product-dark':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-subtle/30 bg-charcoal-pure text-surface-container-lowest transition-all duration-300">
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-primary-container">
            <EditorialPicture
              image={item.image}
              className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {item.badge ? (
              <div className="absolute left-2 top-2 bg-honey-amber px-2 py-1 font-nav-caps text-[9px] font-semibold uppercase tracking-widest text-charcoal-pure">
                {item.badge}
              </div>
            ) : null}
          </div>
          <div className="ed-card-body ed-card-body--dark">
            <div>
              <span className="ed-card-eyebrow font-editorial-caption text-[10px] uppercase tracking-wider text-honey-amber">
                {item.category}
              </span>
              <h3 className="ed-card-title font-headline-sm text-headline-sm font-normal leading-snug text-surface-container-lowest">
                {item.title}
              </h3>
              <p className="ed-card-desc font-body-sm text-[12px] font-light text-surface-dim">{item.description}</p>
            </div>
            <div className="ed-card-footer ed-card-footer--dark">
              <span className="font-price-tag text-price-tag font-semibold text-honey-amber">{item.price}</span>
              <Link
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 font-nav-caps text-[10px] uppercase tracking-wider text-surface-container-lowest transition-colors hover:text-honey-amber"
              >
                <span>{item.ctaLabel}</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </article>
      )

    case 'atmosphere-square':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-light bg-surface-container-lowest">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-container">
            <EditorialPicture
              image={item.image}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-pure/60 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
            <div className="absolute bottom-3 left-3 right-3 text-surface-container-lowest">
              <span className="mb-1 block font-label-spec text-[9px] uppercase tracking-widest text-honey-amber">
                {item.overlayKicker}
              </span>
              <p className="font-headline-sm text-[15px] font-light leading-[1.35]">{item.overlayTitle}</p>
            </div>
          </div>
          <div className="ed-card-body ed-card-body--muted ed-card-caption-row !min-h-0 !flex-row">
            <span className="ed-caption-truncate font-editorial-caption text-[10px] uppercase tracking-wider text-on-surface-variant">
              {item.footerLeft}
            </span>
            <span className="shrink-0 font-label-spec text-[10px] text-hairline-subtle">{item.footerRight}</span>
          </div>
        </article>
      )

    case 'editorial-square':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-light bg-surface-container-lowest">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-container">
            <EditorialPicture
              image={item.image}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="ed-card-body bg-surface-container-lowest">
            <div className="flex flex-1 flex-col">
              <span className="ed-card-eyebrow font-label-spec text-[9px] uppercase tracking-widest text-honey-amber">
                {item.kicker}
              </span>
              <h4 className="ed-card-title font-headline-sm text-[15px] font-light text-on-surface">{item.title}</h4>
              {item.description ? (
                <p className="ed-card-desc line-clamp-3 font-body-sm text-[12px] font-light text-on-surface-variant">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      )

    case 'quote':
      return (
        <article className="ed-feed-card ed-quote-card border border-hairline-light bg-canvas-cream">
          <div className="space-y-space-md">
            <Quote className="h-6 w-6 text-honey-amber" strokeWidth={1.25} />
            <p className="font-headline-sm text-[16px] font-light italic leading-[1.55] text-on-surface">
              &ldquo;{item.quote}&rdquo;
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-hairline-light pt-4">
            <span className="font-nav-caps text-[10px] font-semibold uppercase tracking-widest text-on-surface">
              {item.author}
            </span>
            <span className="font-label-spec text-[10px] text-hairline-subtle">{item.note}</span>
          </div>
        </article>
      )

    case 'atmosphere-portrait':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-light bg-surface-container-lowest">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
            <EditorialPicture
              image={item.image}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-pure/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-surface-container-lowest">
              <span className="mb-1 block font-label-spec text-[9px] uppercase tracking-widest text-honey-amber">
                {item.kicker}
              </span>
              <h4 className="font-headline-sm text-[14px] font-light leading-[1.35]">{item.title}</h4>
              <p className="mt-1 font-editorial-caption text-[10px] leading-relaxed text-surface-dim">{item.meta}</p>
            </div>
          </div>
        </article>
      )

    case 'square-caption':
      return (
        <article className="ed-feed-card group relative overflow-hidden border border-hairline-light bg-surface-container-lowest">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-container">
            <EditorialPicture
              image={item.image}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="ed-card-body ed-card-body--muted ed-card-caption-row !min-h-0 !flex-row">
            <span className="ed-caption-truncate font-editorial-caption text-[10px] uppercase tracking-wider text-on-surface">
              {item.leftCaption}
            </span>
            <span className="shrink-0 font-label-spec text-[9px] font-medium uppercase text-honey-amber">
              {item.rightCaption}
            </span>
          </div>
        </article>
      )

    case 'feature-wide':
      return (
        <article className="ed-feed-card group relative col-span-2 flex flex-col justify-between border border-hairline-light bg-surface-container-low p-space-md md:col-span-1 lg:col-span-2">
          <div className="flex flex-col gap-space-md sm:flex-row sm:items-start sm:justify-between">
            <div className="ed-stack ed-min-w-0 max-w-xl flex-1">
              <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
                {item.eyebrow}
              </span>
              <h3 className="ed-card-title font-headline-md text-headline-md font-light text-on-surface">
                {item.title}
              </h3>
              <p className="font-body-sm text-body-sm font-light leading-[1.65] text-on-surface-variant">
                {item.description}
              </p>
            </div>
            <span className="shrink-0 font-price-tag text-[18px] font-semibold leading-none text-on-surface sm:pt-1">
              {item.price}
            </span>
          </div>
          <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm border-t border-hairline-light pt-4">
            <span className="font-label-spec text-label-spec uppercase leading-relaxed text-on-surface-variant">
              {item.stockNote}
            </span>
            <Link
              href={item.href}
              className="bg-primary px-space-md py-3 font-nav-caps text-nav-caps uppercase tracking-widest text-surface-container-lowest transition-colors hover:bg-primary-hover"
            >
              {item.ctaLabel}
            </Link>
          </div>
        </article>
      )

    default:
      return null
  }
}
