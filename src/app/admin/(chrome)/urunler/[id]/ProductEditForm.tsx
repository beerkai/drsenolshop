'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductWithRelations } from '@/types'
import { formatPrice, getVariantLabel } from '@/types'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#F4F0E8',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
}
const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains)',
  fontSize: '9px',
  letterSpacing: '0.22em',
  color: '#6E665A',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {/* Durum */}
      <div style={{ backgroundColor: '#141210', padding: '20px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Yayın Durumu
        </p>
        <ToggleRow label="Aktif (sitede görünür)" checked={isActive} onChange={setIsActive} />
        <ToggleRow label="Öne Çıkan (anasayfa vitrini)" checked={isFeatured} onChange={setIsFeatured} />
      </div>

      {/* Fiyat & KDV */}
      <div style={{ backgroundColor: '#141210', padding: '20px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Fiyat & KDV
        </p>
        <div style={{ marginBottom: '12px' }}>
          <label style={LABEL_STYLE}>Temel Fiyat (TL)</label>
          <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} style={INPUT_STYLE}
            disabled={hasVariants} placeholder={hasVariants ? 'Varyant fiyatları aşağıda' : ''} />
          {hasVariants && (
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#6E665A', marginTop: '4px' }}>
              Varyant ürünlerde temel fiyat kullanılmaz.
            </p>
          )}
        </div>
        <div>
          <label style={LABEL_STYLE}>KDV Oranı (%)</label>
          <input type="number" step="0.01" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} style={INPUT_STYLE} />
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#6E665A', marginTop: '4px' }}>
            Gıda: 1, kozmetik: 20. KDV fiyata dahil hesaplanır.
          </p>
        </div>
      </div>

      {/* Stok — varyant yoksa */}
      {!hasVariants && (
        <div style={{ backgroundColor: '#141210', padding: '20px' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Stok
          </p>
          <div>
            <label style={LABEL_STYLE}>Adet</label>
            <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} style={INPUT_STYLE} />
          </div>
        </div>
      )}

      {/* Varyant stokları */}
      {hasVariants && (
        <div style={{ backgroundColor: '#141210', padding: '20px', gridColumn: '1 / -1' }}>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Varyantlar
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(244,240,232,0.08)' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase' }}>Etiket</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase' }}>Fiyat</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase' }}>Stok</th>
                </tr>
              </thead>
              <tbody>
                {(product.variants ?? []).map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(244,240,232,0.04)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <p style={{ color: '#F4F0E8', fontSize: '13px', margin: 0 }}>{getVariantLabel(v)}</p>
                      {v.is_active === false && (
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#C8472D', textTransform: 'uppercase', letterSpacing: '0.15em' }}>pasif</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#B8B0A0', fontFamily: 'var(--font-cormorant)', fontSize: '15px' }}>
                      {formatPrice(v.price ?? 0)}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <input
                        type="number"
                        min="0"
                        value={variantStocks[v.id] ?? ''}
                        onChange={(e) => setVariantStocks((prev) => ({ ...prev, [v.id]: e.target.value }))}
                        style={{ ...INPUT_STYLE, width: '100px', textAlign: 'right', padding: '8px 10px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save bar — full width */}
      <div style={{ gridColumn: '1 / -1', position: 'sticky', bottom: 0, backgroundColor: '#0A0908', paddingTop: '16px', paddingBottom: '8px' }}>
        {message && (
          <div style={{
            padding: '10px 12px',
            fontSize: '12px',
            marginBottom: '12px',
            border: '1px solid ' + (message.type === 'ok' ? 'rgba(92,122,63,0.4)' : '#C8472D'),
            color: message.type === 'ok' ? '#A6C481' : '#F4F0E8',
            backgroundColor: message.type === 'ok' ? 'rgba(92,122,63,0.08)' : 'rgba(200,71,45,0.08)',
          }}>
            {message.text}
          </div>
        )}
        <button type="button" onClick={handleSave} disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: saving ? '#9C7C3C' : '#C9A961',
            color: '#0A0908',
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: saving ? 'wait' : 'pointer',
          }}>
          {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer' }}>
      <span style={{
        display: 'inline-block',
        width: '36px',
        height: '20px',
        backgroundColor: checked ? '#C9A961' : 'rgba(244,240,232,0.12)',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '16px',
          height: '16px',
          backgroundColor: '#0A0908',
          transition: 'left 0.2s',
        }} />
      </span>
      <span style={{ color: '#F4F0E8', fontSize: '13px' }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  )
}
