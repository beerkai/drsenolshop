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
    <section className="pn-card pn-queue">
      <div className="pn-queue-head">
        <div>
          <h2 className="pn-queue-title">{title}</h2>
          <p className="pn-queue-hint">{hint}</p>
        </div>
        <Link href={href} className="pn-queue-all">Tümü</Link>
      </div>
      {rows.length === 0 ? (
        <p className="pn-queue-empty">{empty}</p>
      ) : (
        <ul className="pn-queue-list">
          {rows.map((row) => (
            <li key={row.key}>
              <Link href={row.href} className="pn-queue-row">
                <span className="pn-queue-main">
                  <span className="pn-queue-name">{row.title}</span>
                  <span className="pn-queue-meta">{row.meta}</span>
                </span>
                <span className="pn-queue-aside">{row.aside}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
