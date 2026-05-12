import { ImageResponse } from 'next/og'
import { getProductBySlug } from '@/lib/products'
import { formatPrice, getProductStartingPrice } from '@/types'

export const alt = 'Dr. Şenol — Ürün'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function Image({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    // Fallback: marka temalı default
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#0A0908',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F4F0E8',
            fontSize: 56,
            fontFamily: 'serif',
          }}
        >
          Dr. Şenol
        </div>
      ),
      { ...size }
    )
  }

  const priceData = getProductStartingPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.current) : null
  const categoryName = product.category?.name ?? null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0908',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '40px 60px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: '#C9A961',
              fontSize: 18,
              letterSpacing: 6,
              fontFamily: 'monospace',
            }}
          >
            DR. ŞENOL
          </div>
          <div
            style={{
              color: '#9B9285',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            THE HONEY SCIENTIST
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: '60px 80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Kategori eyebrow */}
          {categoryName && (
            <div
              style={{
                color: '#C9A961',
                fontSize: 16,
                letterSpacing: 6,
                fontFamily: 'monospace',
                marginBottom: 24,
              }}
            >
              {categoryName.toLocaleUpperCase('tr-TR')}
            </div>
          )}

          {/* Gold çizgi */}
          <div
            style={{
              width: 60,
              height: 1,
              background: '#C9A961',
              marginBottom: 32,
            }}
          />

          {/* Ürün adı */}
          <div
            style={{
              color: '#F4F0E8',
              fontSize: product.name.length > 30 ? 64 : 84,
              fontWeight: 500,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 980,
              display: 'flex',
            }}
          >
            {product.name}
          </div>

          {/* Açıklama */}
          {product.short_desc && (
            <div
              style={{
                color: '#B8B0A0',
                fontSize: 22,
                marginTop: 32,
                maxWidth: 820,
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              {product.short_desc.length > 140
                ? product.short_desc.slice(0, 140) + '…'
                : product.short_desc}
            </div>
          )}

          {/* Fiyat */}
          {priceLabel && (
            <div
              style={{
                marginTop: 48,
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
              }}
            >
              <div
                style={{
                  color: '#9B9285',
                  fontSize: 14,
                  letterSpacing: 4,
                  fontFamily: 'monospace',
                }}
              >
                FİYAT
              </div>
              <div
                style={{
                  color: '#C9A961',
                  fontSize: 56,
                  fontWeight: 500,
                  letterSpacing: -1,
                }}
              >
                {priceLabel}
              </div>
            </div>
          )}
        </div>

        {/* Alt bar */}
        <div
          style={{
            padding: '0 60px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: '#9B9285',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            EST. 1985 · SAITABAT, BURSA · LAB ONAYLI
          </div>
          <div
            style={{
              color: '#C9A961',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            DRSENOL.SHOP
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
