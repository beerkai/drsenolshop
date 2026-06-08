'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, unknown>, selector: string) => void
  }
}

export default function PaytrIframeClient({ orderNumber }: { orderNumber: string }) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resizerReady, setResizerReady] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    fetch('/api/payments/paytr/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_number: orderNumber }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok || !data.ok) {
          setError(data.message ?? 'Ödeme oturumu başlatılamadı')
          return
        }
        setIframeUrl(data.iframe_url)
      })
      .catch(() => setError('Sunucuya bağlanılamadı'))
  }, [orderNumber])

  useEffect(() => {
    if (!iframeUrl || !resizerReady || !window.iFrameResize) return
    window.iFrameResize({}, '#paytriframe')
  }, [iframeUrl, resizerReady])

  if (error) {
    return (
      <div style={{ padding: '24px', border: '1px solid #C8472D', backgroundColor: 'rgba(200,71,45,0.08)', color: '#F4F0E8' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#C8472D', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Hata
        </p>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{error}</p>
      </div>
    )
  }

  if (!iframeUrl) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#B8B0A0', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
        Ödeme sayfası hazırlanıyor…
      </div>
    )
  }

  return (
    <div style={{ background: '#1C1814', padding: '16px', border: '1px solid rgba(244,240,232,0.08)' }}>
      <iframe
        id="paytriframe"
        src={iframeUrl}
        title="PayTR güvenli ödeme"
        style={{ width: '100%', minHeight: '720px', border: 'none', display: 'block', background: '#FFFFFF' }}
        allow="payment"
      />
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="lazyOnload"
        onLoad={() => setResizerReady(true)}
      />
    </div>
  )
}
