import { Link } from '@/i18n/navigation'
import type { EditorialJournalContent } from '@/types/editorial-home'
import EditorialPicture from './EditorialPicture'

export default function EditorialJournalSection({ content }: { content: EditorialJournalContent }) {
  return (
    <section className="w-full border-y border-hairline-light bg-surface-container-low ed-section-y">
      <div className="ed-section-inner">
        <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
          <div className="relative pb-6 lg:col-span-6 lg:pb-8">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container">
              <EditorialPicture
                image={content.image}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 hidden max-w-[17rem] border border-hairline-light bg-surface-container-lowest p-5 sm:block">
              <span className="block font-label-spec text-[10px] uppercase leading-relaxed text-honey-amber">
                {content.certificate.title}
              </span>
              <p className="mt-2 font-editorial-caption text-[11px] leading-[1.55] text-on-surface-variant">
                {content.certificate.body}
              </p>
            </div>
          </div>

          <div className="ed-stack-lg ed-min-w-0 lg:col-span-6 lg:pl-space-lg">
            <div className="flex flex-wrap items-center gap-space-sm text-hairline-subtle">
              <span className="font-label-spec text-label-spec uppercase tracking-widest">
                {content.breadcrumb[0]}
              </span>
              <span>/</span>
              <span className="font-label-spec text-label-spec uppercase tracking-widest">
                {content.breadcrumb[1]}
              </span>
            </div>

            <h2 className="max-w-xl font-display-hero text-headline-lg font-light text-on-surface lg:text-[44px] lg:leading-[52px]">
              {content.title}
            </h2>

            <div className="ed-journal-prose ed-prose ed-min-w-0 max-w-xl font-body-lg font-light text-on-surface-variant">
              {content.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>

            <div className="grid max-w-lg grid-cols-3 gap-space-sm border-t border-hairline-light pt-space-sm">
              {content.metrics.map((m) => (
                <div key={m.label} className="ed-min-w-0 space-y-1.5">
                  <span
                    className={
                      m.accent
                        ? 'font-price-tag block text-[20px] font-light leading-none text-honey-amber'
                        : 'font-price-tag block text-[20px] font-light leading-none text-on-surface'
                    }
                  >
                    {m.value}
                  </span>
                  <span className="block font-editorial-caption text-[10px] uppercase leading-snug tracking-wider text-on-surface-variant">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-space-md pt-space-md">
              <Link
                href={content.primaryCta.href}
                className="border border-on-surface px-6 py-3 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface transition-all duration-300 hover:bg-on-surface hover:text-surface-container-lowest"
              >
                {content.primaryCta.label}
              </Link>
              <Link
                href={content.secondaryCta.href}
                className="font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface-variant underline decoration-hairline-subtle underline-offset-4 transition-colors hover:text-honey-amber"
              >
                {content.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
