import Link from 'next/link'

export interface WorkQueueRow {
  key: string
  href: string
  title: string
  meta: string
  aside: string
}

export function WorkQueue({
  title,
  hint,
  href,
  empty,
  rows,
}: {
  title: string
  hint: string
  href: string
  empty: string
  rows: WorkQueueRow[]
}) {
  return (
    <section className="ad-card ad-queue">
      <div className="ad-queue-head">
        <div>
          <h2 className="ad-queue-title">{title}</h2>
          <p className="ad-queue-hint">{hint}</p>
        </div>
        <Link href={href} className="ad-queue-all">Tümü</Link>
      </div>
      {rows.length === 0 ? (
        <p className="ad-queue-empty">{empty}</p>
      ) : (
        <ul className="ad-queue-list">
          {rows.map((row) => (
            <li key={row.key}>
              <Link href={row.href} className="ad-queue-row">
                <span className="ad-queue-main">
                  <span className="ad-queue-name">{row.title}</span>
                  <span className="ad-queue-meta">{row.meta}</span>
                </span>
                <span className="ad-queue-aside">{row.aside}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
