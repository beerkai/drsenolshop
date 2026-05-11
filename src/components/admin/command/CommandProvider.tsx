'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CommandPalette } from './CommandPalette'
import { HelpDrawer } from './HelpDrawer'

interface CommandContextValue {
  open: () => void
  close: () => void
  isOpen: boolean
}

const Ctx = createContext<CommandContextValue | null>(null)

export function useCommandPalette() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCommandPalette must be inside CommandProvider')
  return ctx
}

const NAV_SHORTCUTS: Record<string, string> = {
  '1': '/admin',
  '2': '/admin/siparisler',
  '3': '/admin/urunler',
  '4': '/admin/musteriler',
  '5': '/admin/analitik',
  '6': '/admin/stok',
  '7': '/admin/gunluk',
  '8': '/admin/defter',
  ',': '/admin/ayarlar',
}

/** Form input'larındayken global shortcut'ları yutmamak için kontrol */
function isTypingInForm(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const open = useCallback(() => setPaletteOpen(true), [])
  const close = useCallback(() => setPaletteOpen(false), [])

  // Global klavye dinleyici
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // ⌘K — paleti aç/kapat (her zaman çalışır, form içinde bile)
      if (isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }

      // Modal açıkken diğer shortcut'ları yutma — onların kendi handler'ları var
      if (paletteOpen || helpOpen) return

      // Form input'undayken global shortcut'ları çalıştırma
      if (isTypingInForm(e.target)) return

      // ? — yardım drawer
      if (e.key === '?' && !isMod) {
        e.preventDefault()
        setHelpOpen(true)
        return
      }

      // ⌘1-7 + ⌘, — navigasyon
      if (isMod) {
        const target = NAV_SHORTCUTS[e.key]
        if (target) {
          e.preventDefault()
          router.push(target)
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, paletteOpen, helpOpen])

  return (
    <Ctx.Provider value={{ open, close, isOpen: paletteOpen }}>
      {children}
      <CommandPalette
        open={paletteOpen}
        onClose={close}
        onHelpRequest={() => {
          setPaletteOpen(false)
          setHelpOpen(true)
        }}
      />
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </Ctx.Provider>
  )
}
