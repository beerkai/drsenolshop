// ═══════════════════════════════════════════════════════════════
// Schema.org JSON-LD üreticileri
// ─ Product, Organization, BreadcrumbList, WebSite
// ─ Server Component'lerde <script type="application/ld+json"> içine basılır
// ─ Yeni doc gerektiğinde buraya helper ekle
// ═══════════════════════════════════════════════════════════════

import type { ProductWithRelations } from '@/types'
import { getProductImage, getProductStartingPrice, getProductDescription } from '@/types'
import { getLegalCompany } from './legal-info'
import { getSiteUrl } from './site-url'

const SITE_URL = getSiteUrl()

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function organizationLd(): Record<string, unknown> {
  const co = getLegalCompany()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: co.trade_name,
    legalName: co.legal_name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: co.email,
    telephone: co.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: co.address,
      addressLocality: 'Bursa',
      addressCountry: 'TR',
    },
    sameAs: [
      'https://instagram.com/drsenolshop',
      'https://youtube.com/@drsenol',
    ],
  }
}

export function websiteLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: 'Dr. Şenol — The Honey Scientist',
    inLanguage: 'tr-TR',
    publisher: { '@id': `${SITE_URL}#organization` },
  }
}

export function productLd(product: ProductWithRelations): Record<string, unknown> {
  const image = getProductImage(product)
  const description = stripHtml(getProductDescription(product) || product.short_desc)
  const price = getProductStartingPrice(product)
  const inStock = (product.stock_quantity ?? 0) > 0 ||
    (product.variants ?? []).some((v) => (v.stock_quantity ?? 0) > 0)

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    url: `${SITE_URL}/urun/${product.slug}`,
    priceCurrency: 'TRY',
    price: (price?.current ?? 0).toFixed(2),
    availability: inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: { '@id': `${SITE_URL}#organization` },
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: description.slice(0, 5000),
    image: image ? [image] : [],
    sku: product.sku ?? product.id,
    brand: { '@type': 'Brand', name: 'Dr. Şenol' },
    category: product.category?.name ?? undefined,
    offers,
  }
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function breadcrumbLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: it.href.startsWith('http') ? it.href : `${SITE_URL}${it.href}` } : {}),
    })),
  }
}

/** <script type="application/ld+json"> için string serializer */
export function toJsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
