import type { EditorialFeedHeader, EditorialFeedItem } from '@/types/editorial-home'
import EditorialFeedCard from './EditorialFeedCard'

type Props = {
  header: EditorialFeedHeader
  items: EditorialFeedItem[]
}

export default function EditorialFeedSection({ header, items }: Props) {
  return (
    <section className="w-full ed-section-y">
      <div className="ed-section-inner">
        <div className="ed-section-head">
          <div className="ed-stack ed-min-w-0">
            <span className="block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
              {header.eyebrow}
            </span>
            <h2 className="font-headline-lg text-headline-lg font-light leading-[1.2] text-on-surface">
              {header.title}
            </h2>
          </div>
          <p className="ed-min-w-0 max-w-sm font-editorial-caption text-editorial-caption uppercase leading-relaxed tracking-[0.12em] text-on-surface-variant md:text-right">
            {header.aside}
          </p>
        </div>

        <div className="grid grid-cols-2 items-stretch gap-gutter md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <EditorialFeedCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
