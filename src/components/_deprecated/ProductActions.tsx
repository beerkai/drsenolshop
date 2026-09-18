'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import type { ProductWithRelations } from '@/types'
import {
  getProductStartingPrice,
  getVariantPrice,
  getVariantLabel,
  getVariantStock,
  findDefaultVariant,
  formatPrice,
  isProductInStock,
  getProductImage,
} from '@/types'

interface Props {
  product: ProductWithRelations
}

export default function ProductActions({ product }: Props) {
  const { dispatch, openCart } = useCart()
  const variants = product.variants ?? []
  const defaultVar = findDefaultVariant(variants)
  const [selectedId, setSelectedId] = useState<string | null>(defaultVar?.id ?? null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const selected = variants.find(v => v.id === selectedId) ?? defaultVar ?? null
  const priceData = selected ? getVariantPrice(selected) : getProductStartingPrice(product)
  const inStock = selected
    ? selected.is_active !== false && getVariantStock(selected) > 0
    : isProductInStock(product)

  const selectedStock = selected ? getVariantStock(selected) : (product.stock_quantity ?? 0)
  const isLowStock = inStock && selectedStock > 0 && selectedStock <= 5

  const hasVariants = variants.length > 1
  const hasDiscount = (priceData?.discount ?? 0) > 0

  function handleAdd() {
    if (!inStock) return
    dispatch({
      type: 'ADD',
      quantity: qty,
      item: {
        productId: product.id,
        variantId: selected?.id ?? null,
        name: product.name,
        slug: product.slug,
        image: getProductImage(product),
        price: priceData?.current ?? 0,
        variantLabel: selected ? getVariantLabel(selected) : null,
      },
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div>
      <style>{`
        .pa-title { font-size: clamp(22px, 5vw, 40px); }
        .pa-price { font-size: clamp(24px, 6vw, 36px); }
        @media (max-width: 640px) {
          .pa-eyebrow { margin-bottom: 12px !important; }
          .pa-title { margin-bottom: 14px !important; }
          .pa-shortdesc { margin-bottom: 20px !important; font-size: clamp(13px, 2.5vw, 14px) !important; line-height: 1.6 !important; }
          .pa-divider { margin-bottom: 20px !important; }
          .pa-price-row { margin-bottom: 22px !important; }
          .pa-variants { margin-bottom: 20px !important; }
          .pa-qty-row { margin-bottom: 14px !important; justify-content: center !important; }
          .pa-cta { margin-bottom: 20px !important; }
        }
      `}</style>

      {/* Kategori eyebrow */}
      {product.category && (
        <p className="pa-eyebrow" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.3em', color: 'var(--color-gold)', textTransform: 'uppercase', margin: '0 0 18px' }}>
          {product.category.name}
        </p>
      )}

      {/* Ürün adı */}
      <h1 className="pa-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', margin: '0 0 20px' }}>
        {product.name}
      </h1>

      {/* Kısa açıklama */}
      {product.short_desc && (
        <p className="pa-shortdesc" style={{ color: 'var(--color-cream-muted)', fontSize: 'clamp(13px, 2.5vw, 15px)', lineHeight: 1.6, margin: '0 0 28px' }}>
          {product.short_desc}
        </p>
      )}

      {/* Altın çizgi */}
      <div className="pa-divider" style={{ width: '36px', height: '1px', backgroundColor: 'var(--color-gold)', margin: '0 0 28px' }} />

      {/* Fiyat */}
      <div className="pa-price-row" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', margin: '0 0 32px' }}>
        {priceData ? (
          <>
            <span className="pa-price" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontWeight: 500, lineHeight: 1 }}>
              {formatPrice(priceData.current)}
            </span>
            {hasDiscount && priceData.original && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-cream-faint)', textDecoration: 'line-through' }}>
                  {formatPrice(priceData.original)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--color-ink)', backgroundColor: 'var(--color-gold)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  %{priceData.discount} İndirim
                </span>
              </>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--color-cream-faint)', fontSize: '14px' }}>Fiyat bilgisi yok</span>
        )}
      </div>

      {/* Varyantlar */}
      {hasVariants && (
        <div className="pa-variants" style={{ margin: '0 0 28px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.25em', color: 'var(--color-cream-faint)', textTransform: 'uppercase', margin: '0 0 12px' }}>
            {variants[0].variant_type ?? 'Seçenek'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {variants.map(v => {
              const vStock = getVariantStock(v)
              const available = v.is_active !== false && vStock > 0
              const isSelected = v.id === selectedId
              return (
                <button key={v.id} type="button" onClick={() => available && setSelectedId(v.id)} disabled={!available}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    padding: '10px 18px',
                    border: isSelected ? '1px solid var(--color-gold)' : '1px solid rgba(244,240,232,0.15)',
                    color: isSelected ? 'var(--color-gold)' : available ? 'var(--color-cream)' : '#3A3530',
                    backgroundColor: isSelected ? 'rgba(201,169,97,0.08)' : 'transparent',
                    cursor: available ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    opacity: available ? 1 : 0.35,
                    textDecoration: !available ? 'line-through' : 'none',
                  }}>
                  {getVariantLabel(v)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stok uyarısı */}
      {isLowStock && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-alert)', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Son {selectedStock} adet
        </p>
      )}

      {/* Adet seçici */}
      <div className="pa-qty-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 20px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.25em', color: 'var(--color-cream-faint)', textTransform: 'uppercase', margin: 0, flexShrink: 0 }}>
          Adet
        </p>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(244,240,232,0.12)' }}>
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cream-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
            −
          </button>
          <span style={{ width: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-cream)' }}>
            {qty}
          </span>
          <button type="button" onClick={() => setQty(q => q + 1)}
            style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cream-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
            +
          </button>
        </div>
      </div>

      {/* Sepete Ekle */}
      <button type="button" onClick={handleAdd} disabled={!inStock} className="pa-cta"
        style={{
          width: '100%',
          padding: 'clamp(14px, 3.8vw, 18px) clamp(18px, 4vw, 24px)',
          backgroundColor: !inStock ? 'var(--color-ink-4)' : added ? 'var(--color-gold-deep)' : 'var(--color-gold)',
          color: !inStock ? 'var(--color-cream-faint)' : 'var(--color-ink)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px, 2.5vw, 13px)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: !inStock ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s',
          marginBottom: '28px',
        }}>
        {!inStock ? 'Stokta Yok' : added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
      </button>

      {/* Meta bilgiler */}
      {(product.lot_number || product.origin_location || product.harvest_date || product.lab_report_url) && (
        <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {product.lot_number && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--color-cream-faint)', textTransform: 'uppercase', flexShrink: 0 }}>Lot No.</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-cream-muted)', letterSpacing: '0.08em' }}>{product.lot_number}</span>
            </div>
          )}
          {product.origin_location && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--color-cream-faint)', textTransform: 'uppercase', flexShrink: 0 }}>Menşei</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-cream-muted)', letterSpacing: '0.08em' }}>{product.origin_location}</span>
            </div>
          )}
          {product.harvest_date && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--color-cream-faint)', textTransform: 'uppercase', flexShrink: 0 }}>Hasat</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-cream-muted)', letterSpacing: '0.08em' }}>
                {new Date(product.harvest_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          )}
          {product.lab_report_url && (
            <div style={{ marginTop: '4px' }}>
              <a href={product.lab_report_url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--color-gold)', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Laboratuvar Raporu ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
