'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/auth/customer/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '11px 18px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(209,123,106,0.4)',
        color: 'var(--color-alert-soft)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? 'Çıkış…' : 'Çıkış Yap'}
    </button>
  )
}
