'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (rating < 1) {
      setError('Lütfen 1–5 arası bir puan seçin.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, title, body }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Yorum gönderilemedi.')
        setLoading(false)
        return
      }
      setSent(true)
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ padding: '20px 24px', border: '1px solid #C9A961', backgroundColor: 'rgba(201,169,97,0.05)' }}>
        <p style={{ color: '#E5DDC8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
          <span style={{ color: '#C9A961', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', marginRight: '8px' }}>✓ Alındı</span>
          Yorumunuz moderasyon sırasında. Onaylandığında yayına alınacak.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', border: '1px solid rgba(244,240,232,0.12)', backgroundColor: 'rgba(244,240,232,0.02)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A961', margin: '0 0 16px' }}>
        Yorum Bırak
      </p>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Puanınız</label>
        <div style={{ display: 'inline-flex', gap: '4px' }} role="radiogroup" aria-label="Puan">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} yıldız`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '28px',
                  lineHeight: 1,
                  padding: '4px',
                  color: active ? '#C9A961' : '#3A3530',
                  transition: 'color 0.1s',
                }}
              >
                {active ? '★' : '☆'}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle} htmlFor="rv-title">Başlık (opsiyonel)</label>
        <input
          id="rv-title"
          className="auth-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Kısa bir başlık"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle} htmlFor="rv-body">Yorumunuz</label>
        <textarea
          id="rv-body"
          className="auth-input"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder="Deneyiminizi paylaşın…"
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'var(--font-sans)' }}
        />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6E665A', margin: '4px 0 0', textAlign: 'right' }}>
          {body.length}/2000
        </p>
      </div>

      {error && (
        <div role="alert" style={errBox}>
          <span aria-hidden style={{ fontSize: '11px', flexShrink: 0 }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating < 1}
        className="auth-submit"
        style={{
          padding: '13px 22px',
          backgroundColor: '#C9A961',
          border: '1px solid #C9A961',
          color: '#15110D',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 500,
          minHeight: '46px',
          cursor: loading || rating < 1 ? 'not-allowed' : 'pointer',
          opacity: loading || rating < 1 ? 0.5 : 1,
        }}
      >
        {loading ? 'Gönderiliyor…' : 'Yorumu gönder'}
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
  color: '#6E665A',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.15)',
  color: '#F4F0E8',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '14px',
  outline: 'none',
}

const errBox: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #D17B6A',
  backgroundColor: 'rgba(209,123,106,0.08)',
  color: '#D17B6A',
  fontSize: '13px',
  marginBottom: '14px',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
}
