'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ═══════════════════════════════════════════════════════════════
// Çerez onay bandı
// ─ localStorage: 'cookie-consent' = 'accepted' | 'rejected'
// ─ Bant yalnızca seçim yapılmadıysa görünür
// ─ Şu an sitede üçüncü taraf pazarlama çerezi YOK; "Reddet" pratikte
//   sadece bandı kapatır. Analytics eklendiğinde rıza state'i okunmalı.
// ─ A11y: aria-live='polite' — focus trap YOK (sayfa kullanımını engellemez)
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
    <>
      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background-color: rgba(10, 9, 8, 0.96);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(201, 169, 97, 0.3);
          padding: clamp(14px, 3vw, 20px) clamp(16px, 4vw, 32px);
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
        }
        .cookie-row {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .cookie-btn {
          flex: 0 0 auto;
          min-height: 44px;
          padding: 12px 22px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
        }
        .cookie-btn-primary {
          background-color: var(--color-gold);
          border: 1px solid var(--color-gold);
          color: var(--color-ink);
          font-weight: 500;
        }
        .cookie-btn-primary:hover { background-color: #D4B879; border-color: #D4B879; }
        .cookie-btn-secondary {
          background-color: transparent;
          border: 1px solid rgba(244, 240, 232, 0.35);
          color: #D4CFC2;
        }
        .cookie-btn-secondary:hover { border-color: #D4CFC2; }
        .cookie-btn:focus-visible {
          outline: 2px solid var(--color-gold);
          outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .cookie-row { flex-direction: column; align-items: stretch; gap: 14px; }
          .cookie-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .cookie-btn { width: 100%; padding: 12px 16px; }
        }
      `}</style>

      <div
        className="cookie-banner"
        role="region"
        aria-live="polite"
        aria-label="Çerez tercihi"
      >
        <div className="cookie-row">
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                margin: '0 0 6px',
              }}
            >
              Çerez Tercihi
            </p>
            <p style={{ color: '#D4CFC2', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Sitenin doğru çalışması için zorunlu çerezler kullanıyoruz. Detay:{' '}
              <Link href="/cerez-politikasi" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>
                Çerez
              </Link>
              {' / '}
              <Link href="/gizlilik-politikasi" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>
                Gizlilik
              </Link>
              .
            </p>
          </div>

          <div className="cookie-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={reject} className="cookie-btn cookie-btn-secondary">
              Reddet
            </button>
            <button type="button" onClick={accept} className="cookie-btn cookie-btn-primary">
              Kabul Et
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
