'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setInfo(null)
    setAlreadyRegistered(false)

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
        setAlreadyRegistered(Boolean(data.already_registered))
        setLoading(false)
        return
      }

      if (data.needs_confirmation) {
        setInfo('E-posta adresinize bir doğrulama linki gönderildi. Hesabınızı onayladıktan sonra giriş yapabilirsiniz.')
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
      <Field label="Ad Soyad (isteğe bağlı)">
        <input
          className="auth-input"
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
          className="auth-input"
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
        <p style={hintStyle}>En az 8 karakter olmalı.</p>
      </Field>

      {error && (
        <div role="alert" style={errorBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-label-spec)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span style={{ flex: 1 }}>{error}</span>
        </div>
      )}

      {/* Already-registered için tek tuşla giriş'e geç */}
      {alreadyRegistered && (
        <Link
          href={`/giris?next=${encodeURIComponent(next)}`}
          className="auth-submit"
          style={{ ...altBtnStyle, marginBottom: '18px', textDecoration: 'none' }}
        >
          Giriş sayfasına git
          <span style={{ fontFamily: 'var(--font-label-spec)', opacity: 0.7 }}>→</span>
        </Link>
      )}

      {info && (
        <div role="status" style={infoBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-label-spec)', fontSize: '11px', flexShrink: 0, color: 'var(--color-honey-amber)' }}>✓</span>
          <span>{info}</span>
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
        {loading ? 'Hesap oluşturuluyor…' : 'Hesabımı oluştur'}
        {!loading && <span style={{ fontFamily: 'var(--font-label-spec)', opacity: 0.7 }}>→</span>}
      </button>

      <p style={{ fontSize: '11px', color: 'var(--color-outline)', lineHeight: 1.6, margin: '16px 0 0', textAlign: 'center' }}>
        Hesap oluşturarak{' '}
        <Link href="/uyelik-sozlesmesi" target="_blank" rel="noopener" className="auth-link" style={{ color: 'var(--color-on-surface-variant)', textDecoration: 'underline' }}>
          Üyelik Sözleşmesi
        </Link>{' '}
        ve{' '}
        <Link href="/gizlilik-politikasi" target="_blank" rel="noopener" className="auth-link" style={{ color: 'var(--color-on-surface-variant)', textDecoration: 'underline' }}>
          Gizlilik Politikası
        </Link>
        &apos;nı kabul etmiş olursunuz.
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
  fontFamily: 'var(--font-label-spec)',
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--color-on-surface-variant)',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  backgroundColor: 'var(--color-hairline-light)',
  border: '1px solid var(--color-hairline-light)',
  color: 'var(--color-on-surface)',
  fontFamily: 'var(--font-label-spec)',
  fontSize: '14px',
  letterSpacing: '0.02em',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const togglePwStyle: React.CSSProperties = {
  position: 'absolute',
  right: '6px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-on-surface-variant)',
  fontFamily: 'var(--font-label-spec)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '6px 8px',
  cursor: 'pointer',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-label-spec)',
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: 'var(--color-outline)',
  margin: '6px 0 0',
}

const errorBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid var(--color-error)',
  backgroundColor: 'rgba(209,123,106,0.08)',
  color: 'var(--color-error)',
  fontSize: '13px',
  marginBottom: '18px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
}

const infoBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid var(--color-honey-amber)',
  backgroundColor: 'var(--color-hairline-light)',
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
  backgroundColor: 'var(--color-charcoal-pure)',
  border: '1px solid var(--color-honey-amber)',
  color: 'var(--color-surface)',
  fontFamily: 'var(--font-label-spec)',
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

const altBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-honey-amber)',
  color: 'var(--color-honey-amber)',
  fontFamily: 'var(--font-label-spec)',
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
