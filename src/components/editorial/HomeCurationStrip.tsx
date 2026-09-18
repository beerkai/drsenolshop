import { homeCurationStrip } from '@/lib/cms/home-page'

export default function HomeCurationStrip() {
  return (
    <section className="relative z-10 w-full border-y border-hairline-light bg-canvas-cream ed-section-y-sm">
      <div className="ed-section-inner flex flex-col gap-space-sm md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-space-md">
          <span className="font-label-spec text-label-spec font-semibold uppercase text-on-surface">
            {homeCurationStrip.harvestTitle}
          </span>
          <span className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
            {homeCurationStrip.harvestDetail}
          </span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-y-1 font-editorial-caption text-editorial-caption uppercase leading-relaxed text-on-surface-variant">
          {homeCurationStrip.highlights.map((item, index) => (
            <span key={item} className="inline-flex items-center gap-space-lg">
              {index > 0 ? (
                <span aria-hidden className="text-outline-variant">
                  •
                </span>
              ) : null}
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
