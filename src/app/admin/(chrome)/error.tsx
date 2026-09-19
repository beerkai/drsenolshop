'use client'

import { useEffect } from 'react'

export default function AdminChromeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin] sayfa hatası:', error.message)
  }, [error])

  return (
    <div className="ad-card" style={{ maxWidth: '520px', margin: '24px auto' }}>
      <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
        Hata
      </p>
      <h1 className="ad-display" style={{ fontSize: '24px', margin: '0 0 12px' }}>
        Bu sayfa yüklenemedi.
      </h1>
      <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ad-fg-muted)', margin: '0 0 20px' }}>
        {error.message || 'Beklenmeyen bir sorun oluştu. Ağ bağlantınızı kontrol edip tekrar deneyin.'}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" className="ad-btn ad-btn-primary" onClick={() => reset()}>
          Tekrar dene
        </button>
        <a href="/admin" className="ad-btn ad-btn-secondary">
          Panele dön
        </a>
      </div>
    </div>
  )
}
