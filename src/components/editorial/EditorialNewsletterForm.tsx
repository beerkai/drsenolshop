'use client'

import { useState } from 'react'
import type { EditorialNewsletterContent } from '@/types/editorial-home'

export default function EditorialNewsletterForm({ content }: { content: EditorialNewsletterContent }) {
  const [done, setDone] = useState(false)

  return (
    <div className="w-full min-w-0 max-w-md flex-1 lg:w-auto">
      {done ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">{content.disclaimer}</p>
      ) : (
        <form
          className="flex min-w-0 items-center gap-3 border-b border-on-surface pb-2"
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
        >
          <input
            type="email"
            required
            placeholder={content.placeholder}
            className="min-w-0 flex-1 bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="submit"
            className="whitespace-nowrap pl-4 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface transition-colors hover:text-honey-amber"
          >
            {content.submitLabel}
          </button>
        </form>
      )}
      {!done ? (
        <span className="mt-1.5 block font-editorial-caption text-[10px] text-hairline-subtle">
          {content.disclaimer}
        </span>
      ) : null}
    </div>
  )
}
