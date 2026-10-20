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
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      let data: { ok?: boolean; message?: string } | null = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!data || !res.ok || !data.ok) {
        setError(data?.message ?? 'Giriş başarısız.')
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
      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="email" className="ad-label" style={{ marginBottom: '8px' }}>
          E-mail Adresi
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@drsenol.shop"
          className="ad-input"
          style={{ fontSize: '16px', padding: '12px 14px' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="password" className="ad-label" style={{ marginBottom: '8px' }}>
          Şifre
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="ad-input"
            style={{ fontSize: '16px', padding: '12px 14px', paddingRight: '64px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--ad-fg-muted)',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            {showPassword ? 'Gizle' : 'Göster'}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            border: '1px solid var(--ad-danger)',
            backgroundColor: 'var(--ad-danger-faint)',
            color: 'var(--ad-danger)',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', letterSpacing: '0.1em', flexShrink: 0 }}>
            ✕
          </span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="ad-btn ad-btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '14px',
          minHeight: '46px',
        }}
      >
        {loading ? (
          <>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                border: '1.5px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'ad-pulse 1s linear infinite',
              }}
            />
            <span>Giriş Yapılıyor…</span>
          </>
        ) : (
          <>
            <span>Giriş Yap</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', opacity: 0.7 }}>→</span>
          </>
        )}
      </button>

      <div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--ad-line-faint)',
          fontSize: '12px',
          color: 'var(--ad-fg-faint)',
          lineHeight: 1.6,
        }}
      >
        Yalnızca yetkili hesaplar girebilir. Şifreyi unuttuysanız yöneticiye yazın.
      </div>
    </form>
  )
}
