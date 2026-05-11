// ═══════════════════════════════════════════════════════════════
// TypeScript Tipleri — Dr. Şenol Shop v0.2.0
// Mevcut ikas legacy kolonlarını + yeni v0.2.0 kolonlarını destekler
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// Sayı güvenliği (Supabase NUMERIC bazen string döner; çökmez)
// ───────────────────────────────────────────────────────────────

function toFiniteNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

// ───────────────────────────────────────────────────────────────
// KATEGORİ
// ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  parent_id: string | null
  display_order: number | null
  image_url: string | null
  is_active: boolean | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string | null
}

/** Alt kategorilerle birlikte ağaç yapısı (navigasyon vb.) */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  product_count?: number
}

// ───────────────────────────────────────────────────────────────
// ÜRÜN VARYANTI (Gramaj, hacim seçenekleri)
// ───────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  product_id: string

  // ikas legacy kolonlar
  ikas_variant_id: string | null
  variant_type: string | null // "Gramaj", "Hacim" gibi
  variant_value: string | null // "355 gr.", "Standart" — legacy
  price: number // Liste/karşılaştırma fiyatı (üstü çizilecek senaryoda)
  discount_price: number | null // İndirimli satış fiyatı (varsa)
  stock: number | null // legacy stok

  // Yeni v0.2.0 kolonlar
  sku: string | null
  label: string | null // Yeni etiket (variant_value ile uyumlu)
  compare_price: number | null // Karşılaştırma (çizili) fiyatı
  weight_grams: number | null
  volume_ml: number | null
  stock_quantity: number | null // Yeni stok alanı
  is_default: boolean | null
  is_active: boolean | null
  display_order: number | null

  created_at: string
  updated_at: string | null
}

// ───────────────────────────────────────────────────────────────
// ÜRÜN
// ───────────────────────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name: string

  // ikas legacy kolonlar
  ikas_id: string | null
  description: string | null // Eski açıklama
  metadata_title: string | null // Eski meta title
  metadata_description: string | null // Eski meta description
  is_active: boolean | null
  is_featured: boolean | null
  badge: string | null
  default_variant_label: string | null
  compare_price: number | null
  category_id: string | null
  images: string[] | null // TEXT[] — URL listesi

  // Yeni v0.2.0 kolonlar
  brand: string | null
  short_desc: string | null
  long_desc: string | null // Yeni uzun açıklama
  base_price: number | null
  tax_rate: number | null
  sku: string | null
  barcode: string | null
  weight_grams: number | null
  image_url: string | null
  is_new: boolean | null
  stock_quantity: number | null
  low_stock_threshold: number | null
  lab_report_url: string | null
  lot_number: string | null
  harvest_date: string | null // ISO date
  origin_location: string | null
  certifications: string[] | null // JSONB → dizi
  lab_values: Record<string, unknown> | null // JSONB nesne
  tags: string[] | null
  meta_title: string | null // Yeni meta title
  meta_description: string | null
  view_count: number | null
  sale_count: number | null

  created_at: string
  updated_at: string | null
}

/** Ürün + ilişkili varyant ve kategori */
export interface ProductWithRelations extends Product {
  variants?: ProductVariant[]
  category?: Category | null
  default_variant?: ProductVariant | null
}

// ───────────────────────────────────────────────────────────────
// SİPARİŞ (v0.3.0 için hazır)
// ───────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  customer_email: string | null
  customer_phone: string | null
  customer_name: string | null
  shipping_address: Record<string, unknown> | null
  billing_address: Record<string, unknown> | null
  shipping_method: string | null
  shipping_cost: number | null
  subtotal: number
  tax_amount: number | null
  discount_amount: number | null
  total_amount: number
  payment_method: string | null
  payment_status: PaymentStatus | null
  payment_ref: string | null
  notes: string | null
  tracking_number: string | null
  created_at: string
  updated_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_label: string | null
  sku: string | null
  unit_price: number
  quantity: number
  subtotal: number
  created_at: string
}

// ───────────────────────────────────────────────────────────────
// ADMIN KULLANICI (v0.4.0 için hazır)
// ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  auth_user_id: string | null
  email: string
  full_name: string | null
  role: string
  is_active: boolean | null
  last_login_at: string | null
  created_at: string
}

// ───────────────────────────────────────────────────────────────
// HELPER GETTER'LAR — Legacy + yeni kolonlardan en uygun değeri al
// Sadece null/NaN güvenliği; hatalı şema için throw edilmez
// ───────────────────────────────────────────────────────────────

/** Ürün açıklaması: önce long_desc, yoksa description */
export function getProductDescription(product: Product): string {
  const long = product.long_desc
  const short = product.description
  if (long != null && String(long).trim() !== '') return String(long)
  if (short != null && String(short).trim() !== '') return String(short)
  return ''
}

/** Kısa açıklama */
export function getProductShortDesc(product: Product): string {
  const s = product.short_desc
  return s != null ? String(s) : ''
}

/** Meta başlık: meta_title → metadata_title → name */
export function getProductMetaTitle(product: Product): string {
  const m = product.meta_title ?? product.metadata_title ?? product.name
  return m != null ? String(m) : ''
}

/** Meta açıklama */
export function getProductMetaDescription(product: Product): string {
  const meta = product.meta_description ?? product.metadata_description
  if (meta != null && String(meta).trim() !== '') return String(meta)
  const desc = getProductDescription(product)
  return desc.length > 160 ? desc.slice(0, 160) : desc
}

/** Ana görsel: image_url veya images[0] */
export function getProductImage(product: Product): string | null {
  if (product.image_url != null && String(product.image_url).trim() !== '') {
    return String(product.image_url)
  }
  const imgs = product.images
  if (imgs != null && imgs.length > 0 && imgs[0] != null && String(imgs[0]).trim() !== '') {
    return String(imgs[0])
  }
  return null
}

/** Tüm görseller (image_url önde, tekrarlar elenir) */
export function getProductImages(product: Product): string[] {
  const imgs: string[] = []
  const primary = product.image_url != null ? String(product.image_url).trim() : ''
  if (primary !== '') imgs.push(primary)
  const rest = product.images
  if (rest != null) {
    for (const url of rest) {
      const u = url != null ? String(url).trim() : ''
      if (u !== '' && u !== primary) imgs.push(u)
    }
  }
  return imgs
}

/** Varyant etiketi: label → variant_value → varsayılan metin */
export function getVariantLabel(variant: ProductVariant): string {
  const l = variant.label ?? variant.variant_value
  if (l != null && String(l).trim() !== '') return String(l)
  return 'Standart'
}

/** Stok: stock_quantity → stock → 0 */
export function getVariantStock(variant: ProductVariant): number {
  if (variant.stock_quantity !== null && variant.stock_quantity !== undefined) {
    return Math.max(0, toFiniteNumber(variant.stock_quantity, 0))
  }
  if (variant.stock !== null && variant.stock !== undefined) {
    return Math.max(0, toFiniteNumber(variant.stock, 0))
  }
  return 0
}

/**
 * Varyant fiyat çözümlemesi: önce discount_price < price, yoksa compare_price > price.
 * NaN ve null güvenli; sıfıra bölme yok.
 */
export function getVariantPrice(variant: ProductVariant): {
  current: number
  original: number | null
  discount: number
} {
  const price = toFiniteNumber(variant.price, 0)
  const dpRaw = variant.discount_price
  const dp = dpRaw !== null && dpRaw !== undefined ? toFiniteNumber(dpRaw, NaN) : NaN

  if (!Number.isNaN(dp) && price > 0 && dp < price) {
    return {
      current: dp,
      original: price,
      discount: Math.round(((price - dp) / price) * 100),
    }
  }

  const cpRaw = variant.compare_price
  const cp = cpRaw !== null && cpRaw !== undefined ? toFiniteNumber(cpRaw, NaN) : NaN
  if (!Number.isNaN(cp) && cp > 0 && cp > price) {
    return {
      current: price,
      original: cp,
      discount: Math.round(((cp - price) / cp) * 100),
    }
  }

  return {
    current: price,
    original: null,
    discount: 0,
  }
}

/** Varsayılan varyant: is_default → display_order → ilk kayıt */
export function findDefaultVariant(variants: ProductVariant[]): ProductVariant | null {
  if (!variants || variants.length === 0) return null

  const defaultVariant = variants.find((v) => v.is_default === true)
  if (defaultVariant) return defaultVariant

  const sorted = [...variants].sort((a, b) => {
    const aOrder = a.display_order ?? 999
    const bOrder = b.display_order ?? 999
    return toFiniteNumber(aOrder, 999) - toFiniteNumber(bOrder, 999)
  })

  return sorted[0] ?? null
}

/** Ürün listeleme fiyatı: varsayılan varyant veya base_price/compare_price */
export function getProductStartingPrice(product: ProductWithRelations): {
  current: number
  original: number | null
  discount: number
} | null {
  const variants = product.variants
  if (!variants || variants.length === 0) {
    const baseRaw = product.base_price
    if (baseRaw === null || baseRaw === undefined) return null
    const base = toFiniteNumber(baseRaw, NaN)
    if (Number.isNaN(base)) return null

    const cmpRaw = product.compare_price
    const cmp =
      cmpRaw !== null && cmpRaw !== undefined ? toFiniteNumber(cmpRaw, NaN) : NaN
    const hasStrike =
      !Number.isNaN(cmp) && cmp > 0 && cmp > base

    return {
      current: base,
      original: hasStrike ? cmp : null,
      discount:
        hasStrike && cmp > 0 ? Math.round(((cmp - base) / cmp) * 100) : 0,
    }
  }

  const defaultVar = findDefaultVariant(variants)
  if (!defaultVar) return null

  return getVariantPrice(defaultVar)
}

/** Stok durumu: varyant yoksa ürün stoğu; varsa en az bir aktif varyantta stok */
export function isProductInStock(product: ProductWithRelations): boolean {
  const variants = product.variants
  if (!variants || variants.length === 0) {
    const sq = product.stock_quantity
    return sq !== null && sq !== undefined && toFiniteNumber(sq, 0) > 0
  }

  return variants.some((v) => {
    const isActive = v.is_active !== false
    const stock = getVariantStock(v)
    return isActive && stock > 0
  })
}

/** TRY para biçimi (CLI/test çıktısı için; UI'da ayrıca kullanılabilir) */
export function formatPrice(amount: number): string {
  const n = toFiniteNumber(amount, 0)
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}
