'use client'

import { useEffect, useState } from 'react'

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
    <div className="pn-pwa-install" role="region" aria-label="Uygulama yükle">
      <div className="pn-pwa-install-inner">
        <div>
          <p className="pn-eyebrow" style={{ margin: '0 0 4px', fontSize: '9px' }} lang="en">
            Install
          </p>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: 'var(--ad-fg)' }}>
            Admin panelini ana ekrana ekleyin — tam ekran, hızlı erişim.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button type="button" className="pn-btn pn-btn-secondary pn-btn-sm" onClick={() => setDismissed(true)}>
            Sonra
          </button>
          <button type="button" className="pn-btn pn-btn-primary pn-btn-sm" onClick={() => void install()}>
            Yükle
          </button>
        </div>
      </div>
    </div>
  )
}
