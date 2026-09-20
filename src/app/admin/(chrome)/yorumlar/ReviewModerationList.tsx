'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'
import AdminReviewComposer, {
  ReviewFormFields,
  reviewRowToFormState,
  type AdminProductOption,
  type ReviewFormState,
} from './AdminReviewComposer'

export interface AdminReviewRow {
  id: string
  product_id: string
  product_name: string | null
  product_slug: string | null
  customer_email: string
  customer_name: string | null
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  is_verified_purchase: boolean
  created_at: string
  is_curated: boolean
}

type Filter = 'pending' | 'approved' | 'all'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function ReviewModerationList({
  initial,
  products,
}: {
  initial: AdminReviewRow[]
  products: AdminProductOption[]
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('pending')
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ReviewFormState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const visible = initial.filter((r) =>
    filter === 'all' ? true : filter === 'pending' ? !r.is_approved : r.is_approved
  )

  async function setApproved(id: string, approved: boolean) {
    if (pending.has(id)) return
    setPending((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: approved }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncellenemedi.')
      } else {
        toast.success(approved ? 'Onaylandı.' : 'Onay kaldırıldı.')
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setPending((s) => { const n = new Set(s); n.delete(id); return n })
    }
  }

  function startEdit(r: AdminReviewRow) {
    setEditingId(r.id)
    setEditForm(reviewRowToFormState(r))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  async function saveEdit(id: string) {
    if (!editForm || savingEdit) return
    setSavingEdit(true)
    try {
      const payload: Record<string, unknown> = {
        product_id: editForm.product_id,
        customer_name: editForm.customer_name,
        rating: Number(editForm.rating),
        title: editForm.title.trim() || null,
        body: editForm.body.trim() || null,
        is_verified_purchase: editForm.is_verified_purchase,
        is_approved: editForm.is_approved,
      }
      if (editForm.customer_email.trim()) {
        payload.customer_email = editForm.customer_email.trim()
      }
      if (editForm.created_at) {
        payload.created_at = new Date(editForm.created_at).toISOString()
      }
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncellenemedi.')
      } else {
        toast.success('Kaydedildi.')
        cancelEdit()
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function deleteReview(id: string) {
    if (pending.has(id)) return
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) return
    setPending((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Silinemedi.')
      } else {
        toast.success('Silindi.')
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setPending((s) => { const n = new Set(s); n.delete(id); return n })
    }
  }

  return (
    <>
      <AdminReviewComposer products={products} />

      {/* Filtre */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['pending', 'approved', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? 'ad-btn ad-btn-primary' : 'ad-btn'}
            style={{ padding: '8px 16px', fontSize: '11px', letterSpacing: '0.18em' }}
          >
            {f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Tümü'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="ad-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '14px' }}>
            Bu filtrede yorum yok.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map((r) => (
            <article key={r.id} className="ad-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--ad-gold)', fontSize: '14px', letterSpacing: '1px' }}>
                      {'★'.repeat(r.rating)}<span style={{ color: 'var(--ad-line-strong)' }}>{'★'.repeat(5 - r.rating)}</span>
                    </span>
                    {r.is_verified_purchase && (
                      <span className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ad-success)', border: '1px solid var(--ad-success)', padding: '2px 6px' }}>
                        ✓ Alışveriş
                      </span>
                    )}
                    <span className={r.is_approved ? '' : ''} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: r.is_approved ? 'var(--ad-success)' : 'var(--ad-gold)' }}>
                      {r.is_approved ? 'Onaylı' : 'Bekliyor'}
                    </span>
                    {r.is_curated && (
                      <span className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ad-fg-faint)', border: '1px solid var(--ad-line-strong)', padding: '2px 6px' }}>
                        Vitrin yorumu
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <p style={{ color: 'var(--ad-fg)', fontSize: '15px', fontWeight: 500, margin: '4px 0' }}>
                      {r.title}
                    </p>
                  )}
                  {r.body && (
                    <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', lineHeight: 1.6, margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                      {r.body}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains)' }}>
                  <p style={{ margin: '0 0 2px', color: 'var(--ad-fg-muted)' }}>
                    {r.customer_name ?? r.customer_email.split('@')[0]}
                  </p>
                  <p style={{ margin: '0 0 2px' }}>{r.customer_email}</p>
                  <p style={{ margin: '0 0 8px' }}>{formatDate(r.created_at)}</p>
                  {r.product_slug && (
                    <a href={`/urun/${r.product_slug}`} target="_blank" rel="noopener" style={{ color: 'var(--ad-gold-deep)', textDecoration: 'none' }}>
                      {r.product_name ?? r.product_slug} ↗
                    </a>
                  )}
                </div>
              </div>

              {editingId === r.id && editForm ? (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--ad-line-faint)' }}>
                  <ReviewFormFields
                    products={products}
                    form={editForm}
                    setForm={(next) => {
                      setEditForm((prev) => {
                        if (!prev) return prev
                        return typeof next === 'function' ? next(prev) : next
                      })
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button type="button" className="ad-btn ad-btn-primary" style={{ fontSize: '11px' }} disabled={savingEdit} onClick={() => saveEdit(r.id)}>
                      {savingEdit ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
                    </button>
                    <button type="button" className="ad-btn" style={{ fontSize: '11px' }} disabled={savingEdit} onClick={cancelEdit}>
                      İptal
                    </button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--ad-line-faint)' }}>
                <button type="button" onClick={() => (editingId === r.id ? cancelEdit() : startEdit(r))} disabled={pending.has(r.id)} className="ad-btn" style={{ fontSize: '11px' }}>
                  {editingId === r.id ? 'Düzenlemeyi kapat' : 'Düzenle'}
                </button>
                {r.is_approved ? (
                  <button type="button" onClick={() => setApproved(r.id, false)} disabled={pending.has(r.id)} className="ad-btn" style={{ fontSize: '11px' }}>
                    Onayı kaldır
                  </button>
                ) : (
                  <button type="button" onClick={() => setApproved(r.id, true)} disabled={pending.has(r.id)} className="ad-btn ad-btn-primary" style={{ fontSize: '11px' }}>
                    Onayla
                  </button>
                )}
                <button type="button" onClick={() => deleteReview(r.id)} disabled={pending.has(r.id)} className="ad-btn" style={{ fontSize: '11px', borderColor: 'var(--ad-danger)', color: 'var(--ad-danger)' }}>
                  Sil
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
