// ═══════════════════════════════════════════════════════════════
// Ürün yorum işlemleri — server-side
// ═══════════════════════════════════════════════════════════════

import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export interface ProductReview {
  id: string
  product_id: string
  user_id: string | null
  customer_email: string
  customer_name: string | null
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  is_verified_purchase: boolean
  created_at: string
  approved_at: string | null
}

export interface ReviewStats {
  product_id: string
  review_count: number
  avg_rating: number
  count_5: number
  count_4: number
  count_3: number
  count_2: number
  count_1: number
}

export async function getApprovedReviews(productId: string, limit = 20): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) return []
  const { data } = await getSupabase()
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as ProductReview[]
}

export async function getReviewStats(productId: string): Promise<ReviewStats | null> {
  if (!isSupabaseConfigured()) return null
  const { data } = await getSupabase()
    .from('product_review_stats')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle()
  return (data as ReviewStats) ?? null
}

export async function getReviewStatsBatch(productIds: string[]): Promise<Map<string, ReviewStats>> {
  const map = new Map<string, ReviewStats>()
  if (!isSupabaseConfigured() || productIds.length === 0) return map
  const { data } = await getSupabase()
    .from('product_review_stats')
    .select('*')
    .in('product_id', productIds)
  for (const row of (data ?? []) as ReviewStats[]) {
    map.set(row.product_id, row)
  }
  return map
}

/** Bu kullanıcının bu ürün için zaten yorumu var mı */
export async function getUserReview(productId: string, userId: string): Promise<ProductReview | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle()
  return (data as ProductReview) ?? null
}

/** Bu kullanıcı bu ürünü satın aldı mı (verified purchase için) */
export async function hasUserPurchased(productId: string, email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  // Email match + status paid/preparing/shipped/delivered
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status')
    .ilike('customer_email', email)
    .in('status', ['paid', 'preparing', 'shipped', 'delivered'])
  const orderIds = (orders ?? []).map((o) => o.id)
  if (orderIds.length === 0) return false

  const { count } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .in('order_id', orderIds)
    .eq('product_id', productId)

  return (count ?? 0) > 0
}

export interface CreateReviewInput {
  product_id: string
  user_id: string
  customer_email: string
  customer_name: string | null
  rating: number
  title?: string | null
  body?: string | null
}

export type CreateReviewResult =
  | { ok: true; review: ProductReview }
  | { ok: false; code: 'INVALID' | 'DUPLICATE' | 'DB_ERROR'; message: string }

export async function createReview(input: CreateReviewInput): Promise<CreateReviewResult> {
  const rating = Math.round(input.rating)
  if (rating < 1 || rating > 5) {
    return { ok: false, code: 'INVALID', message: 'Puan 1–5 arası olmalı.' }
  }
  const title = input.title?.trim().slice(0, 120) || null
  const body = input.body?.trim().slice(0, 2000) || null

  const supabase = getSupabaseAdmin()
  const isVerified = await hasUserPurchased(input.product_id, input.customer_email)

  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: input.product_id,
      user_id: input.user_id,
      customer_email: input.customer_email.toLowerCase(),
      customer_name: input.customer_name?.trim().slice(0, 80) || null,
      rating,
      title,
      body,
      is_verified_purchase: isVerified,
      is_approved: false,
    })
    .select()
    .single()

  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return { ok: false, code: 'DUPLICATE', message: 'Bu ürün için zaten yorum bıraktınız.' }
    }
    return { ok: false, code: 'DB_ERROR', message: 'Yorum eklenemedi.' }
  }

  return { ok: true, review: data as ProductReview }
}
