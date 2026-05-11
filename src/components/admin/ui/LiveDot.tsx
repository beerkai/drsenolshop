'use client'

import { useEffect, useState } from 'react'

type State = 'live' | 'idle' | 'offline'

interface Props {
  /** "live" = kırmızı pulse; "idle" = yeşil sabit; "offline" = gri sabit */
  state?: State
  label?: string
}

const STATE_LABEL: Record<State, string> = {
  live: 'CANLI',
  idle: 'BAĞLI',
  offline: 'ÇEVRİMDIŞI',
}

const STATE_COLOR: Record<State, string> = {
  live: '#DC2626',
  idle: '#4F7A2A',
  offline: '#9B9285',
}

export function LiveDot({ state = 'idle', label }: Props) {
  const text = label ?? STATE_LABEL[state]
  const dotClass = ['ad-live-dot', state === 'idle' && 'is-idle', state === 'offline' && 'is-offline']
    .filter(Boolean)
    .join(' ')

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span className={dotClass} aria-hidden />
      <span
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: STATE_COLOR[state],
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </span>
  )
}

/** Bağlantı durumunu otomatik takip eden wrapper — pencere visibility/online event'lerini dinler */
export function AutoLiveDot() {
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    const onOnline = () => setState('idle')
    const onOffline = () => setState('offline')
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    if (!navigator.onLine) setState('offline')
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Periyodik kısa "canlı" pulse — her 25s'de 3s kırmızıya döner (yaşam belirtisi)
  useEffect(() => {
    if (state === 'offline') return
    const id = setInterval(() => {
      setState('live')
      setTimeout(() => setState((s) => (s === 'live' ? 'idle' : s)), 2500)
    }, 25_000)
    return () => clearInterval(id)
  }, [state])

  return <LiveDot state={state} />
}
