'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { ProductWithRelations } from '@/types';
import {
  getProductImage,
  getProductShortDesc,
  getProductStartingPrice,
  isProductInStock,
  formatPrice,
} from '@/types';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: ProductWithRelations;
  categoryOverride?: string;
}

function isLikelyEnglish(text: string): boolean {
  return !/[ğüşıöçĞÜŞİÖÇ]/.test(text);
}

export default function ProductCard({ product, categoryOverride }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const image = getProductImage(product);
  const shortDesc = getProductShortDesc(product);
  const priceData = getProductStartingPrice(product);
  const inStock = isProductInStock(product);
  const categoryName = categoryOverride || product.category?.name || '';
  const productSlug = product.slug;

  const hasDiscount =
    priceData?.original !== null &&
    priceData?.original !== undefined &&
    (priceData?.discount ?? 0) > 0;

  const Wrapper = inStock ? Link : 'div';
  const wrapperProps = inStock ? { href: `/urun/${productSlug}` } : {};

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-ink)',
        opacity: inStock ? 1 : 0.75,
        cursor: inStock ? 'pointer' : 'default',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      {/* Hover overlay — sınır yerine kart üzerine altın çerçeve */}
      {inStock && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid var(--color-gold)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* GÖRSEL — sabit aspect ratio */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          background: 'var(--color-ink-2)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {image && !imageError ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 400px) 100vw, (max-width: 1024px) 50vw, 380px"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.7s',
              transform: isHovered && inStock ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-cream-faint)',
                fontStyle: 'italic',
                fontSize: '14px',
                margin: 0,
              }}
              {...(isLikelyEnglish(product.name) && { lang: 'en' })}
            >
              {product.name}
            </p>
          </div>
        )}

        {/* BADGE */}
        {!inStock ? (
          <span
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'var(--color-cream)',
              background: 'rgba(10,9,8,0.85)',
              padding: '5px 9px',
              textTransform: 'uppercase',
              border: '1px solid rgba(244,240,232,0.2)',
              zIndex: 1,
            }}
          >
            Stokta Yok
          </span>
        ) : hasDiscount ? (
          <span
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'var(--color-ink)',
              background: 'var(--color-gold)',
              padding: '5px 9px',
              textTransform: 'uppercase',
              fontWeight: 500,
              zIndex: 1,
            }}
          >
            %{priceData?.discount} İndirim
          </span>
        ) : null}

        {/* Favori butonu — sağ üst */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          <WishlistButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: image,
            }}
            variant="icon"
          />
        </div>
      </div>

      {/* İÇERIK — flex column, içerik kısmı flex:1 ile genişler */}
      <div
        className="product-card-content"
        style={{
          padding: '22px 22px 0',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Üst kısım: eyebrow + ürün adı + açıklama */}
        <div style={{ flex: 1 }}>
          {/* Kategori (eyebrow) */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.25em',
              color: isHovered && inStock ? 'var(--color-gold)' : 'var(--color-cream-faint)',
              textTransform: 'uppercase',
              margin: '0 0 10px',
              transition: 'color 0.3s',
            }}
            {...(isLikelyEnglish(categoryName) && { lang: 'en' })}
          >
            {categoryName || 'Ürün'}
          </p>

          {/* Ürün adı — minHeight YOK, doğal yüksekliğinde */}
          <h3
            className="product-card-title"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-cream)',
              fontSize: '22px',
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: '-0.005em',
              margin: '0 0 12px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            {...(isLikelyEnglish(product.name) && { lang: 'en' })}
          >
            {product.name}
          </h3>

          {/* Kısa açıklama (varsa) */}
          {shortDesc && (
            <p
              style={{
                color: 'var(--color-cream-muted)',
                fontSize: '12.5px',
                lineHeight: 1.55,
                margin: '0 0 16px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {shortDesc}
            </p>
          )}
        </div>

        {/* Fiyat satırı — her zaman içerik bölümünün en altında */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px',
            paddingTop: '12px',
            paddingBottom: '18px',
          }}
        >
          {priceData ? (
            <>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  color: inStock ? 'var(--color-cream)' : 'var(--color-cream-muted)',
                  fontSize: '22px',
                  fontWeight: 500,
                }}
              >
                {formatPrice(priceData.current)}
              </span>
              {hasDiscount && priceData.original && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-cream-faint)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(priceData.original)}
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--color-cream-faint)' }}>
              Fiyat bilgisi yok
            </span>
          )}
        </div>
      </div>

      {/* ALT CTA ÇUBUK — her zaman kartın altında */}
      <div
        className="product-card-cta"
        style={{
          borderTop: '1px solid rgba(244,240,232,0.08)',
          padding: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: isHovered && inStock ? 'var(--color-gold)' : 'transparent',
          transition: 'background 0.3s',
          flexShrink: 0,
        }}
      >
        {inStock ? (
          <>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.25em',
                color: isHovered ? 'var(--color-ink)' : 'var(--color-cream)',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
              }}
            >
              Ürünü İncele
            </span>
            <span
              style={{
                color: isHovered ? 'var(--color-ink)' : 'var(--color-gold)',
                fontSize: '14px',
                lineHeight: 1,
                transition: 'color 0.3s',
              }}
            >
              →
            </span>
          </>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              color: 'var(--color-cream-faint)',
              textTransform: 'uppercase',
            }}
          >
            Stok Bildirimi
          </span>
        )}
      </div>
    </Wrapper>
  );
}
