'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/login', {
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
    <form onSubmit={handleSubmit} noValidate>
      <Field label="E-posta">
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@eposta.com"
          style={inputStyle}
        />
      </Field>

      <Field label="Şifre">
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: '64px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            style={togglePwStyle}
          >
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>
      </Field>

      {error && (
        <div role="alert" style={errorBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        style={{
          ...submitBtnStyle,
          opacity: loading || !email || !password ? 0.5 : 1,
          cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        {!loading && <span style={{ fontFamily: 'var(--font-jetbrains)', opacity: 0.7 }}>→</span>}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#B8B0A0',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.15)',
  color: '#F4F0E8',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '14px',
  letterSpacing: '0.02em',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const togglePwStyle: React.CSSProperties = {
  position: 'absolute',
  right: '6px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: '#B8B0A0',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '6px 8px',
  cursor: 'pointer',
}

const errorBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid #D17B6A',
  backgroundColor: 'rgba(209,123,106,0.08)',
  color: '#D17B6A',
  fontSize: '13px',
  marginBottom: '18px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
}

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#C9A961',
  border: '1px solid #C9A961',
  color: '#0A0908',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '12px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  fontWeight: 500,
  minHeight: '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.2s',
}
