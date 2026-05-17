'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ═══════════════════════════════════════════════════════════════
// Çerez onay bandı
// ─ localStorage: 'cookie-consent' = 'accepted' | 'rejected'
// ─ Bant yalnızca seçim yapılmadıysa görünür
// ─ Şu an sitede üçüncü taraf pazarlama çerezi YOK; "Reddet" pratikte
//   sadece bandı kapatır. Analytics eklendiğinde rıza state'i okunmalı.
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY)
      if (!v) setVisible(true)
    } catch {
      // localStorage erişimi kısıtlıysa sessizce göstermeyiz
    }
  }, [])

  function accept() {
    try { window.localStorage.setItem(STORAGE_KEY, 'accepted') } catch {}
    setVisible(false)
  }
  function reject() {
    try { window.localStorage.setItem(STORAGE_KEY, 'rejected') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez tercihi"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(10,9,8,0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(201,169,97,0.3)',
        padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 32px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: '1 1 380px', minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C9A961',
              margin: '0 0 6px',
            }}
          >
            Çerez Tercihi
          </p>
          <p
            style={{
              color: '#D4CFC2',
              fontSize: '13px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Sitenin doğru çalışması için zorunlu çerezler kullanıyoruz. Detaylar için{' '}
            <Link href="/cerez-politikasi" style={{ color: '#C9A961', textDecoration: 'underline' }}>
              Çerez Politikası
            </Link>
            {' '}ve{' '}
            <Link href="/gizlilik-politikasi" style={{ color: '#C9A961', textDecoration: 'underline' }}>
              Gizlilik Politikası
            </Link>
            .
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reject}
            style={{
              padding: '11px 20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(244,240,232,0.25)',
              color: '#B8B0A0',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={accept}
            style={{
              padding: '11px 22px',
              backgroundColor: '#C9A961',
              border: '1px solid #C9A961',
              color: '#0A0908',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  )
}
