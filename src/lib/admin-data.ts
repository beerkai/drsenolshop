// ═══════════════════════════════════════════════════════════════
// Admin paneli için veri çekme yardımcıları — Server-only
// ─ service_role ile RLS bypass, tüm siparişleri görebilir
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from './supabase'
import type { Order, OrderItem, ProductWithRelations } from '@/types'

// ─── Yardımcı: günlük periyot diziye dönüştür ───────────────────
function lastNDays(n: number): { from: Date; days: Date[] } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = new Date(today.getTime() - (n - 1) * 86400000)
  const days: Date[] = []
  for (let i = 0; i < n; i++) {
    days.push(new Date(from.getTime() + i * 86400000))
  }
  return { from, days }
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Günlük sipariş/ciro serisi (sparkline + delta için) ───────
export interface DailySeries {
  date: string        // YYYY-MM-DD
  orders: number
  revenue: number
}

export async function getDailySeries(days: number): Promise<DailySeries[]> {
  const supabase = getSupabaseAdmin()
  const { from, days: dateList } = lastNDays(days)

  const { data } = await supabase
    .from('orders')
    .select('total_amount, status, created_at')
    .gte('created_at', from.toISOString())

  // İlk olarak diziyi sıfırla
  const map = new Map<string, { orders: number; revenue: number }>()
  for (const d of dateList) {
    map.set(dateKey(d), { orders: 0, revenue: 0 })
  }

  for (const row of data ?? []) {
    const k = dateKey(new Date(row.created_at))
    const slot = map.get(k)
    if (!slot) continue
    slot.orders += 1
    if (row.status !== 'cancelled' && row.status !== 'refunded') {
      slot.revenue += Number(row.total_amount ?? 0)
    }
  }

  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    orders: v.orders,
    revenue: v.revenue,
  }))
}

// ─── Bugünün saat saat sipariş hacmi (0-23) ────────────────────
export async function getHourlyOrdersToday(): Promise<number[]> {
  const supabase = getSupabaseAdmin()
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('orders')
    .select('created_at, status')
    .gte('created_at', start.toISOString())

  const hours = Array<number>(24).fill(0)
  for (const row of data ?? []) {
    const h = new Date(row.created_at).getHours()
    hours[h] += 1
  }
  return hours
}

// ─── Top satılan ürünler ───────────────────────────────────────
export interface TopProductRow {
  product_id: string | null
  product_name: string
  product_slug: string | null
  units: number
  revenue: number
}

export async function getTopProducts(days = 30, limit = 5): Promise<TopProductRow[]> {
  const supabase = getSupabaseAdmin()
  const from = new Date(Date.now() - days * 86400000).toISOString()

  // İlk olarak ilgili sipariş id'lerini çek
  const { data: orderRows } = await supabase
    .from('orders')
    .select('id, status')
    .gte('created_at', from)
    .neq('status', 'cancelled')
    .neq('status', 'refunded')

  const orderIds = (orderRows ?? []).map((o) => o.id)
  if (orderIds.length === 0) return []

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, product_name, product_slug, quantity, subtotal')
    .in('order_id', orderIds)

  const map = new Map<string, TopProductRow>()
  for (const it of items ?? []) {
    const key = it.product_id ?? it.product_name
    const cur = map.get(key) ?? {
      product_id: it.product_id ?? null,
      product_name: it.product_name,
      product_slug: it.product_slug ?? null,
      units: 0,
      revenue: 0,
    }
    cur.units += Number(it.quantity ?? 0)
    cur.revenue += Number(it.subtotal ?? 0)
    map.set(key, cur)
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ─── Düşük stok varyantları ────────────────────────────────────
export interface LowStockRow {
  product_id: string
  product_name: string
  product_slug: string
  variant_label: string | null
  stock: number
}

export async function getLowStock(threshold = 5, limit = 10): Promise<LowStockRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('product_variants')
    .select(`
      id, label, variant_value, stock_quantity, is_active,
      product:products(id, name, slug, is_active)
    `)
    .lte('stock_quantity', threshold)
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(limit)

  return ((data ?? []) as unknown[])
    .map((row) => {
      const r = row as {
        label: string | null
        variant_value: string | null
        stock_quantity: number | null
        product: { id: string; name: string; slug: string; is_active: boolean } | { id: string; name: string; slug: string; is_active: boolean }[] | null
      }
      const prod = Array.isArray(r.product) ? r.product[0] : r.product
      if (!prod || prod.is_active === false) return null
      return {
        product_id: prod.id,
        product_name: prod.name,
        product_slug: prod.slug,
        variant_label: r.label ?? r.variant_value,
        stock: Number(r.stock_quantity ?? 0),
      } satisfies LowStockRow
    })
    .filter((r): r is LowStockRow => r !== null)
}

// ─── Zenginleştirilmiş Pano İstatistikleri ─────────────────────
export interface DashboardStatsV2 {
  today: { orders: number; revenue: number; sparkline: number[] }
  yesterday: { orders: number; revenue: number }
  last7: { orders: number; revenue: number; sparkline: number[]; deltaPct: number }
  last30: { orders: number; revenue: number; sparkline: number[]; deltaPct: number }
  pending: number
  lowStock: number
}

export async function getDashboardStatsV2(): Promise<DashboardStatsV2> {
  // Son 60 günü tek seferde çek → tüm pencereleri buradan hesapla
  const series60 = await getDailySeries(60)
  const today = series60[series60.length - 1] ?? { orders: 0, revenue: 0, date: '' }
  const yesterday = series60[series60.length - 2] ?? { orders: 0, revenue: 0, date: '' }

  const last7 = series60.slice(-7)
  const prev7 = series60.slice(-14, -7)
  const last7Sum = sumSeries(last7)
  const prev7Sum = sumSeries(prev7)

  const last30 = series60.slice(-30)
  const prev30 = series60.slice(-60, -30)
  const last30Sum = sumSeries(last30)
  const prev30Sum = sumSeries(prev30)

  const supabase = getSupabaseAdmin()
  const [{ count: pendingCount }, { count: lowVariantCount }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('product_variants').select('id', { count: 'exact', head: true }).lte('stock_quantity', 5).eq('is_active', true),
  ])

  return {
    today: {
      orders: today.orders,
      revenue: today.revenue,
      sparkline: last7.map((d) => d.revenue),
    },
    yesterday: { orders: yesterday.orders, revenue: yesterday.revenue },
    last7: {
      orders: last7Sum.orders,
      revenue: last7Sum.revenue,
      sparkline: last7.map((d) => d.revenue),
      deltaPct: pctChange(prev7Sum.revenue, last7Sum.revenue),
    },
    last30: {
      orders: last30Sum.orders,
      revenue: last30Sum.revenue,
      sparkline: last30.map((d) => d.revenue),
      deltaPct: pctChange(prev30Sum.revenue, last30Sum.revenue),
    },
    pending: pendingCount ?? 0,
    lowStock: lowVariantCount ?? 0,
  }
}

function sumSeries(s: DailySeries[]) {
  return s.reduce(
    (acc, d) => ({ orders: acc.orders + d.orders, revenue: acc.revenue + d.revenue }),
    { orders: 0, revenue: 0 }
  )
}

function pctChange(prev: number, cur: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0
  return ((cur - prev) / prev) * 100
}

// ─── Müşteriler — sipariş email'lerinden türetilir ─────────────
export interface CustomerSummary {
  email: string
  name: string
  phone: string | null
  total_orders: number
  total_revenue: number
  first_order_at: string
  last_order_at: string
}

export async function listCustomers(opts: { limit?: number; offset?: number; search?: string } = {}): Promise<{
  customers: CustomerSummary[]
  total: number
}> {
  const { limit = 50, offset = 0, search } = opts
  const supabase = getSupabaseAdmin()

  let q = supabase
    .from('orders')
    .select('customer_email, customer_name, customer_phone, total_amount, status, created_at')
    .order('created_at', { ascending: false })

  if (search) {
    q = q.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`)
  }

  const { data } = await q
  if (!data) return { customers: [], total: 0 }

  // Email bazında grupla
  const map = new Map<string, CustomerSummary>()
  for (const row of data) {
    const email = row.customer_email
    const cur = map.get(email)
    if (cur) {
      cur.total_orders += 1
      if (row.status !== 'cancelled' && row.status !== 'refunded') {
        cur.total_revenue += Number(row.total_amount ?? 0)
      }
      // En eski tarih
      if (row.created_at < cur.first_order_at) cur.first_order_at = row.created_at
      // En yeni tarih (zaten desc sıralı, ama defansif)
      if (row.created_at > cur.last_order_at) cur.last_order_at = row.created_at
    } else {
      map.set(email, {
        email,
        name: row.customer_name,
        phone: row.customer_phone,
        total_orders: 1,
        total_revenue: row.status !== 'cancelled' && row.status !== 'refunded' ? Number(row.total_amount ?? 0) : 0,
        first_order_at: row.created_at,
        last_order_at: row.created_at,
      })
    }
  }

  const all = Array.from(map.values()).sort((a, b) => b.last_order_at.localeCompare(a.last_order_at))
  const total = all.length
  return { customers: all.slice(offset, offset + limit), total }
}

// ─── Düşük stok varyantları (TÜM list, stok sayfası için) ──────
export interface StockRow {
  variant_id: string
  product_id: string
  product_name: string
  product_slug: string
  variant_label: string | null
  stock: number
  is_active: boolean
}

export async function listAllStockRows(): Promise<StockRow[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('product_variants')
    .select(`
      id, label, variant_value, stock_quantity, is_active,
      product:products(id, name, slug, is_active)
    `)
    .order('stock_quantity', { ascending: true })

  return ((data ?? []) as unknown[])
    .map((row) => {
      const r = row as {
        id: string
        label: string | null
        variant_value: string | null
        stock_quantity: number | null
        is_active: boolean | null
        product: { id: string; name: string; slug: string; is_active: boolean } | { id: string; name: string; slug: string; is_active: boolean }[] | null
      }
      const prod = Array.isArray(r.product) ? r.product[0] : r.product
      if (!prod) return null
      return {
        variant_id: r.id,
        product_id: prod.id,
        product_name: prod.name,
        product_slug: prod.slug,
        variant_label: r.label ?? r.variant_value,
        stock: Number(r.stock_quantity ?? 0),
        is_active: r.is_active !== false,
      } satisfies StockRow
    })
    .filter((r): r is StockRow => r !== null)
}

// ─── Analitik için ek metrikler ─────────────────────────────────
export interface AnalyticsSnapshot {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  paidOrders: number
  cancelledOrders: number
  series30: DailySeries[]
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const supabase = getSupabaseAdmin()
  const series30 = await getDailySeries(30)

  const { data: orderRows } = await supabase.from('orders').select('status, total_amount, customer_email')
  const orders = orderRows ?? []

  const paidOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0)
  const customerEmails = new Set(orders.map((o) => o.customer_email))

  return {
    totalCustomers: customerEmails.size,
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
    paidOrders: paidOrders.length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    series30,
  }
}

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
