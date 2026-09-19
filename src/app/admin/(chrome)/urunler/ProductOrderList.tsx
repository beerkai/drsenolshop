'use client'

// ═══════════════════════════════════════════════════════════════
// Ürün listesi — sıralama modu
// Normal modda tablo salt okunur; "Sırala" açıkken satırlar yukarı/
// aşağı taşınır ve Kaydet POST /api/admin/products/reorder'a gider.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ListedProduct } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { Badge } from '@/components/admin/ui/Badge'
import { IconStar, IconArrowRight } from '@/components/admin/ui/Icon'
import { toast } from '@/components/admin/toast/toast'

export default function ProductOrderList({
  products: initial,
  canReorder,
}: {
  products: ListedProduct[]
  /** display_order kolonu yoksa sıralama kapalı gelir */
  canReorder: boolean
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [sorting, setSorting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= products.length) return
    setProducts((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setDirty(true)
  }

  async function saveOrder() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: products.map((p) => p.id) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Sıra kaydedilemedi.')
        return
      }
      toast.success('Katalog sırası kaydedildi.')
      setDirty(false)
      setSorting(false)
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setProducts(initial)
    setDirty(false)
    setSorting(false)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {canReorder ? (
          sorting ? (
            <>
              <button
                type="button"
                className="ad-btn ad-btn-primary ad-btn-sm"
                onClick={saveOrder}
                disabled={saving || !dirty}
              >
                {saving ? 'Kaydediliyor…' : 'Sırayı Kaydet'}
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onClick={cancel}>
                Vazgeç
              </button>
              <span className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
                Sıra bu sayfadaki ürünlere uygulanır.
              </span>
            </>
          ) : (
            <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onClick={() => setSorting(true)}>
              Sırala
            </button>
          )
        ) : null}
      </div>

      {!canReorder ? (
        <div className="ad-schema-banner" role="status">
          <strong style={{ color: 'var(--ad-fg)' }}>Katalog sıralaması kapalı.</strong>{' '}
          Veritabanında <code>products.display_order</code> kolonu yok — Supabase&apos;de{' '}
          <code>0018_admin_content.sql</code> (veya <code>EKSIK_MIGRATIONS.sql</code>) çalıştırın.
          Ürünler ada göre listeleniyor.
        </div>
      ) : null}

      <div className="ad-table-wrap">
        <table className="ad-table ad-table-mobile">
          <thead>
            <tr>
              {sorting ? <th style={{ width: 84 }}>Sıra</th> : null}
              <th>Ürün</th>
              <th>Kategori</th>
              <th className="is-right">Fiyat</th>
              <th className="is-right">KDV</th>
              <th className="is-right">Stok</th>
              <th>Durum</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const isLow = (p.stock_quantity ?? 0) <= 5 && (p.stock_quantity ?? 0) > 0
              const isOut = (p.stock_quantity ?? 0) <= 0 && p.variants_count === 0
              return (
                <tr key={p.id}>
                  {sorting ? (
                    <td>
                      <div className="ad-image-tools" style={{ marginTop: 0 }}>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Yukarı">
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === products.length - 1}
                          title="Aşağı"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  ) : null}
                  <td className="is-row-head" data-label="Ürün">
                    <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: 0, fontWeight: 500 }}>{p.name}</p>
                    <p
                      className="ad-mono"
                      style={{ fontSize: '10.5px', color: 'var(--ad-fg-faint)', margin: '2px 0 0', letterSpacing: '0.05em' }}
                    >
                      {p.slug}
                    </p>
                  </td>
                  <td data-label="Kategori" style={{ color: 'var(--ad-fg-muted)' }}>{p.category_name ?? '—'}</td>
                  <td className="is-right" data-label="Fiyat">
                    {p.base_price !== null && p.base_price > 0 ? (
                      <span className="ad-display" style={{ fontSize: '16px', fontWeight: 500 }}>
                        {formatPrice(p.base_price)}
                      </span>
                    ) : p.variants_count > 0 ? (
                      <span
                        className="ad-mono"
                        style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                      >
                        varyantta
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ad-fg-faint)' }}>—</span>
                    )}
                  </td>
                  <td className="is-right ad-mono" data-label="KDV" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)' }}>
                    %{p.tax_rate ?? 0}
                  </td>
                  <td
                    className="is-right ad-mono"
                    data-label="Stok"
                    style={{
                      fontSize: '12px',
                      color: isOut ? 'var(--ad-danger)' : isLow ? 'var(--ad-warning)' : 'var(--ad-fg)',
                    }}
                  >
                    {p.variants_count > 0 ? (
                      <span style={{ color: 'var(--ad-fg-faint)', fontSize: '10.5px', letterSpacing: '0.05em' }}>
                        {p.variants_count} varyant
                      </span>
                    ) : (
                      (p.stock_quantity ?? 0)
                    )}
                  </td>
                  <td data-label="Durum">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Aktif' : 'Pasif'}</Badge>
                      {p.is_featured && (
                        <Badge tone="gold">
                          <IconStar size={10} />
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="is-right" data-label="">
                    <Link href={`/admin/urunler/${p.id}`} className="ad-btn ad-btn-secondary ad-btn-sm">
                      Düzenle <IconArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
