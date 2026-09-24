'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'

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
          z-index: 55;
          right: 12px;
          left: auto;
          bottom: calc(var(--editorial-mobile-nav-height) + env(safe-area-inset-bottom, 0px) + 10px);
          width: min(400px, calc(100vw - 24px));
          background: var(--color-surface-container-lowest);
          border: 1px solid var(--color-hairline-light);
          border-radius: 2px;
          box-shadow: 0 12px 32px rgba(20, 20, 20, 0.08);
          padding: 14px 14px 12px;
        }
        .cookie-kicker {
          margin: 0 0 6px;
          font-family: var(--font-label-spec);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-honey-amber);
        }
        .cookie-copy {
          margin: 0;
          font-family: var(--font-body-sm);
          font-size: 13px;
          line-height: 1.45;
          color: var(--color-on-surface);
        }
        .cookie-copy a {
          color: var(--color-on-surface);
          text-underline-offset: 2px;
        }
        .cookie-copy a:hover { color: var(--color-honey-amber); }
        .cookie-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
        .cookie-btn {
          min-height: 36px;
          padding: 8px 10px;
          font-family: var(--font-nav-caps);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s, color 0.15s;
        }
        .cookie-btn-primary {
          background: var(--color-primary);
          border: 1px solid var(--color-primary);
          color: var(--color-on-primary);
        }
        .cookie-btn-primary:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }
        .cookie-btn-secondary {
          background: transparent;
          border: 1px solid var(--color-outline-variant);
          color: var(--color-on-surface);
        }
        .cookie-btn-secondary:hover { border-color: var(--color-on-surface); }
        .cookie-btn:focus-visible {
          outline: 2px solid var(--color-honey-amber);
          outline-offset: 2px;
        }
        @media (min-width: 1024px) {
          .cookie-banner {
            right: 28px;
            bottom: 28px;
            width: 360px;
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .cookie-banner { animation: cookie-in 0.22s ease; }
        }
        @keyframes cookie-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <div
        className="cookie-banner"
        role="region"
        aria-live="polite"
        aria-label="Çerez tercihi"
      >
        <p className="cookie-kicker">Çerez tercihi</p>
        <p className="cookie-copy">
          Sitenin çalışması için zorunlu çerezler kullanıyoruz.{' '}
          <Link href="/cerez-politikasi">Çerez politikası</Link>
          {' · '}
          <Link href="/gizlilik-politikasi">Gizlilik</Link>
        </p>
        <div className="cookie-actions">
          <button type="button" onClick={reject} className="cookie-btn cookie-btn-secondary">
            Reddet
          </button>
          <button type="button" onClick={accept} className="cookie-btn cookie-btn-primary">
            Kabul et
          </button>
        </div>
      </div>
    </>
  )
}
