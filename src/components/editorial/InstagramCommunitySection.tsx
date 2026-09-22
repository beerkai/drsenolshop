import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { InstagramFeedPost } from '@/lib/instagram/feed'
import type { InstagramCommunityContent, InstagramTile } from '@/types/editorial-home'
import EditorialNewsletterForm from './EditorialNewsletterForm'
import EditorialPicture from './EditorialPicture'

type TileView = InstagramTile & { live?: boolean }

export default function InstagramCommunitySection({
  content,
  posts = [],
}: {
  content: InstagramCommunityContent
  posts?: InstagramFeedPost[]
}) {
  const tiles: TileView[] = posts.length
    ? posts.map((post) => ({
        id: post.id,
        href: post.href,
        hoverLabel: 'Görüntüle',
        live: true,
        image: { src: post.imageUrl, alt: post.alt },
      }))
    : content.tiles
  return (
    <section className="w-full border-b border-hairline-light bg-surface ed-section-y">
      <div className="ed-section-inner">
        <div className="mb-space-lg flex flex-col gap-space-md md:flex-row md:items-center md:justify-between">
          <div className="ed-stack ed-min-w-0">
            <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface-variant">
              {content.eyebrow}
            </span>
            <h3 className="font-headline-md text-headline-md font-light leading-[1.25] text-on-surface">
              {content.title}
            </h3>
          </div>
          <Link
            href={content.followLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface transition-colors hover:text-honey-amber"
          >
            <span>{content.followLink.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => {
            const frame = (
              <>
                {tile.live ? (
                  <img
                    src={tile.image.src}
                    alt={tile.image.alt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <EditorialPicture
                    image={tile.image}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal-pure/40 px-2 text-center text-surface-container-lowest opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="font-label-spec text-[10px] uppercase tracking-widest">{tile.hoverLabel}</span>
                </div>
              </>
            )

            const className = 'group relative aspect-square overflow-hidden bg-surface-container'
            if (!tile.href) {
              return (
                <div key={tile.id} className={className}>
                  {frame}
                </div>
              )
            }

            return (
              <a
                key={tile.id}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {frame}
              </a>
            )
          })}
        </div>

        <div className="mt-space-xl flex flex-col items-stretch justify-between gap-space-lg border border-hairline-light bg-surface-container-low p-space-lg lg:flex-row lg:items-center">
          <div className="ed-stack ed-min-w-0 max-w-xl flex-1">
            <span className="block font-label-spec text-label-spec uppercase leading-relaxed tracking-widest text-honey-amber">
              {content.newsletter.eyebrow}
            </span>
            <h4 className="font-headline-sm text-headline-sm font-light text-on-surface">
              {content.newsletter.title}
            </h4>
            <p className="font-body-sm text-body-sm font-light leading-[1.65] text-on-surface-variant">
              {content.newsletter.description}
            </p>
          </div>
          <EditorialNewsletterForm content={content.newsletter} />
        </div>
      </div>
    </section>
  )
}
