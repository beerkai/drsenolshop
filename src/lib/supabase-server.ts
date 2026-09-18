// ═══════════════════════════════════════════════════════════════
// Server-side Supabase client'ları (App Router cookie tabanlı auth)
// ─ @supabase/ssr ile httpOnly cookie üzerinden session yönetimi
// ─ Sadece Server Component, Route Handler ve Server Action içinde
// ═══════════════════════════════════════════════════════════════

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSupabaseConfigured } from './supabase'

function requirePublicConfig(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  return { url, anonKey }
}

/**
 * Server Component / Route Handler için cookie-bound Supabase client.
 * Next.js 16'da cookies() async — bu yüzden helper async.
 */
/** Env yoksa null — build/preview sırasında auth sayfaları kırılmasın */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  const config = requirePublicConfig()
  if (!config) return null
  const { url, anonKey } = config
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Component'ten set çağrılırsa hata fırlatır — middleware'de
          // refresh yapıldığı için burada sessiz başarısızlık güvenli.
        }
      },
    },
  })
}

/** API route'lar — env zorunlu */
export async function requireSupabaseServer(): Promise<SupabaseClient> {
  const client = await getSupabaseServer()
  if (!client) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik')
  }
  return client
}
