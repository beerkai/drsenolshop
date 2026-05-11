'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/giris')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={{
        fontFamily: 'var(--font-jetbrains)',
        fontSize: '10px',
        letterSpacing: '0.22em',
        color: '#6E665A',
        textTransform: 'uppercase',
        background: 'transparent',
        border: '1px solid rgba(244,240,232,0.12)',
        padding: '8px 14px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {loading ? '…' : 'Çıkış'}
    </button>
  )
}
