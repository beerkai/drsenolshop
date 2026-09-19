'use client'

// ═══════════════════════════════════════════════════════════════
// Ürün detay — Editorial Minimal (Stitch "Karakovan Çam Balı Detay")
// ─ Sol: dikey akan editöryal görsel akışı (Instagram post ritmi)
// ─ Sağ: sticky satın alma paneli — künye, fiyat, varyant, adet, CTA
// ─ Sıfır köşe yuvarlaklığı, sıfır gölge, hairline ayraçlar
//
// Sepet mantığı (dispatch payload) DEĞİŞMEDİ.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { useProductLabels } from '@/lib/product-labels-context'
import type { ProductWithRelations } from '@/types'
import ProductPriceRow from '@/components/product/ProductPriceRow'
import {
  findDefaultVariant,
  getProductImage,
  getProductImagesForVariant,
  getVariantLabel,
  getVariantPrice,
  getVariantStock,
} from '@/types'

interface ProductDetailClientProps {
  product: ProductWithRelations
  /** Künye şeridi — ileride CMS/ürün alanından */
  provenanceLine?: string
  batchLabel?: string
}

export default function ProductDetailClient({
  product,
  provenanceLine = "1985'ten beri • Saitabat Köyü / Bursa",
  batchLabel,
}: ProductDetailClientProps) {
  const { dispatch, openCart } = useCart()
  const labels = useProductLabels()

  const variants = (product.variants ?? []).filter((v) => v.is_active !== false)
  const defaultVar = findDefaultVariant(variants)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVar?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [stickyBarVisible, setStickyBarVisible] = useState(false)
  const purchaseCtaRef = useRef<HTMLDivElement>(null)
  const galleryScrollRef = useRef<HTMLDivElement>(null)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? defaultVar ?? null
  const priceData = selectedVariant ? getVariantPrice(selectedVariant) : null
  const basePrice = product.base_price ?? 0
  const currentPrice = priceData?.current ?? (basePrice > 0 ? basePrice : 0)
  const stock = selectedVariant ? getVariantStock(selectedVariant) : (product.stock_quantity ?? 0)
  const inStock = stock > 0

  const images = useMemo(
    () => getProductImagesForVariant(product, selectedVariant),
    [product, selectedVariant]
  )
  const categoryName = product.category?.name ?? 'Koleksiyon'

  useEffect(() => {
    galleryScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [selectedVariantId, images])

  // Mobil: satın alma bloğu ekrandan çıkınca alt sticky bar
  useEffect(() => {
    const el = purchaseCtaRef.current
    if (!el) return

    const desktop = window.matchMedia('(min-width: 64rem)')
    const syncDesktop = () => {
      if (desktop.matches) setStickyBarVisible(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (desktop.matches) return
        if (entry.isIntersecting) {
          setStickyBarVisible(false)
          return
        }
        // Yalnızca satın alma bloğu yukarı kaybolduysa (aşağı inildi) sticky aç
        setStickyBarVisible(entry.boundingClientRect.top < 0)
      },
      { threshold: 0 }
    )

    observer.observe(el)
    desktop.addEventListener('change', syncDesktop)
    syncDesktop()

    return () => {
      observer.disconnect()
      desktop.removeEventListener('change', syncDesktop)
    }
  }, [product.id])

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
        price: currentPrice,
        variantLabel: selectedVariant ? getVariantLabel(selectedVariant) : null,
      },
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="product-detail-root w-full bg-surface">
      <style>{`
          .product-detail-root .pdc-gallery-stack {
            display: none;
          }
          .product-detail-root .pdc-gallery-scroll {
            display: flex;
            gap: var(--spacing-space-md);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            margin-left: calc(-1 * var(--spacing-margin));
            margin-right: calc(-1 * var(--spacing-margin));
            padding-left: var(--spacing-margin);
            padding-right: var(--spacing-margin);
          }
          .product-detail-root .pdc-gallery-scroll::-webkit-scrollbar {
            display: none;
          }
          .product-detail-root .pdc-gallery-slide {
            flex: 0 0 min(88vw, 420px);
            scroll-snap-align: start;
          }
          .product-detail-root .pdc-sticky-mobile {
            position: fixed;
            left: 0;
            right: 0;
            bottom: calc(var(--editorial-mobile-nav-height) + env(safe-area-inset-bottom, 0px));
            z-index: 45;
            border-top: 1px solid var(--color-hairline-light);
            background: color-mix(in srgb, var(--color-surface) 97%, transparent);
            backdrop-filter: blur(12px);
            padding: 10px var(--spacing-margin);
            box-shadow: 0 -8px 24px rgba(10, 9, 8, 0.06);
            transform: translateY(110%);
            pointer-events: none;
            transition: transform 0.28s ease;
          }
          .product-detail-root .pdc-sticky-mobile.is-visible {
            transform: translateY(0);
            pointer-events: auto;
          }
          @media (min-width: 64rem) {
            .product-detail-root .pdc-gallery-stack {
              display: flex;
              flex-direction: column;
              gap: var(--spacing-space-lg);
            }
            .product-detail-root .pdc-gallery-scroll {
              display: none;
            }
            .product-detail-root .pdc-sticky-mobile {
              display: none;
            }
          }
        `}</style>

      {/* ── Breadcrumb / durum şeridi ─────────────────────────── */}
      <div className="w-full border-b border-hairline-light bg-surface-container-low">
        <div className="ed-section-inner flex items-center justify-between gap-space-md py-space-sm font-editorial-caption text-editorial-caption uppercase tracking-[0.14em] text-on-surface-variant">
          <nav className="ed-min-w-0 flex items-center gap-space-xs" aria-label="Breadcrumb">
            <Link href="/koleksiyon" className="transition-colors hover:text-on-surface">
              Koleksiyon
            </Link>
            <span aria-hidden>/</span>
            {product.category?.slug ? (
              <>
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="transition-colors hover:text-on-surface"
                >
                  {categoryName}
                </Link>
                <span aria-hidden>/</span>
              </>
            ) : null}
            <span className="ed-caption-truncate font-medium text-on-surface">{product.name}</span>
          </nav>

          {inStock ? (
            <span className="hidden shrink-0 items-center gap-space-sm md:flex">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey-amber" />
              Stokta • {stock} adet kaldı
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Ana tuval ─────────────────────────────────────────── */}
      <div
        className={`ed-section-inner py-space-lg lg:py-space-xl lg:pb-space-xl ${
          stickyBarVisible
            ? 'pb-[calc(var(--editorial-mobile-nav-height)+4.5rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-[calc(var(--editorial-mobile-nav-height)+1rem+env(safe-area-inset-bottom,0px))]'
        }`}
      >
        {/* Mobilde flex kolon: galeri → fiyat paneli; lg grid */}
        <div className="flex flex-col items-stretch gap-space-lg lg:grid lg:grid-cols-12 lg:gap-space-xl">
          <div className="lg:col-span-7">
            {images.length > 0 ? (
              <>
                <div
                  ref={galleryScrollRef}
                  className="pdc-gallery-scroll lg:hidden"
                  aria-label="Ürün görselleri"
                >
                  {images.map((src, i) => (
                    <article
                      key={`scroll-${src}`}
                      className="pdc-gallery-slide flex flex-col overflow-hidden border border-hairline-light bg-surface-container-lowest"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-surface-container-low">
                        <Image
                          src={src}
                          alt={`${product.name} — görsel ${i + 1}`}
                          fill
                          priority={i === 0}
                          sizes="88vw"
                          className="object-contain p-space-md"
                        />
                        {i === 0 && batchLabel ? (
                          <span className="absolute bottom-3 left-3 bg-charcoal-pure/80 px-2 py-1 font-label-spec text-[10px] uppercase tracking-widest text-surface-container-lowest">
                            {batchLabel}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="pdc-gallery-stack">
                  {images.map((src, i) => (
                    <article
                      key={src}
                      className="flex flex-col overflow-hidden border border-hairline-light bg-surface-container-lowest"
                    >
                      <div className="flex items-center justify-between gap-space-md p-space-md">
                        <div className="flex items-center gap-space-sm">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container font-label-spec text-[11px] font-bold text-charcoal-pure">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="flex flex-col">
                            <span className="font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface">
                              Dr. Şenol Saitabat Atölyesi
                            </span>
                            <span className="font-label-spec text-[10px] text-on-surface-variant">
                              {provenanceLine}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="relative aspect-square w-full overflow-hidden bg-surface-container-low">
                        <Image
                          src={src}
                          alt={`${product.name} — görsel ${i + 1}`}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 64rem) 100vw, 55vw"
                          className="object-contain p-space-lg"
                        />
                        {i === 0 && batchLabel ? (
                          <span className="absolute bottom-4 left-4 bg-charcoal-pure/80 px-3 py-1 font-label-spec text-label-spec uppercase tracking-widest text-surface-container-lowest">
                            {batchLabel}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="aspect-[4/5] w-full border border-hairline-light bg-surface-container-low" />
            )}
          </div>

          <div className="flex flex-col gap-space-lg lg:col-span-5 lg:sticky lg:top-[calc(var(--editorial-header-stack)+0.75rem)]">
            <div className="flex flex-col gap-space-md border border-hairline-light bg-surface-container-lowest p-space-lg lg:p-space-xl">
              <div className="flex items-center justify-between gap-space-sm">
                <span className="ed-caption-truncate font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-on-surface-variant">
                  {provenanceLine}
                </span>
                {product.badge ? (
                  <span className="inline-flex shrink-0 items-center gap-1 bg-surface-container px-2 py-0.5 font-label-spec text-[10px] uppercase text-charcoal-pure">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-honey-amber" />
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-space-xs">
                <h1 className="font-headline-lg text-headline-lg leading-tight text-charcoal-pure">
                  {product.name}
                </h1>
                {product.short_desc ? (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {product.short_desc}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-end gap-x-space-sm gap-y-1 pt-space-xs">
                <ProductPriceRow
                  price={
                    currentPrice > 0
                      ? {
                          current: currentPrice,
                          original:
                            priceData?.original && priceData.original > priceData.current
                              ? priceData.original
                              : null,
                          discount: priceData?.discount ?? 0,
                        }
                      : null
                  }
                  size="card"
                />
                <span className="font-editorial-caption text-editorial-caption uppercase text-on-surface-variant">
                  KDV Dahil
                </span>
              </div>

              {/* Varyant seçimi */}
              {variants.length > 1 ? (
                <div className="flex flex-col gap-space-xs pt-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface">
                      {labels.variantHeading}
                    </span>
                    <span className="font-label-spec text-[11px] text-on-surface-variant">
                      {labels.variantNote}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-space-xs">
                    {variants.map((v) => {
                      const active = v.id === selectedVariant?.id
                      const vStock = getVariantStock(v)
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(v.id)
                            setQuantity(1)
                          }}
                          disabled={vStock <= 0}
                          aria-pressed={active}
                          className={`flex flex-col items-center p-space-sm text-center transition-colors ${
                            active
                              ? 'bg-charcoal-pure text-surface-container-lowest'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          } ${vStock <= 0 ? 'cursor-not-allowed opacity-40' : ''}`}
                        >
                          <span className="font-headline-sm text-headline-sm">
                            {getVariantLabel(v)}
                          </span>
                          <span
                            className={`font-label-spec text-[10px] ${
                              active ? 'text-honey-amber' : 'text-on-surface-variant'
                            }`}
                          >
                            {vStock > 0
                              ? active
                                ? labels.variantSelected
                                : labels.variantAvailable
                              : labels.outOfStock}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div
                ref={purchaseCtaRef}
                className="flex flex-col gap-space-sm pt-space-sm sm:flex-row"
              >
                <div className="flex h-12 w-full items-center justify-between bg-surface-container-low px-3 sm:w-32">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Adedi azalt"
                    className="p-1 text-on-surface transition-colors hover:text-honey-amber"
                  >
                    −
                  </button>
                  <span className="font-price-tag text-price-tag text-on-surface">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                    aria-label="Adedi artır"
                    className="p-1 text-on-surface transition-colors hover:text-honey-amber"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex h-12 flex-1 items-center justify-center gap-space-sm font-nav-caps text-nav-caps uppercase tracking-[0.14em] transition-colors ${
                    inStock
                      ? 'bg-charcoal-pure text-surface-container-lowest hover:bg-primary-hover'
                      : 'cursor-not-allowed bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {!inStock ? labels.outOfStock : added ? labels.addedToCart : labels.addToCart}
                </button>
              </div>

              {inStock && stock <= 5 ? (
                <p className="font-label-spec text-label-spec uppercase tracking-wider text-honey-amber">
                  Son {stock} adet
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Mobil: sayfa kaydırılırken sepete ekle — alt menünün üstünde */}
      <div
        className={`pdc-sticky-mobile lg:hidden ${stickyBarVisible ? 'is-visible' : ''}`}
        role="region"
        aria-label="Hızlı satın alma"
        aria-hidden={!stickyBarVisible}
      >
        <div className="mx-auto flex max-w-lg items-center gap-space-sm">
          <div className="flex h-10 w-[7.5rem] shrink-0 items-center justify-between bg-surface-container-low px-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Adedi azalt"
              className="p-1 text-on-surface"
            >
              −
            </button>
            <span className="font-price-tag text-sm text-on-surface">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
              aria-label="Adedi artır"
              className="p-1 text-on-surface"
            >
              +
            </button>
          </div>
          <div className="ed-min-w-0 flex-1">
            <ProductPriceRow
              price={
                currentPrice > 0
                  ? {
                      current: currentPrice,
                      original:
                        priceData?.original && priceData.original > priceData.current
                          ? priceData.original
                          : null,
                      discount: priceData?.discount ?? 0,
                    }
                  : null
              }
              size="inline"
            />
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex h-11 min-w-[7.5rem] shrink-0 items-center justify-center px-3 font-nav-caps text-[10px] uppercase tracking-[0.1em] transition-colors ${
              inStock
                ? 'bg-charcoal-pure text-surface-container-lowest'
                : 'cursor-not-allowed bg-surface-container text-on-surface-variant'
            }`}
          >
            {!inStock ? labels.outOfStock : added ? labels.addedToCart : labels.addToCart}
          </button>
        </div>
      </div>
    </div>
  )
}
