// ═══════════════════════════════════════════════════════════════
// Newsletter abone işlemleri — server-side
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export interface NewsletterSubscribeInput {
  email: string
  source?: string
  ip_address?: string | null
}

export type NewsletterResult =
  | { ok: true; already: boolean }
  | { ok: false; code: 'INVALID' | 'NO_CONFIG' | 'DB_ERROR'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribeNewsletter(input: NewsletterSubscribeInput): Promise<NewsletterResult> {
  const email = input.email.trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, code: 'INVALID', message: 'Geçerli bir e-posta adresi girin.' }
  }
  if (email.length > 320) {
    return { ok: false, code: 'INVALID', message: 'E-posta çok uzun.' }
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, code: 'NO_CONFIG', message: 'Veritabanı yapılandırılmamış.' }
  }

  const supabase = getSupabaseAdmin()

  // Önce var mı bak — yoksa ekle, varsa "already" sinyali ver
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, is_active')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Daha önce abone olmuş ama unsubscribe etmişse yeniden aktive et
    if (!existing.is_active) {
      await supabase
        .from('newsletter_subscribers')
        .update({ is_active: true, unsubscribed_at: null, consent_at: new Date().toISOString() })
        .eq('id', existing.id)
    }
    return { ok: true, already: true }
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email,
      source: input.source?.slice(0, 60) || null,
      ip_address: input.ip_address?.slice(0, 60) || null,
    })

  if (error) {
    // race condition: bu arada başka istek aynı email'i ekledi — kullanıcıya başarı dön
    if (/duplicate key|unique/i.test(error.message)) {
      return { ok: true, already: true }
    }
    console.error('[newsletter] insert hatası:', error.message)
    return { ok: false, code: 'DB_ERROR', message: 'Abone olunamadı, lütfen tekrar deneyin.' }
  }

  return { ok: true, already: false }
}
