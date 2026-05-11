// ═══════════════════════════════════════════════════════════════
// Admin paneli için veri çekme yardımcıları — Server-only
// ─ service_role ile RLS bypass, tüm siparişleri görebilir
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import type { Order, OrderItem, ProductWithRelations } from '@/types'

export interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  totalOrders30d: number
  totalRevenue30d: number
  lowStockProducts: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Bugünkü siparişler
  const { data: todayData } = await supabase
    .from('orders')
    .select('total_amount, status')
    .gte('created_at', todayStart)

  const todayOrders = todayData?.length ?? 0
  const todayRevenue = (todayData ?? [])
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0)

  // Pending
  const { count: pendingCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Son 30 gün
  const { data: monthData } = await supabase
    .from('orders')
    .select('total_amount, status')
    .gte('created_at', monthAgo)

  const totalOrders30d = monthData?.length ?? 0
  const totalRevenue30d = (monthData ?? [])
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0)

  // Düşük stok (variant veya product stock_quantity <= 5)
  const { count: lowVariantCount } = await supabase
    .from('product_variants')
    .select('id', { count: 'exact', head: true })
    .lte('stock_quantity', 5)
    .eq('is_active', true)

  return {
    todayOrders,
    todayRevenue,
    pendingOrders: pendingCount ?? 0,
    totalOrders30d,
    totalRevenue30d,
    lowStockProducts: lowVariantCount ?? 0,
  }
}

export interface ListedOrder {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  customer_name: string
  customer_email: string
  total_amount: number
  item_count: number
  created_at: string
}

export async function listOrders(opts: {
  status?: string
  limit?: number
  offset?: number
} = {}): Promise<{ orders: ListedOrder[]; total: number }> {
  const { status, limit = 30, offset = 0 } = opts
  const supabase = getSupabaseAdmin()

  let countQuery = supabase.from('orders').select('id', { count: 'exact', head: true })
  if (status) countQuery = countQuery.eq('status', status)
  const { count } = await countQuery

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, status, payment_status, payment_method,
      customer_name, customer_email, total_amount, created_at,
      order_items(id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error || !data) {
    return { orders: [], total: 0 }
  }

  const orders: ListedOrder[] = (data as unknown[]).map((row) => {
    const r = row as {
      id: string
      order_number: string
      status: string
      payment_status: string
      payment_method: string
      customer_name: string
      customer_email: string
      total_amount: number | string
      created_at: string
      order_items: unknown[] | null
    }
    return {
      id: r.id,
      order_number: r.order_number,
      status: r.status,
      payment_status: r.payment_status,
      payment_method: r.payment_method,
      customer_name: r.customer_name,
      customer_email: r.customer_email,
      total_amount: Number(r.total_amount),
      item_count: Array.isArray(r.order_items) ? r.order_items.length : 0,
      created_at: r.created_at,
    }
  })

  return { orders, total: count ?? 0 }
}

export async function getOrderDetailById(id: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  const supabase = getSupabaseAdmin()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (!order) return null
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })
  return { order: order as Order, items: (items ?? []) as OrderItem[] }
}

export interface ListedProduct {
  id: string
  slug: string
  name: string
  category_name: string | null
  base_price: number | null
  stock_quantity: number | null
  variants_count: number
  is_active: boolean
  is_featured: boolean
  tax_rate: number | null
}

export async function listProducts(opts: { search?: string; limit?: number; offset?: number } = {}): Promise<{ products: ListedProduct[]; total: number }> {
  const { search, limit = 50, offset = 0 } = opts
  const supabase = getSupabaseAdmin()

  let countQuery = supabase.from('products').select('id', { count: 'exact', head: true })
  if (search) countQuery = countQuery.ilike('name', `%${search}%`)
  const { count } = await countQuery

  let query = supabase
    .from('products')
    .select(`
      id, slug, name, base_price, stock_quantity, is_active, is_featured, tax_rate,
      category:categories(name),
      variants:product_variants(id)
    `)
    .order('name')
    .range(offset, offset + limit - 1)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data } = await query
  if (!data) return { products: [], total: 0 }

  const products: ListedProduct[] = (data as unknown[]).map((row) => {
    const r = row as {
      id: string
      slug: string
      name: string
      base_price: number | string | null
      stock_quantity: number | null
      is_active: boolean | null
      is_featured: boolean | null
      tax_rate: number | string | null
      category: { name: string } | { name: string }[] | null
      variants: unknown[] | null
    }
    const cat = Array.isArray(r.category) ? r.category[0] : r.category
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category_name: cat?.name ?? null,
      base_price: r.base_price !== null ? Number(r.base_price) : null,
      stock_quantity: r.stock_quantity,
      variants_count: Array.isArray(r.variants) ? r.variants.length : 0,
      is_active: r.is_active !== false,
      is_featured: r.is_featured === true,
      tax_rate: r.tax_rate !== null ? Number(r.tax_rate) : null,
    }
  })

  return { products, total: count ?? 0 }
}

export async function getProductDetailById(id: string): Promise<ProductWithRelations | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('products')
    .select(`*, variants:product_variants(*), category:categories(*)`)
    .eq('id', id)
    .maybeSingle()
  if (!data) return null
  return data as ProductWithRelations
}
