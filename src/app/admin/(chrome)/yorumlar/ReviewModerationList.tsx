'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

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
}

type Filter = 'pending' | 'approved' | 'all'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function ReviewModerationList({ initial }: { initial: AdminReviewRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('pending')
  const [pending, setPending] = useState<Set<string>>(new Set())

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
                    <span style={{ color: '#C9A961', fontSize: '14px', letterSpacing: '1px' }}>
                      {'★'.repeat(r.rating)}<span style={{ color: '#3A3530' }}>{'★'.repeat(5 - r.rating)}</span>
                    </span>
                    {r.is_verified_purchase && (
                      <span className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7AAD8B', border: '1px solid rgba(122,173,139,0.4)', padding: '2px 6px' }}>
                        ✓ Alışveriş
                      </span>
                    )}
                    <span className={r.is_approved ? '' : ''} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: r.is_approved ? '#7AAD8B' : '#C9A961' }}>
                      {r.is_approved ? 'Onaylı' : 'Bekliyor'}
                    </span>
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
                    <a href={`/urun/${r.product_slug}`} target="_blank" rel="noopener" style={{ color: '#C9A961', textDecoration: 'none' }}>
                      {r.product_name ?? r.product_slug} ↗
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--ad-line-faint)' }}>
                {r.is_approved ? (
                  <button type="button" onClick={() => setApproved(r.id, false)} disabled={pending.has(r.id)} className="ad-btn" style={{ fontSize: '11px' }}>
                    Onayı kaldır
                  </button>
                ) : (
                  <button type="button" onClick={() => setApproved(r.id, true)} disabled={pending.has(r.id)} className="ad-btn ad-btn-primary" style={{ fontSize: '11px' }}>
                    Onayla
                  </button>
                )}
                <button type="button" onClick={() => deleteReview(r.id)} disabled={pending.has(r.id)} className="ad-btn" style={{ fontSize: '11px', borderColor: 'rgba(209,123,106,0.4)', color: '#D17B6A' }}>
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
