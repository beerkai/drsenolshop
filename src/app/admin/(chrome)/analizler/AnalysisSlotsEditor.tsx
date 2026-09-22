'use client'

import { useState } from 'react'
import { toast } from '@/components/admin/toast/toast'
import {
  ANALYSIS_PDF_MAX_BYTES,
  ANALYSIS_SLOT_LIMIT,
  analysisPdfUrl,
  type AnalysisSlot,
} from '@/lib/analysis-reports'

function clone(slots: AnalysisSlot[]): AnalysisSlot[] {
  return slots.map((slot) => ({ ...slot }))
}

function newSlotId(): string {
  const raw = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  return `slot-${raw}`
}

export default function AnalysisSlotsEditor({ initial }: { initial: AnalysisSlot[] }) {
  const [slots, setSlots] = useState(() => clone(initial))
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  function update(mutator: (draft: AnalysisSlot[]) => void) {
    setSlots((prev) => {
      const next = clone(prev)
      mutator(next)
      return next
    })
    setDirty(true)
  }

  async function persist(next: AnalysisSlot[], success: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/analysis-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
        return false
      }
      setSlots(clone(data.slots ?? next))
      setDirty(false)
      toast.success(success)
      return true
    } catch {
      toast.error('Ağ hatası.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function uploadPdf(slotId: string, file: File) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      toast.error('Yalnızca PDF yüklenebilir.')
      return
    }
    if (file.size > ANALYSIS_PDF_MAX_BYTES) {
      toast.error('PDF en fazla 20 MB olabilir.')
      return
    }

    setUploadingId(slotId)
    try {
      const signRes = await fetch('/api/admin/analysis-reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })
      const signed = await signRes.json().catch(() => ({}))
      if (!signRes.ok || !signed.ok || !signed.signedUrl || !signed.path) {
        toast.error(signed.message ?? 'Yükleme başlatılamadı.')
        return
      }

      const put = await fetch(signed.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf',
          'x-upsert': 'true',
        },
        body: file,
      })
      if (!put.ok) {
        toast.error('PDF depolamaya yazılamadı.')
        return
      }

      const next = clone(slots).map((slot) =>
        slot.id === slotId ? { ...slot, pdfPath: signed.path as string } : slot
      )
      await persist(next, 'PDF yüklendi.')
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {dirty ? <span className="ad-badge ad-badge-warning">Kaydedilmemiş</span> : null}
        <button
          type="button"
          className="ad-btn ad-btn-primary"
          disabled={saving || !dirty}
          onClick={() => persist(slots, 'Slotlar kaydedildi.')}
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
        <button
          type="button"
          className="ad-btn ad-btn-secondary"
          disabled={saving || slots.length >= ANALYSIS_SLOT_LIMIT}
          onClick={() => {
            const next = clone(slots)
            next.push({ id: newSlotId(), title: '', note: '', pdfPath: null, published: true })
            void persist(next, 'Slot eklendi.')
          }}
        >
          Slot ekle
        </button>
        <a href="/analizler" target="_blank" rel="noopener noreferrer" className="ad-btn ad-btn-ghost">
          Sayfayı aç
        </a>
      </div>

      {slots.length === 0 ? (
        <div className="ad-card" style={{ padding: 20 }}>
          <p style={{ margin: 0, color: 'var(--ad-fg-muted)' }}>
            Slot yok. Yeni bir kart ekleyin, başlığını yazın ve PDF yükleyin.
          </p>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {slots.map((slot, index) => {
          const url = analysisPdfUrl(slot.pdfPath)
          const busy = uploadingId === slot.id
          return (
            <article key={slot.id} className="ad-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <p className="ad-label" style={{ margin: 0 }}>
                  Slot {String(index + 1).padStart(2, '0')}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-sm"
                    disabled={index === 0 || saving}
                    onClick={() =>
                      update((draft) => {
                        const [item] = draft.splice(index, 1)
                        draft.splice(index - 1, 0, item)
                      })
                    }
                  >
                    Yukarı
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-sm"
                    disabled={index === slots.length - 1 || saving}
                    onClick={() =>
                      update((draft) => {
                        const [item] = draft.splice(index, 1)
                        draft.splice(index + 1, 0, item)
                      })
                    }
                  >
                    Aşağı
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-danger ad-btn-sm"
                    disabled={saving}
                    onClick={() => {
                      if (!window.confirm('Bu slot silinsin mi? Yüklü PDF de kaldırılır.')) return
                      const next = slots.filter((item) => item.id !== slot.id)
                      void persist(next, 'Slot silindi.')
                    }}
                  >
                    Çıkar
                  </button>
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Başlık</span>
                <input
                  className="ad-input"
                  value={slot.title}
                  placeholder="Örn. Kestane balı · 2025 hasadı"
                  onChange={(e) =>
                    update((draft) => {
                      draft[index].title = e.target.value
                    })
                  }
                />
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Not</span>
                <input
                  className="ad-input"
                  value={slot.note}
                  placeholder="Lot kodu, laboratuvar, tarih"
                  onChange={(e) =>
                    update((draft) => {
                      draft[index].note = e.target.value
                    })
                  }
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={slot.published}
                  onChange={(e) =>
                    update((draft) => {
                      draft[index].published = e.target.checked
                    })
                  }
                />
                Sitede göster
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <label className="ad-btn ad-btn-secondary ad-btn-sm" style={{ cursor: busy ? 'wait' : 'pointer' }}>
                  {busy ? 'Yükleniyor…' : slot.pdfPath ? 'PDF değiştir' : 'PDF yükle'}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    hidden
                    disabled={busy || saving}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (file) void uploadPdf(slot.id, file)
                    }}
                  />
                </label>
                {slot.pdfPath ? (
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-sm"
                    disabled={saving || busy}
                    onClick={() => {
                      const next = clone(slots)
                      next[index].pdfPath = null
                      void persist(next, 'PDF kaldırıldı.')
                    }}
                  >
                    PDF’i kaldır
                  </button>
                ) : null}
              </div>

              {url ? (
                <p style={{ margin: '12px 0 0', fontSize: 12 }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" lang="en" style={{ color: 'var(--ad-accent)' }}>
                    {url}
                  </a>
                </p>
              ) : (
                <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--ad-fg-muted)' }}>
                  Boş slot. PDF yüklenince vitrinde <span lang="en">cdn.drsenol.shop</span> bağlantısı çıkar.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
