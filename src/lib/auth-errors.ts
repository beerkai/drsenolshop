// ═══════════════════════════════════════════════════════════════
// Supabase auth ham hata mesajlarını Türkçe'ye çevir
// ─ /api/auth/customer/* route'larında tek nokta
// ─ Pattern listesi büyüdükçe buraya ekle
// ─ Tanımadığımız hata için generic fallback
// ═══════════════════════════════════════════════════════════════

interface PatternRule {
  match: RegExp
  message: string
}

const RULES: PatternRule[] = [
  // Giriş
  { match: /invalid login credentials|invalid_credentials/i,         message: 'E-posta veya şifre hatalı.' },
  { match: /email not confirmed|email_not_confirmed/i,               message: 'E-posta adresiniz henüz onaylanmamış. Gelen kutunuzdaki onay linkini tıklayın.' },
  { match: /user not found|no user found/i,                          message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' },

  // Kayıt
  { match: /already registered|already in use|already exists|user_already_exists/i,
    message: 'Bu e-posta zaten kayıtlı. Lütfen giriş yapın.' },
  { match: /weak password|password should be|password_too_short/i,
    message: 'Şifre yeterince güçlü değil. En az 8 karakter, harf ve rakam içermeli.' },
  { match: /invalid email|email_address_invalid/i,                   message: 'Geçerli bir e-posta adresi girin.' },

  // E-posta gönderim / rate limit
  { match: /email rate limit exceeded|over_email_send_rate_limit/i,
    message: 'Çok fazla e-posta gönderildi. Lütfen 1 saat sonra tekrar deneyin.' },
  { match: /signup_disabled/i,                                       message: 'Şu an yeni kayıtlar kapalı.' },
  { match: /error sending|smtp/i,                                    message: 'Onay e-postası gönderilemedi. Lütfen tekrar deneyin veya farklı bir e-posta ile kaydolun.' },

  // Sıfırlama / şifre güncelleme
  { match: /same password|password_same/i,                           message: 'Yeni şifre, eskisinden farklı olmalı.' },
  { match: /token (has )?expired|otp_expired|recovery.+expired/i,    message: 'Bağlantının süresi dolmuş. Lütfen yeniden sıfırlama isteği gönderin.' },
  { match: /invalid token|invalid_token|bad_jwt/i,                   message: 'Bağlantı geçersiz. Lütfen yeniden sıfırlama isteği gönderin.' },

  // Genel
  { match: /captcha/i,                                               message: 'Doğrulama başarısız. Lütfen tekrar deneyin.' },
  { match: /network|fetch failed|timeout/i,                          message: 'Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.' },
]

/**
 * Supabase error'unu Türkçe metne çevir.
 * Tanımadığımız hatada generic fallback döner ve console'a orijinal mesaj basılır.
 */
export function translateAuthError(input: { message?: string | null; code?: string | null } | null | undefined, fallback = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'): string {
  if (!input) return fallback
  const haystack = [input.message, input.code].filter(Boolean).join(' ')
  if (!haystack) return fallback

  for (const rule of RULES) {
    if (rule.match.test(haystack)) return rule.message
  }

  // Geliştirici görsün — production'da log'lara düşer
  console.warn('[auth-errors] çevrilmemiş hata:', haystack)
  return fallback
}
