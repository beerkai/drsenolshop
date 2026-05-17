// ═══════════════════════════════════════════════════════════════
// Müşteri tarafı oturum yardımcıları
// ─ Supabase Auth (admin için zaten kurulu)
// ─ Müşteri: auth.users içindeki herhangi bir authenticated kullanıcı
//   ANCAK admin_users tablosunda olmayan
// ─ Müşteri'nin gördüğü orders RLS policy'sine bağlı (email match)
// ═══════════════════════════════════════════════════════════════

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null

  // Admin mı? (admin_users tablosundan kontrol)
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('email', user.email)
    .maybeSingle()

  return {
    user,
    email: user.email,
    isAdmin: Boolean(admin && admin.is_active !== false),
  }
}
