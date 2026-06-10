'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderNumber: string
  email: string  // sipariş email'i — misafir için body'de gönderilir
}

export default function CancelOrderButton({ orderNumber, email }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'İptal işlemi başarısız.')
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setLoading(false)
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          padding: '13px 22px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(209,123,106,0.5)',
          color: 'var(--color-alert-soft)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        Siparişi İptal Et
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Sipariş iptal onayı"
      style={{
        padding: '20px',
        border: '1px solid var(--color-alert-soft)',
        backgroundColor: 'rgba(209,123,106,0.06)',
        maxWidth: '420px',
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', color: 'var(--color-alert-soft)', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Onay
      </p>
      <p style={{ color: '#D4CFC2', fontSize: '14px', lineHeight: 1.6, margin: '0 0 18px' }}>
        Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
      </p>
      {error && (
        <div role="alert" style={{ padding: '10px 12px', border: '1px solid var(--color-alert)', backgroundColor: 'rgba(200,71,45,0.1)', color: 'var(--color-cream)', fontSize: '13px', marginBottom: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--color-alert-soft)',
            border: '1px solid var(--color-alert-soft)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 500,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            minHeight: '44px',
          }}
        >
          {loading ? 'İptal ediliyor…' : 'Evet, iptal et'}
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(244,240,232,0.2)',
            color: 'var(--color-cream-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          Vazgeç
        </button>
      </div>
    </div>
  )
}
