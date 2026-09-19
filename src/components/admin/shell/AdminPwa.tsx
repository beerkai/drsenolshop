'use client'

import { useEffect, useState } from 'react'

const SW_URL = '/admin-sw.js'
const SW_SCOPE = '/admin'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function AdminPwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(display-mode: standalone)')
    setStandalone(mq.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

    const onChange = () => setStandalone(mq.matches)
    mq.addEventListener('change', onChange)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch((err) => {
        console.warn('[AdminPwa] SW kaydı başarısız:', err)
      })
    }

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)

    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('beforeinstallprompt', onBip)
    }
  }, [])

  if (standalone || dismissed || !deferred) return null

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="ad-pwa-install" role="region" aria-label="Uygulama yükle">
      <div className="ad-pwa-install-inner">
        <div>
          <p className="ad-eyebrow" style={{ margin: '0 0 4px', fontSize: '9px' }} lang="en">
            Install
          </p>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: 'var(--ad-fg)' }}>
            Admin panelini ana ekrana ekleyin — tam ekran, hızlı erişim.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onClick={() => setDismissed(true)}>
            Sonra
          </button>
          <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => void install()}>
            Yükle
          </button>
        </div>
      </div>
    </div>
  )
}
