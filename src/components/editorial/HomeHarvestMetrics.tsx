import type { HomeHarvestMetricCell } from '@/types/editorial-home'

export default function HomeHarvestMetrics({ cells }: { cells: HomeHarvestMetricCell[] }) {
  return (
    <section className="w-full border-b border-hairline-light bg-surface lg:hidden">
      <div className="grid grid-cols-2 divide-x divide-hairline-light">
        {cells.map((cell, index) => (
          <div
            key={cell.label}
            className={`flex flex-col justify-between gap-2 p-5 ${index < 2 ? 'border-b border-hairline-light' : ''}`}
          >
            <span className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
              {cell.label}
            </span>
            <span className="font-headline-sm text-headline-sm font-light tracking-tight text-on-surface">
              {cell.value}
              {cell.label === 'HMF Değeri' ? (
                <span className="font-label-spec text-label-spec text-on-surface-variant"> mg / kg</span>
              ) : null}
            </span>
            <span
              className={
                cell.detailAccent
                  ? 'font-label-spec text-label-spec text-honey-amber'
                  : 'font-label-spec text-label-spec text-on-surface-variant'
              }
            >
              {cell.detail}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
