// ═══════════════════════════════════════════════════════════════
// Ürün veri çekme yardımcıları
// Server Component ve Route Handler içinde kullanıma uygundur
// ═══════════════════════════════════════════════════════════════

import { getSupabase, isSupabaseConfigured } from './supabase'
import type { Category, Product, ProductVariant, ProductWithRelations } from '@/types'

/** Join sonrası ham satır tipi (PostgREST gömülü ilişkiler) */
type ProductQueryResult = Product & {
  variants?: ProductVariant[] | null
  category?: Category | null
}

/** NUMERIC / string → güvenli number (çökmez) */
function coerceFiniteNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Geçersiz sayı → null (tip güvenliği) */
function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

/** Satır içindeki fiyat ve sayı alanlarını normalize et */
function normalizeVariant(v: ProductVariant): ProductVariant {
  const dp = numOrNull(v.discount_price)
  const cp = numOrNull(v.compare_price)
  return {
    ...v,
    price: coerceFiniteNumber(v.price, 0),
    discount_price: dp,
    compare_price: cp,
    stock:
      v.stock === null || v.stock === undefined
        ? null
        : coerceFiniteNumber(v.stock, 0),
    stock_quantity:
      v.stock_quantity === null || v.stock_quantity === undefined
        ? null
        : coerceFiniteNumber(v.stock_quantity, 0),
    display_order:
      v.display_order === null || v.display_order === undefined
        ? null
        : coerceFiniteNumber(v.display_order, 0),
    weight_grams:
      v.weight_grams === null || v.weight_grams === undefined
        ? null
        : coerceFiniteNumber(v.weight_grams, 0),
    volume_ml:
      v.volume_ml === null || v.volume_ml === undefined
        ? null
        : coerceFiniteNumber(v.volume_ml, 0),
  }
}

function normalizeProductRow(p: Product): Product {
  return {
    ...p,
    base_price: numOrNull(p.base_price),
    compare_price: numOrNull(p.compare_price),
    tax_rate:
      p.tax_rate === null || p.tax_rate === undefined
        ? null
        : coerceFiniteNumber(p.tax_rate, 0),
    stock_quantity:
      p.stock_quantity === null || p.stock_quantity === undefined
        ? null
        : coerceFiniteNumber(p.stock_quantity, 0),
    low_stock_threshold:
      p.low_stock_threshold === null || p.low_stock_threshold === undefined
        ? null
        : coerceFiniteNumber(p.low_stock_threshold, 0),
    weight_grams:
      p.weight_grams === null || p.weight_grams === undefined
        ? null
        : coerceFiniteNumber(p.weight_grams, 0),
    view_count:
      p.view_count === null || p.view_count === undefined
        ? null
        : coerceFiniteNumber(p.view_count, 0),
    sale_count:
      p.sale_count === null || p.sale_count === undefined
        ? null
        : coerceFiniteNumber(p.sale_count, 0),
  }
}

// ───────────────────────────────────────────────────────────────
// Anasayfa öne çıkan ürünler
// ───────────────────────────────────────────────────────────────

export async function getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[getFeaturedProducts] Supabase ortam değişkenleri eksik; boş liste dönülüyor.')
    return []
  }

  const { data, error } = await getSupabase()
    .from('products')
    .select(
      `
      *,
      variants:product_variants(*),
      category:categories(*)
    `
    )
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getFeaturedProducts] Hata:', error.message)
    return []
  }

  return (data as ProductQueryResult[]).map(transformProductData)
}

// ───────────────────────────────────────────────────────────────
// Filtreli liste
// ───────────────────────────────────────────────────────────────

export interface GetProductsOptions {
  categorySlug?: string
  isActive?: boolean
  isFeatured?: boolean
  isNew?: boolean
  limit?: number
  offset?: number
  orderBy?: 'newest' | 'oldest' | 'name' | 'popular'
  search?: string
}

export async function getProducts(options: GetProductsOptions = {}): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[getProducts] Supabase ortam değişkenleri eksik; boş liste dönülüyor.')
    return []
  }

  const supabase = getSupabase()
  const {
    categorySlug,
    isActive = true,
    isFeatured,
    isNew,
    limit = 50,
    offset = 0,
    orderBy = 'newest',
    search,
  } = options

  // Slug → category UUID
  let categoryId: string | null = null
  if (categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    if (!catErr && cat?.id) categoryId = cat.id
  }

  let query = supabase.from('products').select(
    `
      *,
      variants:product_variants(*),
      category:categories(*)
    `
  )

  if (isActive !== undefined) query = query.eq('is_active', isActive)
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured)
  if (isNew !== undefined) query = query.eq('is_new', isNew)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (search && search.trim() !== '') query = query.ilike('name', `%${search.trim()}%`)

  switch (orderBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'popular':
      query = query.order('sale_count', { ascending: false, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('[getProducts] Hata:', error.message)
    return []
  }

  return (data as ProductQueryResult[]).map(transformProductData)
}

// ───────────────────────────────────────────────────────────────
// Slug ile tek ürün
// ───────────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) {
    console.warn('[getProductBySlug] Supabase ortam değişkenleri eksik.')
    return null
  }

  const { data, error } = await getSupabase()
    .from('products')
    .select(
      `
      *,
      variants:product_variants(*),
      category:categories(*)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[getProductBySlug] Hata:', error.message)
    return null
  }

  if (!data) return null

  return transformProductData(data as ProductQueryResult)
}

// ───────────────────────────────────────────────────────────────
// Kategori altı liste (getProducts üzerinden)
// ───────────────────────────────────────────────────────────────

export async function getProductsByCategory(
  categorySlug: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ProductWithRelations[]> {
  return getProducts({
    categorySlug,
    ...options,
  })
}

// ───────────────────────────────────────────────────────────────
// Görüntülenme — anon güncelleme RLS'e bağlı; sessiz başarısızlık
// ───────────────────────────────────────────────────────────────

export async function incrementProductViewCount(productId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabase()
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('view_count')
    .eq('id', productId)
    .maybeSingle()

  if (fetchErr || !product) return

  const next = coerceFiniteNumber(product.view_count, 0) + 1

  await supabase.from('products').update({ view_count: next }).eq('id', productId)
}

// ───────────────────────────────────────────────────────────────
// Normalize + varsayılan varyant
// ───────────────────────────────────────────────────────────────

function transformProductData(raw: ProductQueryResult): ProductWithRelations {
  const base = normalizeProductRow(raw as Product)
  let variants = (raw.variants ?? []).map(normalizeVariant)
  variants = variants.filter((v) => v.is_active !== false)

  variants.sort((a, b) => {
    const aOrder = a.display_order ?? 999
    const bOrder = b.display_order ?? 999
    return coerceFiniteNumber(aOrder, 999) - coerceFiniteNumber(bOrder, 999)
  })

  const defaultVariant = variants.find((v) => v.is_default === true) ?? variants[0] ?? null

  const cat = raw.category ? raw.category : null

  return {
    ...base,
    variants,
    default_variant: defaultVariant,
    category: cat,
  }
}
