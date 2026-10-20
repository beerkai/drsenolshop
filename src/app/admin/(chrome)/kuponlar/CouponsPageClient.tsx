'use client'

import { useEffect, useState } from 'react'
import CouponsPanel, { type CouponRow } from './CouponsPanel'

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      data-pn-page-title
      className="pn-page-title"
      style={{
        display: 'block',
        fontSize: '28px',
        fontWeight: 500,
        lineHeight: '34px',
        minHeight: '34px',
        color: '#1A1916',
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </p>
  )
}

export default function CouponsPageClient() {
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/coupons', { credentials: 'include', cache: 'no-store' })
        const json = (await res.json()) as { ok?: boolean; message?: string; coupons?: CouponRow[] }
        if (cancelled) return
        if (!res.ok || !json.ok || !json.coupons) {
          setError(json.message ?? 'Kuponlar yüklenemedi.')
          return
        }
        setCoupons(json.coupons)
      } catch {
        if (!cancelled) setError('Sunucuya bağlanılamadı.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="pn-card" style={{ padding: 20 }}>
        <p style={{ margin: '0 0 12px', color: 'var(--ad-danger)' }}>{error}</p>
        <button type="button" className="pn-btn pn-btn-primary" onClick={() => window.location.reload()}>
          Yeniden dene
        </button>
      </div>
    )
  }

  const active = coupons?.filter((c) => c.is_active).length ?? 0
  const total = coupons?.length ?? 0

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="pn-eyebrow" style={{ marginBottom: '12px' }}>Pazarlama</p>
        <PageTitle>Kuponlar</PageTitle>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          {coupons ? `${active} aktif · ${total} toplam` : 'Yükleniyor…'}
        </p>
      </div>

      {coupons ? (
        <CouponsPanel initial={coupons} />
      ) : (
        <div className="pn-card" style={{ padding: 24, color: 'var(--ad-fg-muted)' }}>Yükleniyor…</div>
      )}
    </div>
  )
}
