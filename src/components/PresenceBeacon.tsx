'use client'

// Mağaza sekmesi açıkken rastgele bir kimlikle nabız bırakır.
// Kimlik tarayıcıda kalır, sunucuda yalnız son 10 dakika tutulur.
// Admin sayfalarında bu bileşen yok.

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const STORAGE_KEY = 'ds-visit'
const INTERVAL_MS = 25_000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

let memoryId = ''

/** Aynı tarayıcıdaki sekmeler tek kişi sayılsın diye localStorage. */
function sessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing && UUID.test(existing)) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    if (!memoryId) memoryId = crypto.randomUUID()
    return memoryId
  }
}

export default function PresenceBeacon() {
  const pathname = usePathname()

  useEffect(() => {
    if (navigator.webdriver) return
    const id = sessionId()
    if (!id) return

    const send = () => {
      if (document.visibilityState === 'hidden') return
      const path = window.location.pathname.slice(0, 80)
      fetch('/api/site-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, path }),
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {})
    }

    send()
    const timer = window.setInterval(send, INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') send()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pathname])

  return null
}
