'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_COMMANDS, filterCommands, type AdminCommand } from './commands'
import { IconSearch } from '../ui/Icon'

interface Props {
  open: boolean
  onClose: () => void
  onHelpRequest: () => void
}

export function CommandPalette({ open, onClose, onHelpRequest }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)

  // Açıldığında input focus + reset
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  const filtered = useMemo(() => filterCommands(query), [query])

  // Aktif item filtre sonucu değişince hep ilk satır
  useEffect(() => { setActiveIdx(0) }, [query])

  // Aktif item scroll into view
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  function execute(cmd: AdminCommand) {
    onClose()
    switch (cmd.action.type) {
      case 'navigate':
        router.push(cmd.action.href)
        break
      case 'logout':
        fetch('/api/admin/logout', { method: 'POST' }).then(() => {
          router.push('/admin/giris')
          router.refresh()
        })
        break
      case 'help':
        onHelpRequest()
        break
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIdx]
      if (cmd) execute(cmd)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!open) return null

  // Section'lara grupla
  const sections: Record<string, AdminCommand[]> = {}
  for (const cmd of filtered) {
    sections[cmd.section] ??= []
    sections[cmd.section].push(cmd)
  }
  const sectionOrder: AdminCommand['section'][] = ['Sayfalar', 'Hızlı Filtreler', 'Yardım', 'Hesap']

  // Flat index → cmd map (klavye nav için)
  const flatIndex = new Map<AdminCommand, number>()
  let idx = 0
  for (const sec of sectionOrder) {
    for (const cmd of sections[sec] ?? []) {
      flatIndex.set(cmd, idx++)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 9, 8, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 80,
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Komut paleti"
        style={{
          position: 'fixed',
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '640px',
          backgroundColor: 'var(--ad-surface)',
          border: '1px solid var(--ad-line)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          zIndex: 90,
          animation: 'ad-fadeup 0.18s ease-out both',
          maxHeight: '72vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onKeyDown={handleKey}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: '1px solid var(--ad-line-faint)' }}>
          <IconSearch size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sayfa, eylem veya filtre ara…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '15px',
              color: 'var(--ad-fg)',
            }}
            spellCheck={false}
          />
          <span className="ad-kbd">esc</span>
        </div>

        {/* Sonuç listesi */}
        <div ref={listRef} style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ad-fg-faint)', fontSize: '13px' }}>
              Eşleşen komut yok.
            </div>
          ) : (
            sectionOrder.map((sec) => {
              const list = sections[sec]
              if (!list || list.length === 0) return null
              return (
                <div key={sec}>
                  <p
                    style={{
                      padding: '8px 18px 4px',
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontSize: '9.5px',
                      letterSpacing: '0.22em',
                      color: 'var(--ad-fg-faint)',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {sec}
                  </p>
                  {list.map((cmd) => {
                    const i = flatIndex.get(cmd) ?? 0
                    const isActive = i === activeIdx
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        data-cmd-idx={i}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setActiveIdx(i)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          padding: '10px 18px',
                          background: isActive ? 'var(--ad-gold-faint)' : 'transparent',
                          border: 'none',
                          borderLeft: isActive ? '2px solid var(--ad-gold)' : '2px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'var(--ad-fg)',
                          fontFamily: 'var(--font-inter), sans-serif',
                          fontSize: '13px',
                          gap: '12px',
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', color: 'var(--ad-fg)' }}>{cmd.label}</span>
                          {cmd.description && (
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--ad-fg-faint)', marginTop: '2px' }}>
                              {cmd.description}
                            </span>
                          )}
                        </span>
                        {cmd.shortcut && <span className="ad-kbd">{cmd.shortcut}</span>}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--ad-line-faint)',
            backgroundColor: 'var(--ad-surface-2)',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'var(--ad-fg-faint)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span><span className="ad-kbd">↑</span> <span className="ad-kbd">↓</span> gez</span>
            <span><span className="ad-kbd">↵</span> seç</span>
            <span><span className="ad-kbd">?</span> yardım</span>
          </span>
          <span>{filtered.length} eşleşme · ⌘K toggle</span>
        </div>
      </div>
    </>
  )
}
