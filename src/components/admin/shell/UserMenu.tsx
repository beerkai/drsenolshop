'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconLogout } from '../ui/Icon'

interface Props {
  email: string
  fullName: string | null
  role: string
}

export function UserMenu({ email, fullName, role }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/giris')
    router.refresh()
  }

  const initials = (fullName ?? email).split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const displayName = fullName ?? email

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '5px 10px 5px 5px',
          background: 'transparent',
          border: '1px solid var(--ad-line-faint)',
          cursor: 'pointer',
          transition: 'border-color 120ms',
        }}
      >
        <span
          style={{
            width: '26px',
            height: '26px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--ad-gold)',
            color: '#0A0908',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          {initials}
        </span>
        <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '12px', color: 'var(--ad-fg)' }}>
          {displayName.length > 16 ? displayName.slice(0, 16) + '…' : displayName}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: '220px',
            backgroundColor: 'var(--ad-surface)',
            border: '1px solid var(--ad-line)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            zIndex: 50,
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ad-line-faint)' }}>
            <p style={{ fontSize: '13px', color: 'var(--ad-fg)', margin: 0, fontWeight: 500 }}>
              {fullName ?? 'Yönetici'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--ad-fg-faint)', margin: '2px 0 0' }}>{email}</p>
            <p
              style={{
                marginTop: '6px',
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '9px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ad-gold-deep)',
              }}
            >
              {role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              color: 'var(--ad-fg-muted)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '13px',
              textAlign: 'left',
              transition: 'background-color 120ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ad-surface-2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <IconLogout size={14} />
            {loading ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
          </button>
        </div>
      )}
    </div>
  )
}
