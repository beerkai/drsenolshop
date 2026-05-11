// ═══════════════════════════════════════════════════════════════
// Supabase Client'ları
// - getSupabase: anon key — lazy init (modül importunda env zorunlu değil)
// - getSupabaseAdmin: Service role — yalnızca sunucu / API / script
//
// Deploy: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY
// Vercel → Project → Settings → Environment Variables içinde tanımlı olmalı.
// ═══════════════════════════════════════════════════════════════

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserServerClient: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

/** Anasayfa SSG vb. için: env yoksa sorgu yapmadan boş sonuç dönmek üzere */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

function requirePublicConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) {
    const eksik: string[] = []
    if (!url) eksik.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) eksik.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error(`${eksik.join(', ')} ortam değişkeni tanımlı değil`)
  }
  return { url, anonKey }
}

/** Public client (Server Component okuma, tarayıcı) — ilk çağrıda oluşturulur */
export function getSupabase(): SupabaseClient {
  if (browserServerClient) return browserServerClient
  const { url, anonKey } = requirePublicConfig()
  browserServerClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return browserServerClient
}

/** Admin client — service role key zorunlu */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil. ' +
        'Sadece sunucu tarafında kullanılabilir.'
    )
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlı değil')
  }
  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return adminClient
}
