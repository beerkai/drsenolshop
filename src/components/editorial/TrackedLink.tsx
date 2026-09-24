'use client'

import { Link } from '@/i18n/navigation'
import type { ReactNode } from 'react'
import { trackEvent, type AnalyticsEventProps } from '@/lib/analytics-events'

interface TrackedLinkProps {
  href: string
  eventName: string
  eventProps?: AnalyticsEventProps
  className?: string
  lang?: string
  children: ReactNode
}

export default function TrackedLink({
  href,
  eventName,
  eventProps,
  className,
  lang,
  children,
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      lang={lang}
      onClick={() => trackEvent(eventName, eventProps)}
    >
      {children}
    </Link>
  )
}
