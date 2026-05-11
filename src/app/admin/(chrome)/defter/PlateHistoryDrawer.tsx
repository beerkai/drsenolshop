'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/types'
import { Badge } from '@/components/admin/ui/Badge'
import type { LedgerEntry } from '@/lib/ledger'

interface Props {
  plate: string
  onClose: () => void
}

export default function PlateHistoryDrawer({ plate, onClose }: Props) {
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    fetch(`/api/admin/defter/plate/${encodeURIComponent(plate)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setEntries(data.entries as LedgerEntry[])
        else setError(data.message ?? 'Hata')
      })
      .catch(() => setError('Ağ hatası'))
  }, [plate])

  const totals = entries
    ? entries.reduce(
        (acc, e) => ({
          count: acc.count + 1,
          total: acc.total + Number(e.sale_amount ?? 0),
          guideTotal: acc.guideTotal + (e.has_guide ? Number(e.guide_commission ?? 0) : 0),
        }),
        { count: 0, total: 0, guideTotal: 0 }
      )
    : null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,9,8,0.35)', backdropFilter: 'blur(2px)', zIndex: 70 }}
      />
      <aside
        role="dialog"
        aria-label={`${plate} plakanın geçmişi`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--ad-surface)',
          borderLeft: '1px solid var(--ad-line)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.12)',
          zIndex: 75,
          overflowY: 'auto',
          animation: 'ad-fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--ad-surface)', padding: '20px 24px', borderBottom: '1px solid var(--ad-line-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="ad-eyebrow" style={{ marginBottom: '6px' }}>Plaka Geçmişi</p>
            <h2 className="ad-mono" style={{ fontSize: '22px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0, letterSpacing: '0.05em' }}>
              {plate}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="ad-icon-btn">✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Özet */}
          {totals && totals.count > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <SummaryBox label="Ziyaret" value={String(totals.count)} />
              <SummaryBox label="Toplam" value={formatPrice(totals.total)} gold />
              <SummaryBox label="Rehber" value={formatPrice(totals.guideTotal)} small />
            </div>
          )}

          {/* Liste */}
          {error ? (
            <p style={{ color: 'var(--ad-danger)', fontSize: '13px' }}>{error}</p>
          ) : entries === null ? (
            <p className="ad-mono" style={{ color: 'var(--ad-fg-faint)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Yükleniyor…
            </p>
          ) : entries.length === 0 ? (
            <div className="ad-empty">
              <p className="ad-empty-title">Geçmiş kayıt yok.</p>
              <p className="ad-empty-hint">Bu plaka için ilk ziyaret.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {entries.map((e) => (
                <div key={e.id} style={{ padding: '12px', backgroundColor: 'var(--ad-surface-2)', borderLeft: '2px solid var(--ad-gold)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <Link
                      href={`/admin/defter?date=${e.entry_date}`}
                      onClick={onClose}
                      className="ad-mono"
                      style={{ fontSize: '11px', color: 'var(--ad-gold-deep)', letterSpacing: '0.08em', textDecoration: 'none' }}
                    >
                      {new Date(e.entry_date + 'T12:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      <span style={{ color: 'var(--ad-fg-faint)' }}>{e.entry_time?.slice(0, 5)}</span>
                    </Link>
                    <Badge tone={e.payment_method === 'card' ? 'info' : 'success'} bracketed>
                      {e.payment_method === 'card' ? 'Kart' : 'Nakit'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--ad-fg-muted)', fontSize: '12px' }}>
                      {e.employee_name ?? <span style={{ color: 'var(--ad-fg-faint)' }}>— çalışan yok —</span>}
                    </span>
                    <span className="ad-display" style={{ fontSize: '17px', fontWeight: 500, color: 'var(--ad-fg)' }}>
                      {formatPrice(Number(e.sale_amount))}
                    </span>
                  </div>

                  {e.has_guide && e.guide_commission != null && (
                    <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-gold-deep)', letterSpacing: '0.05em', margin: '2px 0 4px' }}>
                      rehber: {formatPrice(Number(e.guide_commission))} · {e.guide_paid ? 'ödendi' : 'ödenmedi'}
                    </p>
                  )}

                  {e.notes && (
                    <p style={{ fontSize: '12px', color: 'var(--ad-fg-muted)', fontStyle: 'italic', margin: '6px 0 0' }}>
                      {e.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function SummaryBox({ label, value, gold, small }: { label: string; value: string; gold?: boolean; small?: boolean }) {
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--ad-line-faint)' }}>
      <p className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 4px' }}>
        {label}
      </p>
      <p className="ad-display" style={{ fontSize: small ? '15px' : '18px', fontWeight: 500, color: gold ? 'var(--ad-gold-deep)' : 'var(--ad-fg)', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}
