import { Link } from '@/i18n/navigation'

interface Props {
  title: string
  message: string
  actionHref?: string
  actionLabel?: string
}

export default function HomeCuratedEmptyState({ title, message, actionHref, actionLabel }: Props) {
  return (
    <div className="border border-dashed border-hairline-light bg-surface-container-low px-space-lg py-space-xl text-center">
      <p className="mb-space-sm font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-on-surface-variant">
        {title}
      </p>
      <p className="mx-auto max-w-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-space-md inline-block font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface transition-colors hover:text-honey-amber"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  )
}
