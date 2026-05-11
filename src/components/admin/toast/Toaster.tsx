'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeToast, type Toast } from './toast'

const TONE_STYLES: Record<Toast['tone'], { border: string; bg: string; fg: string; iconColor: string; icon: string }> = {
  success: {
    border: 'var(--ad-success)',
    bg: 'var(--ad-success-faint)',
    fg: 'var(--ad-fg)',
    iconColor: 'var(--ad-success)',
    icon: '✓',
  },
  error: {
    border: 'var(--ad-danger)',
    bg: 'var(--ad-danger-faint)',
    fg: 'var(--ad-fg)',
    iconColor: 'var(--ad-danger)',
    icon: '✕',
  },
  warning: {
    border: 'var(--ad-warning)',
    bg: 'var(--ad-warning-faint)',
    fg: 'var(--ad-fg)',
    iconColor: 'var(--ad-warning)',
    icon: '!',
  },
  info: {
    border: 'var(--ad-info)',
    bg: 'var(--ad-info-faint)',
    fg: 'var(--ad-fg)',
    iconColor: 'var(--ad-info)',
    icon: 'i',
  },
}

const MAX_TOASTS = 4

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts((prev) => {
        const next = [...prev, t]
        if (next.length > MAX_TOASTS) next.shift()
        return next
      })
      setTimeout(() => remove(t.id), t.duration)
    })
  }, [remove])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 100,
        maxWidth: 'calc(100vw - 40px)',
        width: '360px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        const s = TONE_STYLES[t.tone]
        return (
          <div
            key={t.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--ad-surface)',
              borderLeft: `3px solid ${s.border}`,
              borderTop: '1px solid var(--ad-line-faint)',
              borderRight: '1px solid var(--ad-line-faint)',
              borderBottom: '1px solid var(--ad-line-faint)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'ad-fadeup 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: s.bg,
                color: s.iconColor,
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '11px',
                fontWeight: 500,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {s.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <p style={{ margin: '0 0 2px', fontSize: '13px', color: s.fg, fontWeight: 500 }}>
                  {t.title}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '12.5px', color: s.fg, lineHeight: 1.5 }}>
                {t.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Bildirimi kapat"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ad-fg-faint)',
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '11px',
                padding: '2px 6px',
                marginTop: '-2px',
                marginRight: '-4px',
              }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
