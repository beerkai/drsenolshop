'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/types'
import { toast } from '@/components/admin/toast/toast'
import { Badge } from '@/components/admin/ui/Badge'
import type { Employee, LedgerEntry, LedgerSummary } from '@/lib/ledger'
import LedgerEntryModal from './LedgerEntryModal'
import PlateHistoryDrawer from './PlateHistoryDrawer'

type Filter = 'all' | 'unpaid-customer' | 'unpaid-guide' | 'cash' | 'card'

interface Props {
  date: string
  filter: Filter
  search: string
  summary: LedgerSummary
  entries: LedgerEntry[]
  total: number
  employees: Employee[]
}

function shiftDate(date: string, days: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateHuman(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DefterClient({ date, filter, search, summary, entries, total, employees }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(search)
  const [plateDrawer, setPlateDrawer] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)

  const isToday = date === todayKey()

  // ─── Klavye: N → yeni kayıt
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setModalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function updateUrl(next: { date?: string; filter?: Filter; q?: string }) {
    const params = new URLSearchParams()
    const d = next.date ?? date
    const f = next.filter ?? filter
    const q = next.q ?? searchInput
    if (d !== todayKey()) params.set('date', d)
    if (f !== 'all') params.set('filter', f)
    if (q) params.set('q', q)
    const qs = params.toString()
    startTransition(() => {
      router.push(`/admin/defter${qs ? '?' + qs : ''}`)
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateUrl({ q: searchInput })
  }

  async function handleTogglePayment(entry: LedgerEntry, field: 'customer_paid' | 'guide_paid') {
    const next = !entry[field]
    try {
      const res = await fetch(`/api/admin/defter/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncelleme başarısız.')
        return
      }
      toast.success(field === 'customer_paid' ? (next ? 'Müşteri ödedi işaretlendi.' : 'Müşteri ödeme geri alındı.') : next ? 'Rehbere ödendi işaretlendi.' : 'Rehber ödeme geri alındı.')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    }
  }

  async function handleDelete(entry: LedgerEntry) {
    if (!confirm(`${entry.plate} plakalı kayıt silinsin mi? Bu işlem geri alınamaz.`)) return
    try {
      const res = await fetch(`/api/admin/defter/${entry.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Silinemedi.')
        return
      }
      toast.success('Kayıt silindi.')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    }
  }

  return (
    <div>
      {/* Başlık + tarih nav */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Defter</p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
            {isToday ? <span>Bugün</span> : <span style={{ color: 'var(--ad-fg-muted)' }}>Geçmiş gün</span>}
            <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400, marginLeft: '8px' }}>
              · {dateHuman(date)}
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" onClick={() => updateUrl({ date: shiftDate(date, -1) })} aria-label="Önceki gün" className="ad-icon-btn">‹</button>
          <input
            type="date"
            value={date}
            onChange={(e) => updateUrl({ date: e.target.value })}
            className="ad-input"
            style={{ width: '160px', padding: '8px 12px', fontSize: '12px' }}
          />
          <button type="button" onClick={() => updateUrl({ date: shiftDate(date, +1) })} aria-label="Sonraki gün" className="ad-icon-btn">›</button>
          {!isToday && (
            <button type="button" onClick={() => updateUrl({ date: todayKey() })} className="ad-btn ad-btn-secondary ad-btn-sm">
              Bugüne dön
            </button>
          )}
          <button
            type="button"
            onClick={() => { setEditingEntry(null); setModalOpen(true) }}
            className="ad-btn ad-btn-primary"
            kbd-hint="N"
          >
            + Kayıt Ekle <span className="ad-kbd">N</span>
          </button>
        </div>
      </div>

      {/* Metrik kartları */}
      <div className="defter-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <style>{`
          @media (max-width: 1024px) { .defter-metrics { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px)  { .defter-metrics { grid-template-columns: 1fr !important; } }
        `}</style>

        <Metric label="Kayıt" value={String(summary.entryCount)} />
        <Metric label="Toplam Ciro" value={formatPrice(summary.totalSale)} gold />
        <Metric
          label="Kart / Nakit"
          value={
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: 'var(--ad-info)' }}>{formatPrice(summary.cardSale)}</span>
              <span style={{ color: 'var(--ad-fg-faint)', fontSize: '14px' }}>/</span>
              <span style={{ color: 'var(--ad-success)' }}>{formatPrice(summary.cashSale)}</span>
            </span>
          }
          small
        />
        <Metric
          label="Ödenmemiş"
          value={
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '12px', fontSize: '20px' }}>
              <span style={{ color: summary.unpaidCustomers > 0 ? 'var(--ad-warning)' : 'var(--ad-fg)' }}>
                {summary.unpaidCustomers} <span style={{ fontSize: '11px', color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains), monospace', letterSpacing: '0.1em' }}>müşteri</span>
              </span>
              <span style={{ color: summary.unpaidGuides > 0 ? 'var(--ad-warning)' : 'var(--ad-fg)' }}>
                {summary.unpaidGuides} <span style={{ fontSize: '11px', color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains), monospace', letterSpacing: '0.1em' }}>rehber</span>
              </span>
            </span>
          }
          small
        />
      </div>

      {/* Filtreler + arama */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
        <FilterChip label="Tümü" active={filter === 'all'} onClick={() => updateUrl({ filter: 'all' })} />
        <FilterChip label="Ödenmemiş Müşteri" active={filter === 'unpaid-customer'} onClick={() => updateUrl({ filter: 'unpaid-customer' })} />
        <FilterChip label="Ödenmemiş Rehber" active={filter === 'unpaid-guide'} onClick={() => updateUrl({ filter: 'unpaid-guide' })} />
        <FilterChip label="Kart" active={filter === 'card'} onClick={() => updateUrl({ filter: 'card' })} />
        <FilterChip label="Nakit" active={filter === 'cash'} onClick={() => updateUrl({ filter: 'cash' })} />

        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '8px' }}>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Plaka, çalışan veya not ara…"
            className="ad-input"
            style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); updateUrl({ q: '' }) }} className="ad-btn ad-btn-ghost ad-btn-sm">
              Temizle
            </button>
          )}
        </form>
      </div>

      {/* Liste */}
      {entries.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-title">{isToday ? 'Bugün için kayıt yok.' : 'Bu gün için kayıt yok.'}</p>
          <p className="ad-empty-hint">+ Kayıt Ekle ile yeni satış girebilirsin (kısayol: <span className="ad-kbd">N</span>).</p>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Saat</th>
                <th>Plaka</th>
                <th>Çalışan</th>
                <th>Ödeme</th>
                <th className="is-right">Satış</th>
                <th className="is-right">Rehber</th>
                <th>Durum</th>
                <th>Not</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)', whiteSpace: 'nowrap' }}>
                    {e.entry_time?.slice(0, 5)}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setPlateDrawer(e.plate)}
                      className="ad-mono"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--ad-line)',
                        padding: '3px 8px',
                        color: 'var(--ad-fg)',
                        fontSize: '12px',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                      title="Bu plakanın geçmişi"
                    >
                      {e.plate}
                    </button>
                  </td>
                  <td style={{ color: 'var(--ad-fg)', fontSize: '13px' }}>
                    {e.employee_name ?? <span style={{ color: 'var(--ad-fg-faint)' }}>—</span>}
                  </td>
                  <td>
                    <Badge tone={e.payment_method === 'card' ? 'info' : 'success'} bracketed>
                      {e.payment_method === 'card' ? 'Kart' : 'Nakit'}
                    </Badge>
                  </td>
                  <td className="is-right">
                    <span className="ad-display" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ad-fg)' }}>
                      {formatPrice(Number(e.sale_amount))}
                    </span>
                  </td>
                  <td className="is-right">
                    {e.has_guide && e.guide_commission != null ? (
                      <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-gold-deep)' }}>
                        {formatPrice(Number(e.guide_commission))}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ad-fg-faint)', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePayment(e, 'customer_paid')}
                        title="Müşteri ödedi mi?"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-jetbrains), monospace',
                          fontSize: '10px',
                          letterSpacing: '0.05em',
                          color: e.customer_paid ? 'var(--ad-success)' : 'var(--ad-warning)',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {e.customer_paid ? '✓' : '○'} Müşteri
                      </button>
                      {e.has_guide && (
                        <button
                          type="button"
                          onClick={() => handleTogglePayment(e, 'guide_paid')}
                          title="Rehbere ödendi mi?"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'var(--font-jetbrains), monospace',
                            fontSize: '10px',
                            letterSpacing: '0.05em',
                            color: e.guide_paid ? 'var(--ad-success)' : 'var(--ad-warning)',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {e.guide_paid ? '✓' : '○'} Rehber
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: '180px', minWidth: '120px' }}>
                    {e.notes ? (
                      <span style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', fontStyle: 'italic', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.notes}>
                        {e.notes}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ad-fg-faint)', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                  <td className="is-right">
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { setEditingEntry(e); setModalOpen(true) }}
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        title="Düzenle"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e)}
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        title="Sil"
                        style={{ color: 'var(--ad-danger)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alt bilgi */}
      <p className="ad-mono" style={{ marginTop: '16px', fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
        {total} kayıt · <span className="ad-kbd">N</span> yeni kayıt · plakaya tıklayınca geçmiş açılır
      </p>

      {/* Modal'lar */}
      {modalOpen && (
        <LedgerEntryModal
          date={date}
          employees={employees}
          initial={editingEntry}
          onClose={() => { setModalOpen(false); setEditingEntry(null) }}
          onSaved={() => { setModalOpen(false); setEditingEntry(null); router.refresh() }}
        />
      )}

      {plateDrawer && (
        <PlateHistoryDrawer
          plate={plateDrawer}
          onClose={() => setPlateDrawer(null)}
        />
      )}
    </div>
  )
}

function Metric({ label, value, gold, small }: { label: string; value: React.ReactNode; gold?: boolean; small?: boolean }) {
  return (
    <div className="ad-metric">
      <p className="ad-metric-label">{label}</p>
      <p
        className="ad-metric-value"
        style={{
          fontSize: small ? '22px' : undefined,
          color: gold ? 'var(--ad-gold-deep)' : undefined,
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['ad-btn', 'ad-btn-sm', active ? 'ad-btn-primary' : 'ad-btn-secondary'].join(' ')}
    >
      {label}
    </button>
  )
}
