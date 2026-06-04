'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

export interface CustomerNote {
  id: string
  customer_email: string
  admin_email: string | null
  body: string
  created_at: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function CustomerNotes({ customerEmail, initial }: { customerEmail: string; initial: CustomerNote[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<Set<string>>(new Set())

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (saving || !draft.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/customer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: customerEmail, body: draft }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
      } else {
        setDraft('')
        toast.success('Not eklendi.')
        router.refresh()
      }
    } catch { toast.error('Ağ hatası.') }
    finally { setSaving(false) }
  }

  async function deleteNote(id: string) {
    if (pending.has(id)) return
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return
    setPending((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/admin/customer-notes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) toast.error(data.message ?? 'Silinemedi.')
      else { toast.success('Silindi.'); router.refresh() }
    } catch { toast.error('Ağ hatası.') }
    finally { setPending((s) => { const n = new Set(s); n.delete(id); return n }) }
  }

  return (
    <>
      <form onSubmit={addNote} style={{ marginBottom: '14px' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Müşteri hakkında not (sadece admin görür)…"
          className="ad-input"
          maxLength={4000}
          style={{ fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: '70px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)' }}>
            {draft.length}/4000
          </span>
          <button type="submit" disabled={saving || !draft.trim()} className="ad-btn ad-btn-primary" style={{ fontSize: '11px' }}>
            {saving ? 'Kaydediliyor…' : 'Not Ekle'}
          </button>
        </div>
      </form>

      {initial.length === 0 ? (
        <div className="ad-empty"><p className="ad-empty-hint">Henüz not yok.</p></div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {initial.map((n) => (
            <li key={n.id} className="ad-card ad-card-sm" style={{ padding: '12px 14px' }}>
              <p style={{ color: 'var(--ad-fg)', fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>
                {n.body}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', margin: 0, letterSpacing: '0.05em' }}>
                  {n.admin_email ?? '—'} · {formatDate(n.created_at)}
                </p>
                <button type="button" onClick={() => deleteNote(n.id)} disabled={pending.has(n.id)} className="ad-btn" style={{ fontSize: '10px', padding: '4px 10px', borderColor: 'rgba(209,123,106,0.4)', color: '#D17B6A' }}>
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
