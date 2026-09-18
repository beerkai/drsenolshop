import type { HomeValueCell } from '@/types/editorial-home'

export default function HomeValuesTicker({ values }: { values: HomeValueCell[] }) {
  return (
    <section className="w-full border-b border-hairline-light bg-surface-container-lowest py-space-md">
      <div className="ed-section-inner grid grid-cols-2 gap-space-md text-center md:grid-cols-4">
        {values.map((cell, index) => (
          <div
            key={cell.label}
            className={`ed-min-w-0 space-y-1.5 px-2 py-3 md:px-4 md:py-4 ${index % 2 === 1 ? 'border-l border-hairline-light' : ''} ${index > 0 ? 'md:border-l md:border-hairline-light' : ''}`}
          >
            <span className="block font-label-spec text-label-spec uppercase leading-relaxed text-honey-amber">
              {cell.label}
            </span>
            <span className="block font-body-sm text-body-sm font-light leading-[1.5] text-on-surface">{cell.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
