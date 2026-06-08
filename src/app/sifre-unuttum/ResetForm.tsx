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
          border: '1px solid #C9A961',
          backgroundColor: 'rgba(201,169,97,0.08)',
          color: '#E5DDC8',
          fontSize: '14px',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '10px' }}>
          ✓ Gönderildi
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#F4F0E8' }}>{email}</strong> adresine sıfırlama linki gönderildi. Gelen kutunuzu kontrol edin (spam klasörünü de unutmayın).
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
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0 }}>✕</span>
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
        {!loading && <span style={{ fontFamily: 'var(--font-jetbrains)', opacity: 0.7 }}>→</span>}
      </button>
    </form>
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
  color: '#15110D',
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
}
