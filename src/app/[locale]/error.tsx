'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error.message, error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-margin py-16 text-on-surface">
      <div className="max-w-lg text-center">
        <p className="font-label-spec text-label-spec uppercase tracking-[0.2em] text-honey-amber">
          Beklenmedik bir sorun
        </p>
        <h1 className="mt-4 font-display-hero text-display-hero-mobile font-light tracking-tight">
          Bir şeyler{' '}
          <span className="text-honey-amber">ters gitti.</span>
        </h1>
        <p className="mt-4 font-body-md text-body-md font-light text-on-surface-variant">
          Sayfa yüklenirken hata oluştu. Dev sunucusunu yeniden başlatmayı deneyin; sorun sürerse bize yazın.
        </p>

        {error.message ? (
          <p className="mt-4 font-label-spec text-[10px] text-hairline-subtle">{error.message}</p>
        ) : null}

        {error.digest ? (
          <p className="mt-2 font-label-spec text-[10px] text-hairline-subtle">ref: {error.digest}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-12 bg-primary px-6 font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-surface-container-lowest transition-colors hover:bg-primary-hover"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center border border-hairline-light px-6 font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-on-surface transition-colors hover:border-on-surface"
          >
            Anasayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
