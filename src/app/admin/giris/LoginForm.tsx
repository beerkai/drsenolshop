'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#F4F0E8',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains)',
  fontSize: '10px',
  letterSpacing: '0.22em',
  color: '#6E665A',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Giriş başarısız.')
        setLoading(false)
        return
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={LABEL_STYLE} htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={INPUT_STYLE}
          placeholder="admin@drsenol.shop"
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={LABEL_STYLE} htmlFor="password">Şifre</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={INPUT_STYLE}
        />
      </div>

      {error && (
        <div style={{ padding: '12px 14px', border: '1px solid #C8472D', backgroundColor: 'rgba(200,71,45,0.08)', color: '#F4F0E8', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: loading ? '#9C7C3C' : '#C9A961',
          color: '#0A0908',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '11px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Giriş Yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
