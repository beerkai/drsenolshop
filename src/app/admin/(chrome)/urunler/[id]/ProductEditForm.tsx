'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category, ProductWithRelations } from '@/types'
import { formatPrice, getVariantLabel } from '@/types'
import { toast } from '@/components/admin/toast/toast'
import ProductImageManager from './ProductImageManager'

export default function ProductEditForm({
  product,
  categories = [],
}: {
  product: ProductWithRelations
  categories?: Category[]
}) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(product.is_active !== false)
  const [isFeatured, setIsFeatured] = useState(product.is_featured === true)
  const [basePrice, setBasePrice] = useState(product.base_price?.toString() ?? '')
  const [stockQuantity, setStockQuantity] = useState(product.stock_quantity?.toString() ?? '')
  const [taxRate, setTaxRate] = useState(product.tax_rate?.toString() ?? '0')
  const [isNew, setIsNew] = useState(product.is_new === true)

  // İçerik alanları
  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [shortDesc, setShortDesc] = useState(product.short_desc ?? '')
  const [longDesc, setLongDesc] = useState(product.long_desc ?? product.description ?? '')
  const [categoryId, setCategoryId] = useState(product.category_id ?? '')
  const [badge, setBadge] = useState(product.badge ?? '')
  const [sku, setSku] = useState(product.sku ?? '')
  const [weight, setWeight] = useState(product.weight_grams?.toString() ?? '')
  const [tagsText, setTagsText] = useState((product.tags ?? []).join(', '))
  const [metaTitle, setMetaTitle] = useState(product.meta_title ?? '')
  const [metaDesc, setMetaDesc] = useState(product.meta_description ?? '')
  const [displayOrder, setDisplayOrder] = useState(product.display_order?.toString() ?? '')
  const [images, setImages] = useState<string[]>(product.images ?? [])

  // Varyant stokları
  const [variantStocks, setVariantStocks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const v of product.variants ?? []) {
      initial[v.id] = (v.stock_quantity ?? v.stock ?? 0).toString()
    }
    return initial
  })

  const [variantImages, setVariantImages] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {}
    for (const v of product.variants ?? []) {
      initial[v.id] = (v.images ?? []).map((u) => String(u).trim()).filter(Boolean)
    }
    return initial
  })

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          is_featured: isFeatured,
          is_new: isNew,
          name,
          slug,
          short_desc: shortDesc,
          long_desc: longDesc,
          category_id: categoryId,
          badge,
          sku,
          weight_grams: weight === '' ? null : Number(weight),
          tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
          meta_title: metaTitle,
          meta_description: metaDesc,
          display_order: displayOrder === '' ? null : Number(displayOrder),
          images,
          base_price: basePrice === '' ? null : Number(basePrice),
          stock_quantity: stockQuantity === '' ? null : Number(stockQuantity),
          tax_rate: taxRate === '' ? 0 : Number(taxRate),
          variant_stocks: variantStocks,
          variant_images: variantImages,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncelleme başarısız.')
      } else {
        toast.success(`${product.name} güncellendi.`)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
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
        <ToggleRow label="Yeni" hint="Katalogda yeni rozeti" checked={isNew} onChange={setIsNew} />
        <div style={{ marginTop: '12px' }}>
          <label className="ad-label">Katalog Sırası</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="ad-input"
            placeholder="Boş = sona"
          />
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
            Küçük sayı önce gelir. Toplu sıralama ürün listesinden yapılır.
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div className="ad-card" style={{ gridColumn: '1 / -1' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>İçerik</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label className="ad-label">Ürün Adı</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="ad-input" />
            <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
              /urun/{slug || '…'} — değiştirirseniz eski bağlantılar kırılır.
            </p>
          </div>
          <div>
            <label className="ad-label">Kategori</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ad-select">
              <option value="">— Kategorisiz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="ad-label">Rozet</label>
            <input value={badge} onChange={(e) => setBadge(e.target.value)} className="ad-input" placeholder="Örn. Sınırlı Hasat" />
          </div>
          <div>
            <label className="ad-label">Stok Kodu (SKU)</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Ağırlık (gram)</label>
            <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} className="ad-input" />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label className="ad-label">Kısa Açıklama</label>
          <textarea rows={2} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="ad-textarea" />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label className="ad-label">Uzun Açıklama</label>
          <textarea rows={8} value={longDesc} onChange={(e) => setLongDesc(e.target.value)} className="ad-textarea" />
        </div>

        <div>
          <label className="ad-label">Etiketler</label>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="ad-input" placeholder="virgülle ayırın" />
        </div>
      </div>

      {/* Görseller — varyant yoksa veya genel galeri */}
      <div className="ad-card" style={{ gridColumn: '1 / -1' }}>
        <ProductImageManager
          productId={product.id}
          initialImages={images}
          onChange={setImages}
          eyebrow={hasVariants ? 'Genel görseller (fallback)' : 'Görseller'}
        />
        {hasVariants ? (
          <p className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)', marginTop: 12, letterSpacing: '0.05em' }}>
            Varyantlı ürünlerde müşteri galerisi önce aşağıdaki varyant görsellerini kullanır; boşsa genel liste gösterilir.
          </p>
        ) : null}
      </div>

      {/* SEO */}
      <div className="ad-card" style={{ gridColumn: '1 / -1' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '16px' }}>Arama Motoru</p>
        <div style={{ marginBottom: '12px' }}>
          <label className="ad-label">Meta Başlık</label>
          <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="ad-input" />
        </div>
        <div>
          <label className="ad-label">Meta Açıklama</label>
          <textarea rows={2} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="ad-textarea" />
        </div>
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

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="ad-eyebrow" style={{ margin: 0 }}>
              Varyant görselleri
            </p>
            {(product.variants ?? []).map((v) => (
              <div
                key={v.id}
                style={{
                  padding: '16px',
                  border: '1px solid var(--ad-line-faint)',
                  backgroundColor: 'var(--ad-surface)',
                }}
              >
                <ProductImageManager
                  productId={product.id}
                  variantId={v.id}
                  initialImages={variantImages[v.id] ?? []}
                  onChange={(next) => setVariantImages((prev) => ({ ...prev, [v.id]: next }))}
                  eyebrow={`${getVariantLabel(v)} galerisi`}
                  showCoverBadge={false}
                />
              </div>
            ))}
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
            backgroundColor: checked ? 'var(--ad-primary)' : 'var(--ad-surface)',
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
