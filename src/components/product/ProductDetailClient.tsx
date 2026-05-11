'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import type { ProductWithRelations } from '@/types'
import {
  getProductImage,
  getProductImages,
  getProductDescription,
  getProductShortDesc,
  getProductStartingPrice,
  isProductInStock,
  findDefaultVariant,
  getVariantLabel,
  getVariantPrice,
  getVariantStock,
  formatPrice,
} from '@/types'

interface ProductDetailClientProps {
  product: ProductWithRelations
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/📌\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isLikelyEnglish(text: string): boolean {
  return !/[ğüşıöçĞÜŞİÖÇ]/.test(text)
}

/** Panel için kısa özet: kısa açıklama veya uzun metnin düz metin özeti */
function getPanelDescription(product: ProductWithRelations): string {
  const short = getProductShortDesc(product)
  if (short && short.trim() !== '') return short.trim()
  const full = stripHtml(getProductDescription(product))
  if (!full) return ''
  const max = 320
  if (full.length <= max) return full
  return `${full.slice(0, max).trim()}…`
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { dispatch, openCart } = useCart()
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const allImages = getProductImages(product)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const activeImage = allImages[activeImageIndex] ?? getProductImage(product)

  const variants = product.variants ?? []
  const defaultVar = findDefaultVariant(variants)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVar?.id ?? null)
  const [quantity, setQuantity] = useState(1)

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? defaultVar ?? null

  const priceData = selectedVariant
    ? getVariantPrice(selectedVariant)
    : getProductStartingPrice(product)

  const inStock = selectedVariant
    ? selectedVariant.is_active !== false && getVariantStock(selectedVariant) > 0
    : isProductInStock(product)

  const selectedStock = selectedVariant ? getVariantStock(selectedVariant) : (product.stock_quantity ?? 0)
  const isLowStock = inStock && selectedStock > 0 && selectedStock <= 5

  const hasDiscount =
    !!priceData?.original && priceData.original > (priceData?.current ?? 0)

  const panelDescription = getPanelDescription(product)
  const hasVariants = variants.length > 1

  const goToNextImage = () => {
    if (allImages.length < 2) return
    setActiveImageIndex((prev) => (prev + 1) % allImages.length)
  }
  const goToPrevImage = () => {
    if (allImages.length < 2) return
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const closeLightbox = useCallback(() => setLightboxUrl(null), [])

  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxUrl, closeLightbox])

  const bumpQty = (delta: number) => {
    setQuantity((q) => {
      const next = Math.max(1, q + delta)
      if (inStock && selectedStock > 0) return Math.min(next, selectedStock)
      return next
    })
  }

  function handleAddToCart() {
    if (!inStock) return
    dispatch({
      type: 'ADD',
      quantity,
      item: {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        name: product.name,
        slug: product.slug,
        image: getProductImage(product),
        price: priceData?.current ?? 0,
        variantLabel: selectedVariant ? getVariantLabel(selectedVariant) : null,
      },
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2500)
  }

  const lineTotal =
    priceData && inStock ? priceData.current * quantity : null

  return (
    <div className="pdc-root" style={{ background: '#0A0908', color: '#F4F0E8' }}>
      <style>{`
        .pdc-root .pdc-main {
          display: flex;
          flex-direction: column;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-main { flex-direction: row; align-items: flex-start; }
        }
        .pdc-root .pdc-gallery-col {
          flex: none;
          width: 100%;
          padding: 0;
          background: #0A0908;
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-gallery-col {
            flex: 1 1 60%;
            padding: 40px 24px 40px 48px;
          }
        }
        .pdc-root .pdc-stage {
          position: relative;
          width: 100%;
          height: 50vh;
          max-height: 50vh;
          background: #ffffff;
          overflow: hidden;
          cursor: zoom-in;
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-stage {
            height: auto;
            max-height: none;
            aspect-ratio: 4 / 5;
            cursor: zoom-in;
          }
        }
        .pdc-root .pdc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background: rgba(10, 9, 8, 0.72);
          border: 1px solid rgba(244, 240, 232, 0.12);
          color: #f4f0e8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          padding: 0;
          backdrop-filter: blur(4px);
        }
        .pdc-root .pdc-arrow--prev { left: 6px; }
        .pdc-root .pdc-arrow--next { right: 6px; }
        @media (min-width: 1024px) {
          .pdc-root .pdc-arrow {
            width: 44px;
            height: 44px;
          }
          .pdc-root .pdc-arrow--prev { left: 16px; }
          .pdc-root .pdc-arrow--next { right: 16px; }
        }
        .pdc-root .pdc-thumb-row {
          display: flex;
          gap: 8px;
          padding: 10px clamp(12px, 3vw, 16px);
          overflow-x: auto;
          background: #0a0908;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .pdc-root .pdc-thumb {
          position: relative;
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: #ffffff;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-thumb {
            width: 72px;
            height: 90px;
          }
        }
        .pdc-root .pdc-info {
          flex: none;
          width: 100%;
          padding: clamp(18px, 4vw, 24px) clamp(16px, 4vw, 20px)
            calc(88px + env(safe-area-inset-bottom, 0px));
          background: #0a0908;
          border-top: 1px solid rgba(244, 240, 232, 0.08);
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-info {
            flex: 1 1 40%;
            padding: 40px 48px;
            border-top: none;
          }
        }
        .pdc-root .pdc-cta-desktop { display: none; }
        @media (min-width: 1024px) {
          .pdc-root .pdc-cta-desktop { display: block; }
        }
        .pdc-root .pdc-sticky-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #0a0908;
          border-top: 1px solid rgba(244, 240, 232, 0.15);
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
          z-index: 50;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
        }
        @media (min-width: 1024px) {
          .pdc-root .pdc-sticky-mobile { display: none; }
        }
      `}</style>

      <nav
        style={{
          padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 48px)',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 10px)',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(8px, 2vw, 10px)',
            letterSpacing: '0.22em',
            color: '#6E665A',
            textTransform: 'uppercase',
          }}
        >
          <Link href="/" style={{ color: '#6E665A', textDecoration: 'none' }}>
            Anasayfa
          </Link>
          <span aria-hidden>·</span>
          <Link href="/koleksiyon" style={{ color: '#6E665A', textDecoration: 'none' }}>
            Koleksiyon
          </Link>
          {product.category && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/kategori/${product.category.slug}`}
                style={{ color: '#6E665A', textDecoration: 'none' }}
                {...(isLikelyEnglish(product.category.name) ? { lang: 'en' } : {})}
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span aria-hidden>·</span>
          <span
            style={{
              color: '#C9A961',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'min(180px, 42vw)',
            }}
            {...(isLikelyEnglish(product.name) ? { lang: 'en' } : {})}
          >
            {product.name}
          </span>
        </div>
      </nav>

      <div className="pdc-main">
        <div className="pdc-gallery-col">
          <div
            className="pdc-stage"
            role="button"
            tabIndex={0}
            onClick={() => activeImage && !imageErrors[activeImageIndex] && setLightboxUrl(activeImage)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activeImage && !imageErrors[activeImageIndex] && setLightboxUrl(activeImage)
              }
            }}
            aria-label="Görseli büyüt"
          >
            {activeImage && !imageErrors[activeImageIndex] ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 1023px) 100vw, 60vw"
                style={{ objectFit: 'contain' }}
                priority={activeImageIndex === 0}
                onError={() =>
                  setImageErrors((p) => ({ ...p, [activeImageIndex]: true }))
                }
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#141210',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#3A3530',
                    fontStyle: 'italic',
                    fontSize: '16px',
                    margin: 0,
                    textAlign: 'center',
                    padding: '0 20px',
                  }}
                  {...(isLikelyEnglish(product.name) ? { lang: 'en' } : {})}
                >
                  {product.name}
                </p>
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="pdc-arrow pdc-arrow--prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevImage()
                  }}
                  aria-label="Önceki görsel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="pdc-arrow pdc-arrow--next"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNextImage()
                  }}
                  aria-label="Sonraki görsel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px 10px',
                    background: 'rgba(10,9,8,0.72)',
                    color: '#F4F0E8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    backdropFilter: 'blur(4px)',
                    pointerEvents: 'none',
                  }}
                >
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="pdc-thumb-row">
              {allImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className="pdc-thumb"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-pressed={idx === activeImageIndex}
                  aria-label={`Görsel ${idx + 1}`}
                  style={{
                    border:
                      idx === activeImageIndex
                        ? '2px solid #C9A961'
                        : '1px solid rgba(244,240,232,0.1)',
                  }}
                >
                  {!imageErrors[idx] ? (
                    <Image
                      src={img}
                      alt={`${product.name} — görsel ${idx + 1}`}
                      fill
                      sizes="(max-width: 1023px) 50px, 72px"
                      style={{ objectFit: 'contain' }}
                      onError={() => setImageErrors((p) => ({ ...p, [idx]: true }))}
                    />
                  ) : (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#6E665A',
                      }}
                    >
                      —
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdc-info pdc-panel-tight">
          <style>{`
            .pdc-panel-tight .pdc-eyebrow { margin-bottom: 10px !important; }
            .pdc-panel-tight .pdc-h1 { margin-bottom: 12px !important; }
            .pdc-panel-tight .pdc-desc { margin-bottom: 14px !important; }
            .pdc-panel-tight .pdc-rule { margin-bottom: 14px !important; }
            .pdc-panel-tight .pdc-price-block { margin-bottom: 16px !important; }
            .pdc-panel-tight .pdc-variant-block { margin-bottom: 16px !important; }
            .pdc-panel-tight .pdc-qty-block { margin-bottom: 14px !important; }
            @media (max-width: 1023px) {
              .pdc-panel-tight .pdc-desc {
                font-size: clamp(13px, 3.5vw, 14px) !important;
                line-height: 1.65 !important;
              }
            }
          `}</style>

          {product.category && (
            <p
              className="pdc-eyebrow"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(9px, 2vw, 11px)',
                letterSpacing: '0.28em',
                color: '#C9A961',
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
              {...(isLikelyEnglish(product.category.name) ? { lang: 'en' } : {})}
            >
              {product.category.name}
            </p>
          )}

          <h1
            className="pdc-h1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 5vw, 40px)',
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              color: '#F4F0E8',
              margin: '0 0 18px',
            }}
            {...(isLikelyEnglish(product.name) ? { lang: 'en' } : {})}
          >
            {product.name}
          </h1>

          {panelDescription && (
            <p
              className="pdc-desc"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                lineHeight: 1.7,
                color: '#B8B0A0',
                margin: '0 0 24px',
              }}
            >
              {panelDescription}
            </p>
          )}

          <div
            className="pdc-rule"
            style={{
              width: '36px',
              height: '1px',
              background: '#C9A961',
              margin: '0 0 20px',
            }}
          />

          {priceData ? (
            <div className="pdc-price-block" style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(26px, 6vw, 40px)',
                    fontWeight: 500,
                    color: '#F4F0E8',
                  }}
                >
                  {formatPrice(priceData.current)}
                </span>
                {hasDiscount && priceData.original != null && (
                  <>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(11px, 2.5vw, 14px)',
                        color: '#6E665A',
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatPrice(priceData.original)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        letterSpacing: '0.18em',
                        color: '#0A0908',
                        background: '#C9A961',
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                      }}
                    >
                      %{priceData.discount} İndirim
                    </span>
                  </>
                )}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  color: '#6E665A',
                  textTransform: 'uppercase',
                  margin: '8px 0 0',
                }}
              >
                KDV Dahil · Ücretsiz Kargo
              </p>
            </div>
          ) : (
            <p className="pdc-price-block" style={{ color: '#6E665A', fontSize: '14px', marginBottom: '22px' }}>
              Fiyat bilgisi yok
            </p>
          )}

          {hasVariants && (
            <div className="pdc-variant-block" style={{ marginBottom: '22px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  color: '#6E665A',
                  textTransform: 'uppercase',
                  margin: '0 0 10px',
                }}
              >
                {variants[0]?.variant_type ?? 'Seçenek'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {variants.map((v) => {
                  const vStock = getVariantStock(v)
                  const available = v.is_active !== false && vStock > 0
                  const sel = v.id === selectedVariantId
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        if (!available) return
                        setSelectedVariantId(v.id)
                        setQuantity(1)
                      }}
                      style={{
                        padding: '9px 14px',
                        background: sel ? 'rgba(201,169,97,0.12)' : 'transparent',
                        color: sel ? '#C9A961' : available ? '#F4F0E8' : '#3A3530',
                        border: `1px solid ${sel ? '#C9A961' : 'rgba(244,240,232,0.2)'}`,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        cursor: available ? 'pointer' : 'not-allowed',
                        opacity: available ? 1 : 0.35,
                        textDecoration: !available ? 'line-through' : 'none',
                      }}
                    >
                      {getVariantLabel(v)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {isLowStock && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                color: '#C8472D',
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}
            >
              Son {selectedStock} adet
            </p>
          )}

          <div
            className="pdc-qty-block"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              padding: '12px 0',
              borderTop: '1px solid rgba(244,240,232,0.08)',
              borderBottom: '1px solid rgba(244,240,232,0.08)',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.22em',
                color: '#6E665A',
                textTransform: 'uppercase',
              }}
            >
              Adet
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => bumpQty(-1)}
                aria-label="Azalt"
                disabled={quantity <= 1}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'transparent',
                  border: '1px solid rgba(244,240,232,0.2)',
                  color: quantity <= 1 ? '#6E665A' : '#F4F0E8',
                  fontSize: '18px',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#F4F0E8',
                  minWidth: '28px',
                  textAlign: 'center',
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => bumpQty(1)}
                aria-label="Arttır"
                disabled={inStock && selectedStock > 0 && quantity >= selectedStock}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'transparent',
                  border: '1px solid rgba(244,240,232,0.2)',
                  color:
                    inStock && selectedStock > 0 && quantity >= selectedStock
                      ? '#6E665A'
                      : '#F4F0E8',
                  fontSize: '18px',
                  cursor:
                    inStock && selectedStock > 0 && quantity >= selectedStock
                      ? 'not-allowed'
                      : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="pdc-cta-desktop">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              style={{
                width: '100%',
                padding: '16px 28px',
                background: !inStock ? '#2A251E' : added ? '#9C7C3C' : '#C9A961',
                color: !inStock ? '#6E665A' : '#0A0908',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 500,
                cursor: !inStock ? 'not-allowed' : 'pointer',
                marginBottom: '20px',
                transition: 'background-color 0.25s',
              }}
            >
              {!inStock ? 'Stokta Yok' : added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
            </button>
          </div>

          {(product.lot_number ||
            product.origin_location ||
            product.harvest_date ||
            product.lab_report_url) && (
            <div
              style={{
                marginTop: '8px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(244,240,232,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {product.lot_number && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      color: '#6E665A',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    Lot No
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#B8B0A0',
                    }}
                  >
                    {product.lot_number}
                  </span>
                </div>
              )}
              {product.origin_location && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      color: '#6E665A',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    Menşei
                  </span>
                  <span style={{ fontSize: '12px', color: '#B8B0A0', textAlign: 'right' }}>
                    {product.origin_location}
                  </span>
                </div>
              )}
              {product.harvest_date && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      color: '#6E665A',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    Hasat
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#B8B0A0' }}>
                    {new Date(product.harvest_date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              )}
              {product.lab_report_url && (
                <a
                  href={product.lab_report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.22em',
                    color: '#C9A961',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Laboratuvar Raporu ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pdc-sticky-mobile">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: !inStock ? '#1E1B17' : added ? '#9C7C3C' : '#C9A961',
            color: !inStock ? '#6E665A' : '#0A0908',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            fontWeight: 500,
            cursor: !inStock ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'background-color 0.25s',
          }}
        >
          <span>{!inStock ? 'Stokta Yok' : added ? '✓ Eklendi' : 'Sepete Ekle'}</span>
          {lineTotal != null && inStock && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                letterSpacing: '0',
                textTransform: 'none',
              }}
            >
              {formatPrice(lineTotal)}
            </span>
          )}
        </button>
      </div>

      {lightboxUrl && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(10,9,8,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 4vw, 24px)',
            cursor: 'zoom-out',
          }}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Kapat"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '40px',
              height: '40px',
              border: '1px solid rgba(244,240,232,0.2)',
              background: 'rgba(10,9,8,0.6)',
              color: '#F4F0E8',
              cursor: 'pointer',
              fontSize: '22px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
          <div
            role="presentation"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              height: 'min(85vh, 100%)',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt={product.name}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
