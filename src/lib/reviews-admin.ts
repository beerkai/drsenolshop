// ═══════════════════════════════════════════════════════════════
// Admin — vitrinde müşteri yorumu ile aynı görünen değerlendirmeler
// user_id NULL; mağazada ek rozet yok
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'
import type { ProductReview } from './reviews'

const INTERNAL_EMAIL_DOMAIN = 'reviews.internal.drsenol.shop'

export function isCuratedReview(review: { user_id: string | null }): boolean {
  return review.user_id == null
}

function normalizeRating(rating: number): number | null {
  const n = Math.round(rating)
  if (n < 1 || n > 5) return null
  return n
}

function normalizeText(value: string | null | undefined, max: number): string | null {
  if (value == null) return null
  const t = value.trim()
  if (!t) return null
  return t.slice(0, max)
}

export interface AdminReviewUpsertInput {
  product_id: string
  customer_name: string
  customer_email?: string | null
  rating: number
  title?: string | null
  body?: string | null
  is_verified_purchase?: boolean
  is_approved?: boolean
  /** Görünen tarih — boşsa şimdi */
  created_at?: string | null
}

export type AdminReviewUpsertResult =
  | { ok: true; review: ProductReview }
  | { ok: false; message: string }

export async function createAdminReview(input: AdminReviewUpsertInput): Promise<AdminReviewUpsertResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Veritabanı yapılandırılmamış.' }
  }

  const rating = normalizeRating(input.rating)
  if (rating == null) return { ok: false, message: 'Puan 1–5 arası olmalı.' }

  const name = normalizeText(input.customer_name, 80)
  if (!name) return { ok: false, message: 'Görünen isim zorunlu.' }

  const productId = input.product_id.trim()
  if (!productId) return { ok: false, message: 'Ürün seçin.' }

  const emailRaw = input.customer_email?.trim().toLowerCase()
  const customer_email =
    emailRaw && emailRaw.includes('@') ? emailRaw.slice(0, 120) : `curated-${crypto.randomUUID()}@${INTERNAL_EMAIL_DOMAIN}`

  const isApproved = input.is_approved !== false
  const now = new Date().toISOString()
  let createdAt = now
  if (input.created_at) {
    const d = new Date(input.created_at)
    if (!Number.isNaN(d.getTime())) createdAt = d.toISOString()
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: null,
      customer_email,
      customer_name: name,
      rating,
      title: normalizeText(input.title, 120),
      body: normalizeText(input.body, 2000),
      is_verified_purchase: input.is_verified_purchase === true,
      is_approved: isApproved,
      approved_at: isApproved ? now : null,
      created_at: createdAt,
    })
    .select()
    .single()

  if (error) {
    console.error('[createAdminReview] hata:', error.message)
    return { ok: false, message: 'Değerlendirme eklenemedi.' }
  }

  return { ok: true, review: data as ProductReview }
}

export async function updateAdminReview(
  id: string,
  input: Partial<AdminReviewUpsertInput>
): Promise<AdminReviewUpsertResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Veritabanı yapılandırılmamış.' }
  }

  const updates: Record<string, unknown> = {}

  if (input.product_id !== undefined) {
    const pid = input.product_id.trim()
    if (!pid) return { ok: false, message: 'Ürün seçin.' }
    updates.product_id = pid
  }
  if (input.customer_name !== undefined) {
    const name = normalizeText(input.customer_name, 80)
    if (!name) return { ok: false, message: 'Görünen isim zorunlu.' }
    updates.customer_name = name
  }
  if (input.customer_email !== undefined && input.customer_email?.trim()) {
    updates.customer_email = input.customer_email.trim().toLowerCase().slice(0, 120)
  }
  if (input.rating !== undefined) {
    const rating = normalizeRating(input.rating)
    if (rating == null) return { ok: false, message: 'Puan 1–5 arası olmalı.' }
    updates.rating = rating
  }
  if (input.title !== undefined) updates.title = normalizeText(input.title, 120)
  if (input.body !== undefined) updates.body = normalizeText(input.body, 2000)
  if (input.is_verified_purchase !== undefined) {
    updates.is_verified_purchase = input.is_verified_purchase === true
  }
  if (input.is_approved !== undefined) {
    updates.is_approved = input.is_approved === true
    updates.approved_at = input.is_approved ? new Date().toISOString() : null
  }
  if (input.created_at !== undefined && input.created_at) {
    const d = new Date(input.created_at)
    if (!Number.isNaN(d.getTime())) updates.created_at = d.toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, message: 'Güncellenecek alan yok.' }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('product_reviews').update(updates).eq('id', id).select().single()

  if (error) {
    console.error('[updateAdminReview] hata:', error.message)
    return { ok: false, message: 'Güncellenemedi.' }
  }

  return { ok: true, review: data as ProductReview }
}
