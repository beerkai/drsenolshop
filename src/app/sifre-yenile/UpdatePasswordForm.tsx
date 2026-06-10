'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.')
      return
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Bir hata oluştu.')
        setLoading(false)
        return
      }
      router.push('/hesabim')
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Yeni şifre</label>
        <div style={{ position: 'relative' }}>
          <input
            className="auth-input"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="En az 8 karakter"
            minLength={8}
            style={{ ...inputStyle, paddingRight: '64px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            className="auth-input-toggle"
            style={togglePwStyle}
          >
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Şifreyi tekrar girin</label>
        <input
          className="auth-input"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          minLength={8}
          style={inputStyle}
        />
      </div>

      {error && (
        <div role="alert" style={errorBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="auth-submit"
        style={{
          ...submitBtnStyle,
          opacity: loading || !password || !confirm ? 0.5 : 1,
          cursor: loading || !password || !confirm ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Kaydediliyor…' : 'Şifreyi güncelle'}
        {!loading && <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>→</span>}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--color-cream-muted)',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.15)',
  color: 'var(--color-cream)',
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  letterSpacing: '0.02em',
  outline: 'none',
}

const togglePwStyle: React.CSSProperties = {
  position: 'absolute',
  right: '6px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-cream-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '6px 8px',
  cursor: 'pointer',
}

const errorBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid var(--color-alert-soft)',
  backgroundColor: 'rgba(209,123,106,0.08)',
  color: 'var(--color-alert-soft)',
  fontSize: '13px',
  marginBottom: '18px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
}

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: 'var(--color-gold)',
  border: '1px solid var(--color-gold)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  fontWeight: 500,
  minHeight: '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
}
