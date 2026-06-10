'use client'

import { useState } from 'react'

export default function ResetForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Bir hata oluştu.')
        setLoading(false)
        return
      }
      setSent(true)
      setLoading(false)
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--color-gold)',
          backgroundColor: 'rgba(201,169,97,0.08)',
          color: '#E5DDC8',
          fontSize: '14px',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '10px' }}>
          ✓ Gönderildi
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--color-cream)' }}>{email}</strong> adresine sıfırlama linki gönderildi. Gelen kutunuzu kontrol edin (spam klasörünü de unutmayın).
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>E-posta</label>
        <input
          className="auth-input"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@eposta.com"
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
        disabled={loading || !email}
        className="auth-submit"
        style={{
          ...submitBtnStyle,
          opacity: loading || !email ? 0.5 : 1,
          cursor: loading || !email ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Gönderiliyor…' : 'Sıfırlama Linki Gönder'}
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
