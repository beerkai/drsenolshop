'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

const GROUPS: Array<{ title: string; items: Array<{ keys: string[]; label: string }> }> = [
  {
    title: 'Genel',
    items: [
      { keys: ['⌘', 'K'], label: 'Komut paleti aç/kapat' },
      { keys: ['?'], label: 'Bu yardım drawer\'ı' },
      { keys: ['esc'], label: 'Modal/drawer kapat' },
    ],
  },
  {
    title: 'Navigasyon',
    items: [
      { keys: ['⌘', '1'], label: 'Pano' },
      { keys: ['⌘', '2'], label: 'Siparişler' },
      { keys: ['⌘', '3'], label: 'Ürünler' },
      { keys: ['⌘', '4'], label: 'Müşteriler' },
      { keys: ['⌘', '5'], label: 'Analitik' },
      { keys: ['⌘', '6'], label: 'Stok' },
      { keys: ['⌘', '7'], label: 'Günlük' },
      { keys: ['⌘', ','], label: 'Ayarlar' },
    ],
  },
  {
    title: 'Komut paleti içinde',
    items: [
      { keys: ['↑', '↓'], label: 'Komutlar arası gez' },
      { keys: ['↵'], label: 'Seçili komutu çalıştır' },
      { keys: ['esc'], label: 'Paleti kapat' },
    ],
  },
]

export function HelpDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 9, 8, 0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 70,
          animation: 'ad-fadeup 0.18s ease-out both',
        }}
      />
      <aside
        role="dialog"
        aria-label="Yardım — Klavye kısayolları"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'var(--ad-surface)',
          borderLeft: '1px solid var(--ad-line)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.12)',
          zIndex: 75,
          overflowY: 'auto',
          animation: 'ad-fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--ad-line-faint)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--ad-surface)',
          }}
        >
          <div>
            <p className="ad-eyebrow" style={{ marginBottom: '6px' }}>Yardım</p>
            <h2 className="ad-display" style={{ fontSize: '22px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0 }}>
              Klavye Kısayolları
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="ad-icon-btn"
            style={{ fontSize: '12px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {GROUPS.map((g) => (
            <section key={g.title} style={{ marginBottom: '24px' }}>
              <p className="ad-eyebrow-muted" style={{ marginBottom: '10px' }}>{g.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {g.items.map((it) => (
                  <div
                    key={it.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--ad-line-faint)',
                    }}
                  >
                    <span style={{ color: 'var(--ad-fg)', fontSize: '13px' }}>{it.label}</span>
                    <span style={{ display: 'inline-flex', gap: '4px' }}>
                      {it.keys.map((k, i) => (
                        <span key={i} className="ad-kbd">{k}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--ad-fg-faint)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Mac'te <span className="ad-kbd">⌘</span> = Command. Windows / Linux'ta <span className="ad-kbd">Ctrl</span> kullan.
          </p>
        </div>
      </aside>
    </>
  )
}
