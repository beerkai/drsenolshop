'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setInfo(null)

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName || null }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Kayıt başarısız.')
        setLoading(false)
        return
      }

      if (data.needs_confirmation) {
        setInfo('E-posta adresinize bir doğrulama linki gönderildi. Hesabınızı onayladıktan sonra giriş yapabilirsiniz.')
        setLoading(false)
        return
      }

      // Otomatik oturum açıldıysa hedefe git
      router.push(next)
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Ad Soyad (isteğe bağlı)">
        <input
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Adınız ve soyadınız"
          style={inputStyle}
        />
      </Field>

      <Field label="E-posta">
        <input
          type="email"
          required
          autoComplete="email"
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
            style={togglePwStyle}
          >
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>
        <p style={hintStyle}>En az 8 karakter olmalı.</p>
      </Field>

      {error && (
        <div role="alert" style={errorBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div role="status" style={infoBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0, color: '#C9A961' }}>✓</span>
          <span>{info}</span>
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
        {loading ? 'Hesap oluşturuluyor…' : 'Hesabımı oluştur'}
        {!loading && <span style={{ fontFamily: 'var(--font-jetbrains)', opacity: 0.7 }}>→</span>}
      </button>

      <p style={{ fontSize: '11px', color: '#6E665A', lineHeight: 1.6, margin: '16px 0 0', textAlign: 'center' }}>
        Hesap oluşturarak <a href="/sikca-sorulanlar" style={{ color: '#B8B0A0', textDecoration: 'underline' }}>kullanım koşullarını</a> kabul etmiş olursunuz.
      </p>
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

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: '#6E665A',
  margin: '6px 0 0',
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
