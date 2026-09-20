'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

export interface AdminProductOption {
  id: string
  name: string
  slug: string
}

const emptyForm = {
  product_id: '',
  customer_name: '',
  customer_email: '',
  rating: '5',
  title: '',
  body: '',
  is_verified_purchase: false,
  is_approved: true,
  created_at: '',
}

export default function AdminReviewComposer({ products }: { products: AdminProductOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function reset() {
    setForm(emptyForm)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    if (!form.product_id) {
      toast.error('Ürün seçin.')
      return
    }
    if (!form.customer_name.trim()) {
      toast.error('Görünen isim zorunlu.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: form.product_id,
          customer_name: form.customer_name,
          customer_email: form.customer_email.trim() || null,
          rating: Number(form.rating),
          title: form.title.trim() || null,
          body: form.body.trim() || null,
          is_verified_purchase: form.is_verified_purchase,
          is_approved: form.is_approved,
          created_at: form.created_at ? new Date(form.created_at).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Eklenemedi.')
      } else {
        toast.success('Değerlendirme eklendi.')
        reset()
        setOpen(false)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ad-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '4px' }}>Vitrin</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ad-fg-muted)', maxWidth: '520px' }}>
            Mağazada müşteri yorumu ile aynı görünür; yalnız bu panelde &quot;Vitrin yorumu&quot; etiketi görünür.
          </p>
        </div>
        <button
          type="button"
          className="ad-btn ad-btn-primary"
          style={{ fontSize: '11px' }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Formu kapat' : 'Yeni değerlendirme'}
        </button>
      </div>

      {open ? (
        <form onSubmit={submit} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--ad-line-faint)' }}>
          <ReviewFormFields products={products} form={form} setForm={setForm} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button type="submit" className="ad-btn ad-btn-primary" disabled={saving} style={{ fontSize: '11px' }}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            <button type="button" className="ad-btn" style={{ fontSize: '11px' }} onClick={reset} disabled={saving}>
              Temizle
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

export type ReviewFormState = typeof emptyForm

export function ReviewFormFields({
  products,
  form,
  setForm,
}: {
  products: AdminProductOption[]
  form: ReviewFormState
  setForm: React.Dispatch<React.SetStateAction<ReviewFormState>>
}) {
  const fieldLabel: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-jetbrains)',
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--ad-fg-faint)',
    marginBottom: '6px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    border: '1px solid var(--ad-line-strong)',
    background: 'var(--ad-bg)',
    color: 'var(--ad-fg)',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={fieldLabel}>Ürün</label>
        <select
          required
          value={form.product_id}
          onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
          style={inputStyle}
        >
          <option value="">Seçin…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={fieldLabel}>Görünen isim</label>
        <input
          required
          maxLength={80}
          value={form.customer_name}
          onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
          style={inputStyle}
          placeholder="Ayşe K."
        />
      </div>
      <div>
        <label style={fieldLabel}>E-posta (opsiyonel)</label>
        <input
          type="email"
          maxLength={120}
          value={form.customer_email}
          onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))}
          style={inputStyle}
          placeholder="Boş bırakılırsa dahili adres"
        />
      </div>
      <div>
        <label style={fieldLabel}>Puan</label>
        <select
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          style={inputStyle}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              {n} yıldız
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={fieldLabel}>Görünen tarih</label>
        <input
          type="datetime-local"
          value={form.created_at}
          onChange={(e) => setForm((f) => ({ ...f, created_at: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={fieldLabel}>Başlık (opsiyonel)</label>
        <input
          maxLength={120}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={fieldLabel}>Yorum metni</label>
        <textarea
          maxLength={2000}
          rows={4}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '96px' }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ad-fg-muted)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.is_verified_purchase}
          onChange={(e) => setForm((f) => ({ ...f, is_verified_purchase: e.target.checked }))}
        />
        Doğrulanmış alışveriş rozeti
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ad-fg-muted)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.is_approved}
          onChange={(e) => setForm((f) => ({ ...f, is_approved: e.target.checked }))}
        />
        Hemen yayında (onaylı)
      </label>
    </div>
  )
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function reviewRowToFormState(r: {
  product_id: string
  customer_name: string | null
  customer_email: string
  rating: number
  title: string | null
  body: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
}): ReviewFormState {
  const internalEmail = r.customer_email.includes('@reviews.internal.drsenol.shop')
  return {
    product_id: r.product_id,
    customer_name: r.customer_name ?? '',
    customer_email: internalEmail ? '' : r.customer_email,
    rating: String(r.rating),
    title: r.title ?? '',
    body: r.body ?? '',
    is_verified_purchase: r.is_verified_purchase,
    is_approved: r.is_approved,
    created_at: toDatetimeLocal(r.created_at),
  }
}
