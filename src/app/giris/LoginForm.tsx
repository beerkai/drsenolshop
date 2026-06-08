'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setNeedsConfirmation(false)
    setResendSent(false)
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
        setNeedsConfirmation(Boolean(data.needs_confirmation))
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

  async function handleResend() {
    if (resending || !email) return
    setResending(true)
    setResendSent(false)
    try {
      const res = await fetch('/api/auth/customer/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setResendSent(true)
      } else {
        setError(data.message ?? 'Onay e-postası gönderilemedi.')
      }
    } catch {
      setError('Sunucuya bağlanılamadı.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="E-posta">
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
      </Field>

      <Field label="Şifre">
        <div style={{ position: 'relative' }}>
          <input
            className="auth-input"
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
            className="auth-input-toggle"
            style={togglePwStyle}
          >
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>
      </Field>

      {error && (
        <div role="alert" style={errorBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span style={{ flex: 1 }}>{error}</span>
        </div>
      )}

      {needsConfirmation && !resendSent && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="auth-submit"
          style={{ ...altBtnStyle, marginBottom: '18px', opacity: resending ? 0.6 : 1 }}
        >
          {resending ? 'Gönderiliyor…' : 'Onay e-postasını tekrar gönder'}
        </button>
      )}

      {resendSent && (
        <div role="status" style={infoBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0, color: '#C9A961' }}>✓</span>
          <span><strong style={{ color: '#F4F0E8' }}>{email}</strong> adresine yeni onay linki gönderildi. Gelen kutunuzu kontrol edin.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="auth-submit"
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

const altBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: 'transparent',
  border: '1px solid #C9A961',
  color: '#C9A961',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '12px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 500,
  minHeight: '46px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const infoBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid #C9A961',
  backgroundColor: 'rgba(201,169,97,0.08)',
  color: '#E5DDC8',
  fontSize: '13px',
  lineHeight: 1.6,
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
  transition: 'all 0.2s',
}
