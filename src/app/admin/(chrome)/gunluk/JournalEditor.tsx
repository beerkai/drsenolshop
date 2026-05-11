'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

interface Props {
  initialNotes: string
  initialMetrics: Record<string, string>
  lastSavedAt: string | null
}

interface MetricRow {
  key: string
  value: string
}

const DEFAULT_KEYS = ['Kovan sağlığı', 'Günün hedefi', 'Hava / üretim notu']

function metricsToRows(m: Record<string, string>): MetricRow[] {
  const entries = Object.entries(m)
  if (entries.length === 0) {
    return DEFAULT_KEYS.map((key) => ({ key, value: '' }))
  }
  // Mevcut alanlar + boş varsayılan alan
  const rows: MetricRow[] = entries.map(([key, value]) => ({ key, value }))
  // En az 3 satır olsun (kullanıcıya ihtimal alanı bırak)
  while (rows.length < 3 && rows.length < DEFAULT_KEYS.length) {
    rows.push({ key: DEFAULT_KEYS[rows.length], value: '' })
  }
  return rows
}

export default function JournalEditor({ initialNotes, initialMetrics, lastSavedAt }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [rows, setRows] = useState<MetricRow[]>(() => metricsToRows(initialMetrics))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(lastSavedAt)

  useEffect(() => {
    setDirty(true)
  }, [notes, rows])

  // İlk yüklemede dirty olmasın
  useEffect(() => { setDirty(false) }, [])

  function updateRow(i: number, field: 'key' | 'value', v: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)))
  }

  function addRow() {
    if (rows.length >= 8) {
      toast.warning('En fazla 8 metrik ekleyebilirsin.')
      return
    }
    setRows((prev) => [...prev, { key: '', value: '' }])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      const metrics: Record<string, string> = {}
      for (const { key, value } of rows) {
        const k = key.trim()
        if (k) metrics[k] = value
      }

      const res = await fetch('/api/admin/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes.trim() || null,
          metrics,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kayıt başarısız.')
        return
      }

      const newSavedAt: string | null = data.log?.updated_at ?? data.log?.created_at ?? new Date().toISOString()
      setSavedAt(newSavedAt)
      setDirty(false)
      toast.success('Günlük kaydedildi.')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  // ⌘+S ile kaydet
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        if (dirty) handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, notes, rows])

  return (
    <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
        <p className="ad-eyebrow-muted">Notlar</p>
        <p className="ad-mono" style={{ fontSize: '10px', color: dirty ? 'var(--ad-warning)' : 'var(--ad-fg-faint)', letterSpacing: '0.1em' }}>
          {dirty
            ? '● kaydedilmedi'
            : savedAt
              ? `kaydedildi · ${new Date(savedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
              : 'yeni kayıt'}
        </p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="ad-textarea"
        placeholder="Bugün ne oldu? Üretim, tedarikçi, müşteri, fikir... serbestçe yaz."
        rows={8}
        style={{ minHeight: '180px', fontSize: '14px', lineHeight: 1.65 }}
      />

      <hr className="ad-divider" />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p className="ad-eyebrow-muted">Mini Metrikler</p>
        <p className="ad-mono" style={{ fontSize: '9.5px', color: 'var(--ad-fg-faint)', letterSpacing: '0.1em' }}>
          özelleştirilebilir · {rows.length}/8
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px' }}>
            <input
              type="text"
              value={r.key}
              onChange={(e) => updateRow(i, 'key', e.target.value)}
              placeholder="Metrik adı"
              className="ad-input"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            />
            <input
              type="text"
              value={r.value}
              onChange={(e) => updateRow(i, 'value', e.target.value)}
              placeholder="Değer"
              className="ad-input"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Bu satırı kaldır"
              className="ad-icon-btn"
              style={{ width: '36px', height: '36px' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="ad-btn ad-btn-ghost ad-btn-sm"
        style={{ alignSelf: 'flex-start' }}
      >
        + Metrik Ekle
      </button>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em', margin: 0 }}>
          <span className="ad-kbd">⌘</span> <span className="ad-kbd">S</span> ile kaydedebilirsin
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="ad-btn ad-btn-primary"
        >
          {saving ? 'Kaydediliyor…' : dirty ? 'Kaydet' : 'Kaydedildi ✓'}
        </button>
      </div>
    </div>
  )
}
