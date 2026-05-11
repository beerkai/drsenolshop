'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductWithRelations } from '@/types'
import { formatPrice, getVariantLabel } from '@/types'

export default function ProductEditForm({ product }: { product: ProductWithRelations }) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(product.is_active !== false)
  const [isFeatured, setIsFeatured] = useState(product.is_featured === true)
  const [basePrice, setBasePrice] = useState(product.base_price?.toString() ?? '')
  const [stockQuantity, setStockQuantity] = useState(product.stock_quantity?.toString() ?? '')
  const [taxRate, setTaxRate] = useState(product.tax_rate?.toString() ?? '0')

  // Varyant stokları
  const [variantStocks, setVariantStocks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const v of product.variants ?? []) {
      initial[v.id] = (v.stock_quantity ?? v.stock ?? 0).toString()
    }
    return initial
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          is_featured: isFeatured,
          base_price: basePrice === '' ? null : Number(basePrice),
          stock_quantity: stockQuantity === '' ? null : Number(stockQuantity),
          tax_rate: taxRate === '' ? 0 : Number(taxRate),
          variant_stocks: variantStocks,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setMessage({ type: 'error', text: data.message ?? 'Güncelleme başarısız.' })
      } else {
        setMessage({ type: 'ok', text: 'Kaydedildi.' })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'Ağ hatası.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const hasVariants = (product.variants?.length ?? 0) > 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {/* Durum */}
      <div className="ad-card">
        <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>Yayın Durumu</p>
        <ToggleRow label="Aktif" hint="Sitede görünür" checked={isActive} onChange={setIsActive} />
        <ToggleRow label="Öne Çıkan" hint="Anasayfa vitrininde göster" checked={isFeatured} onChange={setIsFeatured} />
      </div>

      {/* Fiyat & KDV */}
      <div className="ad-card">
        <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>Fiyat & KDV</p>
        <div style={{ marginBottom: '12px' }}>
          <label className="ad-label">Temel Fiyat (TL)</label>
          <input
            type="number"
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="ad-input"
            disabled={hasVariants}
            placeholder={hasVariants ? 'Varyant fiyatları aşağıda' : ''}
          />
          {hasVariants && (
            <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
              Varyant ürünlerde temel fiyat kullanılmaz.
            </p>
          )}
        </div>
        <div>
          <label className="ad-label">KDV Oranı (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="ad-input"
          />
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
            Gıda: 1 · Kozmetik: 20 · KDV fiyata dahil hesaplanır.
          </p>
        </div>
      </div>

      {/* Stok — varyant yoksa */}
      {!hasVariants && (
        <div className="ad-card">
          <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>Stok</p>
          <div>
            <label className="ad-label">Adet</label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="ad-input"
            />
          </div>
        </div>
      )}

      {/* Varyant stokları */}
      {hasVariants && (
        <div className="ad-card" style={{ gridColumn: '1 / -1' }}>
          <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>Varyantlar</p>
          <div className="ad-table-wrap" style={{ border: '1px solid var(--ad-line-faint)' }}>
            <table className="ad-table" style={{ minWidth: '420px' }}>
              <thead>
                <tr>
                  <th>Etiket</th>
                  <th className="is-right">Fiyat</th>
                  <th className="is-right">Stok</th>
                </tr>
              </thead>
              <tbody>
                {(product.variants ?? []).map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span style={{ color: 'var(--ad-fg)' }}>{getVariantLabel(v)}</span>
                      {v.is_active === false && (
                        <span
                          className="ad-mono"
                          style={{
                            marginLeft: '8px',
                            fontSize: '9px',
                            color: 'var(--ad-danger)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                          }}
                        >
                          pasif
                        </span>
                      )}
                    </td>
                    <td className="is-right">
                      <span className="ad-display" style={{ fontSize: '15px', color: 'var(--ad-fg)' }}>
                        {formatPrice(v.price ?? 0)}
                      </span>
                    </td>
                    <td className="is-right">
                      <input
                        type="number"
                        min="0"
                        value={variantStocks[v.id] ?? ''}
                        onChange={(e) => setVariantStocks((prev) => ({ ...prev, [v.id]: e.target.value }))}
                        className="ad-input"
                        style={{ width: '100px', textAlign: 'right', padding: '8px 10px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div
        style={{
          gridColumn: '1 / -1',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--ad-bg)',
          paddingTop: '12px',
          paddingBottom: '8px',
          marginTop: '8px',
        }}
      >
        {message && (
          <div
            role="alert"
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              marginBottom: '12px',
              border: `1px solid ${message.type === 'ok' ? 'var(--ad-success)' : 'var(--ad-danger)'}`,
              color: message.type === 'ok' ? 'var(--ad-success)' : 'var(--ad-danger)',
              backgroundColor: message.type === 'ok' ? 'var(--ad-success-faint)' : 'var(--ad-danger-faint)',
            }}
          >
            {message.text}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ad-btn ad-btn-primary"
          style={{ width: '100%', minHeight: '46px' }}
        >
          {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 0',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '36px',
          height: '20px',
          backgroundColor: checked ? 'var(--ad-gold)' : 'var(--ad-line)',
          position: 'relative',
          transition: 'background-color 160ms',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '16px',
            height: '16px',
            backgroundColor: checked ? '#0A0908' : 'var(--ad-surface)',
            transition: 'left 160ms, background-color 160ms',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ color: 'var(--ad-fg)', fontSize: '13px', display: 'block' }}>{label}</span>
        {hint && (
          <span
            className="ad-mono"
            style={{
              fontSize: '10px',
              color: 'var(--ad-fg-faint)',
              letterSpacing: '0.05em',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {hint}
          </span>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  )
}
