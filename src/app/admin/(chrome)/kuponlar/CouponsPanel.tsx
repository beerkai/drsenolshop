'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

export interface CouponRow {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_subtotal: number
  max_uses: number
  used_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

function formatDateOnly(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function formatDiscount(c: CouponRow): string {
  return c.discount_type === 'percent'
    ? `%${c.discount_value}`
    : `${c.discount_value} TL`
}

export default function CouponsPanel({ initial }: { initial: CouponRow[] }) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '10',
    min_subtotal: '0',
    max_uses: '0',
    valid_until: '',
  })
  const [pending, setPending] = useState<Set<string>>(new Set())

  function reset() {
    setForm({ code: '', description: '', discount_type: 'percent', discount_value: '10', min_subtotal: '0', max_uses: '0', valid_until: '' })
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_subtotal: Number(form.min_subtotal),
          max_uses: Number(form.max_uses),
          valid_until: form.valid_until || null,
          is_active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Oluşturulamadı.')
      } else {
        toast.success('Kupon oluşturuldu.')
        reset()
        router.refresh()
      }
    } catch { toast.error('Ağ hatası.') }
    finally { setCreating(false) }
  }

  async function toggle(c: CouponRow) {
    if (pending.has(c.id)) return
    setPending((s) => new Set(s).add(c.id))
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !c.is_active }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) toast.error(data.message ?? 'Güncellenemedi.')
      else { toast.success(c.is_active ? 'Pasifleştirildi.' : 'Aktifleştirildi.'); router.refresh() }
    } catch { toast.error('Ağ hatası.') }
    finally { setPending((s) => { const n = new Set(s); n.delete(c.id); return n }) }
  }

  async function remove(c: CouponRow) {
    if (pending.has(c.id)) return
    if (!confirm(`"${c.code}" kuponunu silmek istediğinize emin misiniz?`)) return
    setPending((s) => new Set(s).add(c.id))
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) toast.error(data.message ?? 'Silinemedi.')
      else { toast.success('Silindi.'); router.refresh() }
    } catch { toast.error('Ağ hatası.') }
    finally { setPending((s) => { const n = new Set(s); n.delete(c.id); return n }) }
  }

  return (
    <>
      {/* Yeni kupon */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '12px' }}>Yeni Kupon</p>
        <form onSubmit={createCoupon}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="ad-label">Kod</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="HOSGELDIN10"
                className="ad-input ad-mono"
                style={{ letterSpacing: '0.08em' }}
                required
              />
            </div>
            <div>
              <label className="ad-label">Tip</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                className="ad-input"
              >
                <option value="percent">Yüzde</option>
                <option value="fixed">Sabit TL</option>
              </select>
            </div>
            <div>
              <label className="ad-label">{form.discount_type === 'percent' ? 'Yüzde (%)' : 'TL'}</label>
              <input
                type="number" min="0" step="0.01" max={form.discount_type === 'percent' ? 100 : undefined}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                className="ad-input ad-mono"
                required
              />
            </div>
            <div>
              <label className="ad-label">Min. Sepet (TL)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.min_subtotal}
                onChange={(e) => setForm((f) => ({ ...f, min_subtotal: e.target.value }))}
                className="ad-input ad-mono"
              />
            </div>
            <div>
              <label className="ad-label">Max. Kullanım (0 = sınırsız)</label>
              <input
                type="number" min="0" step="1"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                className="ad-input ad-mono"
              />
            </div>
            <div>
              <label className="ad-label">Bitiş (opsiyonel)</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                className="ad-input ad-mono"
              />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label className="ad-label">Açıklama (opsiyonel)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Hoş geldin indirimi"
              className="ad-input"
            />
          </div>
          <button type="submit" disabled={creating} className="ad-btn ad-btn-primary">
            {creating ? 'Kaydediliyor…' : 'Kupon oluştur'}
          </button>
        </form>
      </div>

      {/* Liste */}
      {initial.length === 0 ? (
        <div className="ad-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '14px' }}>Henüz kupon yok.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {initial.map((c) => (
            <article key={c.id} className="ad-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className="ad-mono" style={{ fontSize: '14px', color: 'var(--ad-fg)', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {c.code}
                    </span>
                    <span className="ad-mono" style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: c.is_active ? '#7AAD8B' : '#D17B6A' }}>
                      {c.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  {c.description && (
                    <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '4px 0' }}>{c.description}</p>
                  )}
                  <p className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)', margin: 0 }}>
                    {formatDiscount(c)} · min {c.min_subtotal} TL · {c.used_count}/{c.max_uses || '∞'} kullanım · bitiş {formatDateOnly(c.valid_until)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => toggle(c)} disabled={pending.has(c.id)} className="ad-btn" style={{ fontSize: '11px' }}>
                    {c.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button type="button" onClick={() => remove(c)} disabled={pending.has(c.id)} className="ad-btn" style={{ fontSize: '11px', borderColor: 'rgba(209,123,106,0.4)', color: '#D17B6A' }}>
                    Sil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
