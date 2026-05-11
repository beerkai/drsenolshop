'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, type CSSProperties } from 'react';
import type { ProductWithRelations } from '@/types';
import {
  getProductImage,
  getProductShortDesc,
  getProductStartingPrice,
  isProductInStock,
  formatPrice,
} from '@/types';

interface ProductCardProps {
  product: ProductWithRelations;
  /** Kartın üst eyebrow'unda gösterilecek kategori (yoksa product.category.name) */
  categoryOverride?: string;
}

function isLikelyEnglish(text: string): boolean {
  return !/[ğüşıöçĞÜŞİÖÇ]/.test(text);
}

export default function ProductCard({ product, categoryOverride }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const image = getProductImage(product);
  const shortDesc = getProductShortDesc(product);
  const priceData = getProductStartingPrice(product);
  const inStock = isProductInStock(product);

  const categoryName = categoryOverride || product.category?.name || '';
  const productSlug = product.slug;

  const hasDiscount =
    priceData != null &&
    priceData.original != null &&
    priceData.discount > 0;

  const cardSurfaceStyle: CSSProperties = {
    background: '#0A0908',
    opacity: inStock ? 1 : 0.75,
  };

  const cardClassName = [
    'block transition-all duration-300 border',
    inStock
      ? 'group cursor-pointer border-[rgba(244,240,232,0.08)] hover:border-[#C9A961]'
      : 'cursor-default border-[rgba(244,240,232,0.08)]',
  ].join(' ');

  const body = (
    <>
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '4/5',
          background: '#141210',
        }}
      >
        {image && !imageError ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            className={
              inStock
                ? 'object-cover transition-transform duration-500 ease-out group-hover:scale-105'
                : 'object-cover'
            }
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="font-display"
              style={{
                color: '#6E665A',
                fontStyle: 'italic',
                fontSize: '14px',
                margin: 0,
              }}
              {...(isLikelyEnglish(product.name) ? { lang: 'en' as const } : {})}
            >
              {product.name}
            </p>
          </div>
        )}

        {!inStock ? (
          <span
            className="font-mono absolute uppercase"
            style={{
              top: '14px',
              left: '14px',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: '#F4F0E8',
              background: 'rgba(10,9,8,0.85)',
              padding: '5px 9px',
              border: '1px solid rgba(244,240,232,0.2)',
            }}
          >
            Stokta Yok
          </span>
        ) : hasDiscount ? (
          <span
            className="font-mono absolute uppercase"
            style={{
              top: '14px',
              left: '14px',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: '#0A0908',
              background: '#C9A961',
              padding: '5px 9px',
              fontWeight: 500,
            }}
          >
            %{priceData.discount} İNDİRİM
          </span>
        ) : null}
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <p
          className="font-mono uppercase transition-colors duration-300"
          style={{
            fontSize: '9px',
            letterSpacing: '0.25em',
            margin: '0 0 10px',
          }}
        >
          <span
            className={
              inStock
                ? 'text-[#6E665A] transition-colors duration-300 group-hover:text-[#C9A961]'
                : 'text-[#6E665A]'
            }
          >
            {categoryName || 'Ürün'}
          </span>
        </p>

        <h3
          className="font-display"
          style={{
            color: '#F4F0E8',
            fontSize: '22px',
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
            margin: '0 0 12px',
            minHeight: '55px',
          }}
          {...(isLikelyEnglish(product.name) ? { lang: 'en' as const } : {})}
        >
          {product.name}
        </h3>

        {shortDesc ? (
          <p
            style={{
              color: '#B8B0A0',
              fontSize: '12.5px',
              lineHeight: 1.55,
              margin: '0 0 16px',
              minHeight: '38px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {shortDesc}
          </p>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px',
            paddingBottom: '18px',
          }}
        >
          {priceData ? (
            <>
              <span
                className="font-display"
                style={{
                  color: inStock ? '#F4F0E8' : '#B8B0A0',
                  fontSize: '22px',
                  fontWeight: 500,
                }}
              >
                {formatPrice(priceData.current)}
              </span>
              {hasDiscount && priceData.original != null ? (
                <span
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    color: '#6E665A',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(priceData.original)}
                </span>
              ) : null}
            </>
          ) : (
            <span
              className="font-mono"
              style={{
                fontSize: '11px',
                color: '#6E665A',
              }}
            >
              Fiyat bilgisi yok
            </span>
          )}
        </div>
      </div>

      <div
        className={
          inStock
            ? 'flex items-center justify-center gap-[10px] border-t border-[rgba(244,240,232,0.08)] px-[18px] py-[18px] transition-all duration-300 group-hover:bg-[#C9A961]'
            : 'flex items-center justify-center gap-[10px] border-t border-[rgba(244,240,232,0.08)] px-[18px] py-[18px] transition-all duration-300'
        }
      >
        {inStock ? (
          <>
            <span
              className="font-mono uppercase text-[#F4F0E8] transition-colors duration-300 group-hover:text-[#0A0908]"
              style={{
                fontSize: '10px',
                letterSpacing: '0.25em',
              }}
            >
              ÜRÜNÜ İNCELE
            </span>
            <span
              className="text-[#C9A961] transition-colors duration-300 group-hover:text-[#0A0908]"
              style={{
                fontSize: '14px',
                lineHeight: 1,
              }}
            >
              →
            </span>
          </>
        ) : (
          <span
            className="font-mono uppercase"
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              color: '#6E665A',
            }}
          >
            Stok Bildirimi
          </span>
        )}
      </div>
    </>
  );

  if (inStock) {
    return (
      <Link href={`/urun/${productSlug}`} className={cardClassName} style={cardSurfaceStyle}>
        {body}
      </Link>
    );
  }

  return (
    <div className={cardClassName} style={cardSurfaceStyle}>
      {body}
    </div>
  );
}
