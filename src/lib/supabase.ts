// ═══════════════════════════════════════════════════════════════
// Supabase Client'ları
// - supabase: Client tarafı (anon key) — frontend, herkese açık okuma
// - getSupabaseAdmin: Service role — yalnızca sunucu, API route ve script'ler
// ═══════════════════════════════════════════════════════════════

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const eksik: string[] = []
  if (!supabaseUrl) eksik.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) eksik.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error(`${eksik.join(', ')} ortam değişkeni tanımlı değil`)
}

/** Modül yüklendiğinde doğrulanmış URL (TS için dar tip) */
const resolvedPublicUrl: string = supabaseUrl
/** Modül yüklendiğinde doğrulanmış anon anahtar */
const resolvedAnonKey: string = supabaseAnonKey

// ───────────────────────────────────────────────────────────────
// Public client (tarayıcı + Server Component okuma)
// ───────────────────────────────────────────────────────────────

export const supabase: SupabaseClient = createClient(resolvedPublicUrl, resolvedAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ───────────────────────────────────────────────────────────────
// Admin client — anahtar yoksa hata fırlatır (çağıran bilgilendirilir)
// ───────────────────────────────────────────────────────────────

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil. ' +
        'Sadece server tarafında kullanılabilir.'
    )
  }

  return createClient(resolvedPublicUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
