// ═══════════════════════════════════════════════════════════════
// Müşteri tarafı oturum yardımcıları
// ─ Supabase Auth (admin için zaten kurulu)
// ─ Müşteri: auth.users içindeki herhangi bir authenticated kullanıcı
//   ANCAK admin_users tablosunda olmayan
// ─ Müşteri'nin gördüğü orders RLS policy'sine bağlı (email match)
// ═══════════════════════════════════════════════════════════════

import { findAdminByEmailFallback, isActiveAdmin } from './admin-whitelist'
import { getSupabaseServer } from './supabase-server'
import type { User } from '@supabase/supabase-js'

export interface CustomerContext {
  user: User
  email: string
  isAdmin: boolean
}

/**
 * Mevcut oturumdaki müşteriyi döner.
 * Hem normal müşteri hem admin (admin de müşteri olabilir) için çalışır.
 */
export async function getCurrentCustomer(): Promise<CustomerContext | null> {
  const supabase = await getSupabaseServer()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null

  // Admin mı? Whitelist service role ile — RLS policy eksikse de doğru döner.
  const admin = await findAdminByEmailFallback(user.email, supabase)

  return {
    user,
    email: user.email,
    isAdmin: isActiveAdmin(admin),
  }
}
