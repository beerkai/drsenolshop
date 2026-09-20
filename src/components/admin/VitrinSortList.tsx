'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ListedProduct, VitrinSortMode } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { toast } from '@/components/admin/toast/toast'

const MODE_LABEL: Record<VitrinSortMode, string> = {
  harvest: 'En Yeni Hasat',
  featured: 'Öne Çıkanlar',
  catalog: 'Genel katalog (display_order)',
}

export default function VitrinSortList({
  products: initial,
  mode,
  sortReady,
}: {
  products: ListedProduct[]
  mode: VitrinSortMode
  sortReady: boolean
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const reorder = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= products.length || to >= products.length) return
    setProducts((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setDirty(true)
  }, [products.length])

  async function saveOrder() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: products.map((p) => p.id), mode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Sıra kaydedilemedi.')
        return
      }
      toast.success(`${MODE_LABEL[mode]} sırası kaydedildi.`)
      setDirty(false)
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setProducts(initial)
    setDirty(false)
  }

  if (!sortReady) {
    return (
      <p className="ad-mono" style={{ fontSize: 12, color: 'var(--ad-warning)' }}>
        Sıralama kolonları veritabanında yok. Supabase&apos;de{' '}
        <code>0024_product_harvest_featured_sort.sql</code> migration&apos;ını çalıştırın.
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <button
          type="button"
          className="ad-btn ad-btn-primary ad-btn-sm"
          onClick={saveOrder}
          disabled={saving || !dirty}
        >
          {saving ? 'Kaydediliyor…' : 'Sırayı Kaydet'}
        </button>
        <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onClick={reset} disabled={!dirty}>
          Geri Al
        </button>
        {dirty ? <span className="ad-badge ad-badge-warning">Kaydedilmemiş</span> : null}
        <span className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)' }}>
          Satırları sürükleyip bırakın veya ↑↓ kullanın.
        </span>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {products.map((p, index) => (
          <li
            key={p.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) reorder(dragIndex, index)
              setDragIndex(null)
            }}
            onDragEnd={() => setDragIndex(null)}
            className="ad-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              marginBottom: 8,
              cursor: 'grab',
              opacity: dragIndex === index ? 0.55 : 1,
            }}
          >
            <span className="ad-mono" style={{ width: 28, fontSize: 11, color: 'var(--ad-fg-faint)' }}>
              {index + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-muted)' }}>
                {p.category_name ?? '—'} · {p.is_active ? 'aktif' : 'pasif'}
                {p.is_featured ? ' · öne çıkan' : ''}
              </div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--ad-fg-muted)' }}>
              {p.base_price != null ? formatPrice(p.base_price) : '—'}
            </span>
            <div className="ad-image-tools" style={{ marginTop: 0 }}>
              <button type="button" onClick={() => reorder(index, index - 1)} disabled={index === 0} title="Yukarı">
                ↑
              </button>
              <button
                type="button"
                onClick={() => reorder(index, index + 1)}
                disabled={index === products.length - 1}
                title="Aşağı"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
