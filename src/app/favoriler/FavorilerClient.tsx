'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/lib/wishlist-context'
import type { ProductWithRelations } from '@/types'
import { getImageUrl } from '@/lib/images'
import { formatPrice, getProductImage, getProductStartingPrice, isProductInStock } from '@/types'

export default function FavorilerClient() {
  const { items, dispatch } = useWishlist()
  const [products, setProducts] = useState<Map<string, ProductWithRelations>>(new Map())
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // localStorage'daki productId'lerden gerçek ürün bilgilerini çek
  useEffect(() => {
    if (!mounted) return
    if (items.length === 0) {
      setProducts(new Map())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        // ID'leri tek tek değil, bulk olarak çekelim
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: items.map((i) => i.productId) }),
        })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (cancelled) return
        const map = new Map<string, ProductWithRelations>()
        for (const p of (data.products ?? []) as ProductWithRelations[]) {
          map.set(p.id, p)
        }
        setProducts(map)
      } catch {
        // fallback: yine de görsel + isim localStorage'tan göster
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [mounted, items])

  // SSR'da items boş — hydration mismatch'i önlemek için mounted check
  if (!mounted) {
    return (
      <div className="px-margin" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '64px', paddingBottom: '96px' }}>
        <div style={{ height: '60vh' }} />
      </div>
    )
  }

  const isEmpty = items.length === 0

  return (
    <div className="px-margin" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: 'clamp(48px, 8vw, 80px)', paddingBottom: 'clamp(60px, 10vw, 96px)' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
        <p className="font-label-spec" style={{ fontSize: 'clamp(10px, 2vw, 11px)', letterSpacing: '0.3em', color: 'var(--color-honey-amber)', textTransform: 'uppercase', margin: '0 0 20px' }}>
          Favorilerim
        </p>
        <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--color-charcoal-pure)', margin: '0 auto 32px' }} />
        <h1 className="font-headline-lg" style={{ color: 'var(--color-on-surface)', fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
          {isEmpty ? (
            <>Henüz <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--color-on-surface-variant)' }}>favori yok.</span></>
          ) : (
            <>
              {items.length}{' '}
              <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--color-on-surface-variant)' }}>
                {items.length === 1 ? 'favori ürün.' : 'favori ürün.'}
              </span>
            </>
          )}
        </h1>
        {!isEmpty && (
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: 1.7, marginTop: '20px', maxWidth: '440px', margin: '20px auto 0' }}>
            Beğendiğin ürünler bu tarayıcıda kayıtlı. Hesap oluşturmadan da çalışır.
          </p>
        )}
      </div>

      {isEmpty ? (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px' }}>
            Ürün kartlarındaki <span style={{ color: 'var(--color-honey-amber)' }}>♡</span> ikonuna tıklayarak ürünleri favorilere ekleyebilirsin.
            <br />
            Daha sonra buradan kolayca dönersin.
          </p>
          <Link
            href="/koleksiyon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: 'clamp(14px, 3vw, 16px) clamp(22px, 5vw, 32px)',
              backgroundColor: 'var(--color-charcoal-pure)',
              color: 'var(--color-surface)',
              fontFamily: 'var(--font-label-spec)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            Koleksiyonu Keşfet →
          </Link>
        </div>
      ) : (
        <>
          {/* Üst toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p className="font-label-spec" style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#9B9285', textTransform: 'uppercase', margin: 0 }}>
              {items.length} ürün · tarayıcında saklanır
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Tüm favoriler temizlensin mi?')) dispatch({ type: 'CLEAR' })
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-hairline-light)',
                color: '#9B9285',
                fontFamily: 'var(--font-label-spec)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              Temizle
            </button>
          </div>

          {/* Grid */}
          <div
            className="favoriler-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1px',
              background: 'var(--color-hairline-light)',
              border: '1px solid var(--color-hairline-light)',
            }}
          >
            <style>{`
              @media (max-width: 640px) {
                .favoriler-grid { grid-template-columns: repeat(2, 1fr) !important; }
              }
              @media (max-width: 400px) {
                .favoriler-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {items.map((item) => {
              const product = products.get(item.productId) ?? null
              const inStock = product ? isProductInStock(product) : true
              const priceData = product ? getProductStartingPrice(product) : null
              const removed = !product && !loading
              return (
                <FavCard
                  key={item.productId}
                  slug={item.slug}
                  name={product?.name ?? item.name}
                  image={
                    product
                      ? (getProductImage(product) ?? item.image)
                      : item.image
                  }
                  category={product?.category?.name ?? null}
                  priceText={priceData ? formatPrice(priceData.current) : null}
                  originalPriceText={priceData?.original ? formatPrice(priceData.original) : null}
                  inStock={inStock}
                  loading={loading}
                  removed={removed}
                  onRemove={() => dispatch({ type: 'REMOVE', productId: item.productId })}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function FavCard({
  slug,
  name,
  image,
  category,
  priceText,
  originalPriceText,
  inStock,
  loading,
  removed,
  onRemove,
}: {
  slug: string
  name: string
  image: string | null
  category: string | null
  priceText: string | null
  originalPriceText: string | null
  inStock: boolean
  loading: boolean
  removed: boolean
  onRemove: () => void
}) {
  return (
    <div style={{ background: 'var(--color-surface)', position: 'relative' }}>
      {/* Üst sağ — kaldır */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Favorilerden çıkar"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 3,
          width: '32px',
          height: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10,9,8,0.6)',
          border: '1px solid var(--color-hairline-light)',
          color: 'var(--color-honey-amber)',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <Link
        href={`/urun/${slug}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          color: 'inherit',
          textDecoration: 'none',
          opacity: removed ? 0.5 : 1,
        }}
      >
        {/* Görsel */}
        <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--color-surface-container-low)', overflow: 'hidden' }}>
          {image ? (
            <Image
              src={getImageUrl(image)}
              alt={name}
              fill
              sizes="(max-width: 400px) 100vw, (max-width: 1024px) 50vw, 380px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--font-headline-lg)', color: 'var(--color-outline)', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>
                {name}
              </p>
            </div>
          )}
          {removed && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,8,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-label-spec" style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'var(--color-on-surface)', textTransform: 'uppercase' }}>
                Bulunamadı
              </span>
            </div>
          )}
          {!removed && !inStock && (
            <span style={{ position: 'absolute', top: '14px', left: '14px', fontFamily: 'var(--font-label-spec)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--color-on-surface)', background: 'rgba(10,9,8,0.85)', padding: '5px 9px', textTransform: 'uppercase', border: '1px solid var(--color-hairline-light)' }}>
              Stokta Yok
            </span>
          )}
        </div>

        {/* İçerik */}
        <div style={{ padding: '22px 22px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {category && (
            <p className="font-label-spec" style={{ fontSize: '9px', letterSpacing: '0.25em', color: 'var(--color-outline)', textTransform: 'uppercase', margin: 0 }}>
              {category}
            </p>
          )}
          <h3 className="font-headline-lg" style={{ color: 'var(--color-on-surface)', fontSize: '20px', fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.005em', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </h3>
          {loading ? (
            <p className="font-label-spec" style={{ color: 'var(--color-outline)', fontSize: '11px', letterSpacing: '0.15em' }}>
              Yükleniyor…
            </p>
          ) : priceText ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
              <span className="font-headline-lg" style={{ color: inStock ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)', fontSize: '22px', fontWeight: 500 }}>
                {priceText}
              </span>
              {originalPriceText && (
                <span className="font-label-spec" style={{ fontSize: '11px', color: 'var(--color-outline)', textDecoration: 'line-through' }}>
                  {originalPriceText}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  )
}
