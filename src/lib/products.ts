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
  const { products } = await getProducts({
    isFeatured: true,
    isActive: true,
    limit,
    orderBy: 'newest',
  })
  return products
}

// ───────────────────────────────────────────────────────────────
// getProducts — Filtrelenmiş ürün listesi + toplam sayım
// ───────────────────────────────────────────────────────────────

export interface GetProductsOptions {
  categorySlug?: string
  isActive?: boolean
  isFeatured?: boolean
  isNew?: boolean
  inStockOnly?: boolean
  limit?: number
  offset?: number
  orderBy?: 'newest' | 'oldest' | 'name' | 'popular' | 'price_asc' | 'price_desc'
  search?: string
}

export interface GetProductsResult {
  products: ProductWithRelations[]
  total: number
}

export async function getProducts(options: GetProductsOptions = {}): Promise<GetProductsResult> {
  if (!isSupabaseConfigured()) {
    console.warn('[getProducts] Supabase ortam değişkenleri eksik; boş liste dönülüyor.')
    return { products: [], total: 0 }
  }

  const supabase = getSupabase()
  const {
    categorySlug,
    isActive = true,
    isFeatured,
    isNew,
    inStockOnly = false,
    limit = 12,
    offset = 0,
    orderBy = 'newest',
    search,
  } = options

  let categoryId: string | null = null
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
    if (cat) categoryId = cat.id
  }

  function isInStock(p: {
    stock_quantity?: number | null
    variants?: Array<{ stock?: number | null; stock_quantity?: number | null; is_active?: boolean | null }> | null
  }): boolean {
    const variants = p.variants ?? []
    if (variants.length === 0) return (p.stock_quantity ?? 0) > 0
    return variants.some((v) => {
      const stock = v.stock_quantity ?? v.stock ?? 0
      return v.is_active !== false && stock > 0
    })
  }

  let total = 0
  if (inStockOnly) {
    let stockCountQuery = supabase
      .from('products')
      .select('stock_quantity, variants:product_variants(stock, stock_quantity, is_active)')
    if (isActive !== undefined) stockCountQuery = stockCountQuery.eq('is_active', isActive)
    if (isFeatured !== undefined) stockCountQuery = stockCountQuery.eq('is_featured', isFeatured)
    if (isNew !== undefined) stockCountQuery = stockCountQuery.eq('is_new', isNew)
    if (categoryId) stockCountQuery = stockCountQuery.eq('category_id', categoryId)
    if (search) stockCountQuery = stockCountQuery.ilike('name', `%${search}%`)
    const { data: allForCount } = await stockCountQuery
    total = (allForCount ?? []).filter(isInStock).length
  } else {
    let countQuery = supabase.from('products').select('id', { count: 'exact', head: true })
    if (isActive !== undefined) countQuery = countQuery.eq('is_active', isActive)
    if (isFeatured !== undefined) countQuery = countQuery.eq('is_featured', isFeatured)
    if (isNew !== undefined) countQuery = countQuery.eq('is_new', isNew)
    if (categoryId) countQuery = countQuery.eq('category_id', categoryId)
    if (search) countQuery = countQuery.ilike('name', `%${search}%`)
    const { count: totalCount } = await countQuery
    total = totalCount ?? 0
  }

  let query = supabase.from('products').select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)

  if (isActive !== undefined) query = query.eq('is_active', isActive)
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured)
  if (isNew !== undefined) query = query.eq('is_new', isNew)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (search) query = query.ilike('name', `%${search}%`)

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
    case 'price_asc':
      query = query.order('base_price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('base_price', { ascending: false, nullsFirst: false })
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
    return { products: [], total: 0 }
  }

  let products = (data as ProductQueryResult[]).map(transformProductData)

  if (inStockOnly) {
    products = products.filter(isInStock)
  }

  return { products, total }
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
  const { products } = await getProducts({
    categorySlug,
    ...options,
  })
  return products
}

// ───────────────────────────────────────────────────────────────
// ID listesinden ürün çekme — checkout doğrulamasında kullanılır
// ───────────────────────────────────────────────────────────────

export async function getProductsByIds(ids: string[]): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured() || ids.length === 0) return []

  const { data, error } = await getSupabase()
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
    .in('id', ids)

  if (error) {
    console.error('[getProductsByIds] Hata:', error.message)
    return []
  }

  return (data as ProductQueryResult[]).map(transformProductData)
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
