// ═══════════════════════════════════════════════════════════════
// İndirim kuponu doğrulama & kullanım
// ─ Yalnız sunucu tarafı; RPC üzerinden atomik
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_subtotal: number
  max_uses: number
  used_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export type ValidateCouponResult =
  | { ok: true; code: string; discount: number; discount_type: 'percent' | 'fixed'; discount_value: number }
  | { ok: false; code: 'NOT_FOUND' | 'INACTIVE' | 'NOT_YET' | 'EXPIRED' | 'EXHAUSTED' | 'MIN_SUBTOTAL' | 'NO_CONFIG' | 'DB_ERROR'; message: string }

export async function validateCoupon(code: string, subtotal: number): Promise<ValidateCouponResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: 'NO_CONFIG', message: 'Sistem hazır değil.' }
  }
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) {
    return { ok: false, code: 'NOT_FOUND', message: 'Kupon kodu girin.' }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('consume_coupon', {
    p_code: normalizedCode,
    p_subtotal: subtotal,
  })

  if (error) {
    console.error('[coupons] consume_coupon hatası:', error.message)
    return { ok: false, code: 'DB_ERROR', message: 'Kupon doğrulanamadı.' }
  }

  const r = data as Record<string, unknown>
  if (r.ok) {
    return {
      ok: true,
      code: String(r.code),
      discount: Number(r.discount),
      discount_type: r.discount_type as 'percent' | 'fixed',
      discount_value: Number(r.discount_value),
    }
  }
  return {
    ok: false,
    code: (r.code as ValidateCouponResult extends { ok: false; code: infer C } ? C : never) || 'DB_ERROR',
    message: String(r.message ?? 'Kupon doğrulanamadı.'),
  }
}

export async function incrementCouponUsage(code: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabaseAdmin()
  await supabase.rpc('increment_coupon_usage', { p_code: code.trim().toUpperCase() })
}
