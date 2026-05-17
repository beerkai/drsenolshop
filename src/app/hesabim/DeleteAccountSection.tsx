'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CONFIRM_TEXT = 'HESABIMI SİL'

export default function DeleteAccountSection() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setPassword('')
    setConfirm('')
    setError(null)
    setLoading(false)
  }

  function close() {
    if (loading) return
    setOpen(false)
    reset()
  }

  async function handleDelete() {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/customer/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirm }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Hesap silinemedi.')
        setLoading(false)
        return
      }
      // Başarılı — anasayfaya yönlendir
      router.push('/?account_deleted=1')
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <div style={{ padding: 'clamp(20px, 4vw, 28px)', border: '1px solid rgba(209,123,106,0.25)', backgroundColor: 'rgba(209,123,106,0.04)' }}>
        <h3 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, margin: '0 0 8px' }}>
          Hesabımı sil
        </h3>
        <p style={{ color: '#B8B0A0', fontSize: '13px', lineHeight: 1.7, margin: '0 0 18px' }}>
          Hesabınızı silmek geri alınamaz. Önceki siparişleriniz <strong>10 yıl boyunca</strong> yasal yükümlülük gereği
          saklanır ancak kişisel bilgileriniz <strong>anonimleştirilir</strong>. Bülten aboneliğiniz iptal edilir.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={dangerBtn}
        >
          Hesabımı silme talebini başlat
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 28px)', border: '1px solid #D17B6A', backgroundColor: 'rgba(209,123,106,0.06)' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.28em', color: '#D17B6A', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Son Onay
      </p>
      <h3 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '22px', fontWeight: 500, margin: '0 0 12px' }}>
        Bu işlem geri alınamaz.
      </h3>
      <p style={{ color: '#D4CFC2', fontSize: '13px', lineHeight: 1.7, margin: '0 0 20px' }}>
        Devam etmek için <strong style={{ color: '#F4F0E8' }}>şifrenizi</strong> ve onay metnini girin.
      </p>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Şifreniz</label>
        <input
          className="auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>
          Onay için <code style={{ background: 'rgba(244,240,232,0.08)', padding: '1px 6px', fontFamily: 'var(--font-jetbrains)' }}>{CONFIRM_TEXT}</code> yazın
        </label>
        <input
          className="auth-input"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={CONFIRM_TEXT}
          style={inputStyle}
        />
      </div>

      {error && (
        <div role="alert" style={errBox}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || !password || confirm !== CONFIRM_TEXT}
          style={{
            ...dangerBtn,
            opacity: loading || !password || confirm !== CONFIRM_TEXT ? 0.5 : 1,
            cursor: loading || !password || confirm !== CONFIRM_TEXT ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Siliniyor…' : 'Evet, hesabımı sil'}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={loading}
          style={cancelBtn}
        >
          Vazgeç
        </button>
      </div>
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
  outline: 'none',
}

const dangerBtn: React.CSSProperties = {
  padding: '13px 22px',
  backgroundColor: 'transparent',
  border: '1px solid #D17B6A',
  color: '#D17B6A',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 500,
  minHeight: '44px',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const cancelBtn: React.CSSProperties = {
  padding: '13px 22px',
  backgroundColor: 'transparent',
  border: '1px solid rgba(244,240,232,0.25)',
  color: '#B8B0A0',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  minHeight: '44px',
  cursor: 'pointer',
}

const errBox: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #D17B6A',
  backgroundColor: 'rgba(209,123,106,0.1)',
  color: '#F4F0E8',
  fontSize: '13px',
  marginBottom: '14px',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
}
