'use client'

import { useEffect, useRef, useState } from 'react'

interface PageCount {
  label: string
  count: number
}

interface Snapshot {
  ready: boolean
  count: number
  pages: PageCount[]
  windowSec: number
}

type Listener = (snap: Snapshot) => void

let latest: Snapshot | null = null
let timer: ReturnType<typeof setInterval> | null = null
let inflight = false
const listeners = new Set<Listener>()

async function pull(): Promise<void> {
  if (inflight) return
  inflight = true
  try {
    const res = await fetch('/api/admin/site-pulse', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json() as Partial<Snapshot> & { ok?: boolean }
    if (!data.ok) return
    latest = {
      ready: Boolean(data.ready),
      count: typeof data.count === 'number' ? data.count : 0,
      pages: Array.isArray(data.pages)
        ? data.pages.filter((page): page is PageCount =>
          Boolean(page) && typeof page.label === 'string' && typeof page.count === 'number')
        : [],
      windowSec: typeof data.windowSec === 'number' ? data.windowSec : 90,
    }
    listeners.forEach((listener) => listener(latest as Snapshot))
  } catch {
    // Sayaç paneli kırmasın
  } finally {
    inflight = false
  }
}

function useSitePulse(): Snapshot | null {
  const [snap, setSnap] = useState<Snapshot | null>(latest)

  useEffect(() => {
    listeners.add(setSnap)
    if (latest) setSnap(latest)
    if (!timer) {
      void pull()
      timer = setInterval(() => {
        if (document.visibilityState === 'hidden') return
        void pull()
      }, 20_000)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pull()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      listeners.delete(setSnap)
      document.removeEventListener('visibilitychange', onVisible)
      if (listeners.size === 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }, [])

  return snap
}

function summary(snap: Snapshot | null): string {
  if (!snap) return '…'
  if (!snap.ready) return '—'
  return `${snap.count} kişi`
}

export function LiveVisitors({ variant = 'compact' }: { variant?: 'compact' | 'card' }) {
  const snap = useSitePulse()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (variant === 'card') {
    const ready = snap?.ready === true
    return (
      <section className="pn-card pn-card-sm pn-live-card" aria-live="polite">
        <div>
          <p className="pn-metric-label">Şu an sitede</p>
          <p className="pn-metric-value">{ready ? snap.count : snap ? '—' : '…'}</p>
          <p className="pn-live-card-hint">
            {ready
              ? snap.count === 0
                ? 'Şu an sitede kimse yok.'
                : `Son ${snap.windowSec} saniye · sayfası açık olanlar`
              : snap
                ? 'Ziyaretçi sayacı şu an okunamadı.'
                : 'Sayaç yükleniyor'}
          </p>
        </div>
        {ready && snap.pages.length > 0 && (
          <ul className="pn-live-pages">
            {snap.pages.map((page) => (
              <li key={page.label}>
                <span>{page.label}</span>
                <span>{page.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  const label = summary(snap)
  const detail = snap?.ready
    ? snap.pages.map((page) => `${page.label} ${page.count}`).join(', ')
    : ''

  return (
    <div className="pn-live-count-wrap" ref={wrapRef}>
      <button
        type="button"
        className="pn-live-count"
        aria-expanded={open}
        aria-label={snap?.ready ? `Şu an sitede ${snap.count} kişi` : 'Ziyaretçi sayacı'}
        title={detail ? `Şu an sitede. ${detail}` : 'Şu an sitede'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="pn-live-dot is-idle" aria-hidden />
        <span>{label}</span>
      </button>
      {open && (
        <div className="pn-live-pop" role="dialog" aria-label="Canlı ziyaretçiler">
          <span className="pn-live-pop-kicker">Şu an sitede</span>
          <span className="pn-live-pop-count">{snap?.ready ? snap.count : '—'}</span>
          {snap?.ready && snap.pages.length > 0 && (
            <ul className="pn-live-pages">
              {snap.pages.map((page) => (
                <li key={page.label}>
                  <span>{page.label}</span>
                  <span>{page.count}</span>
                </li>
              ))}
            </ul>
          )}
          <span className="pn-live-pop-hint">
            {snap?.ready
              ? 'Son 90 saniye. Admin paneli sayılmaz.'
              : 'Sayaç şu an okunamadı.'}
          </span>
        </div>
      )}
    </div>
  )
}
