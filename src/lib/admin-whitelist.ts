// ═══════════════════════════════════════════════════════════════
// admin_users whitelist okuması
// ─ Kimlik her zaman oturumdan gelir (signIn / getUser).
// ─ Satır okuma service role ile yapılır: RLS policy (0003) canlıda
//   yoksa kullanıcı kapsamlı SELECT boş döner ve sahibi kilitler.
// ─ Service role yoksa çağıran, oturum client'ına düşebilir.
// ═══════════════════════════════════════════════════════════════

import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from './supabase'

export interface AdminWhitelistRow {
  id: string
  email: string
  full_name: string | null
  role: string | null
  is_active: boolean | null
}

const ADMIN_COLUMNS = 'id, email, full_name, role, is_active'

function emailCandidates(email: string): string[] {
  const trimmed = email.trim()
  if (!trimmed) return []
  const lower = trimmed.toLowerCase()
  return lower === trimmed ? [trimmed] : [trimmed, lower]
}

async function selectByEmail(
  client: SupabaseClient,
  email: string,
): Promise<AdminWhitelistRow | null> {
  for (const candidate of emailCandidates(email)) {
    const { data, error } = await client
      .from('admin_users')
      .select(ADMIN_COLUMNS)
      .eq('email', candidate)
      .maybeSingle()
    if (error) throw error
    if (data) return data as AdminWhitelistRow
  }
  return null
}

/** Service role ile whitelist satırı. Hata fırlatır; boş sonuç null. */
export async function findAdminByEmail(email: string): Promise<AdminWhitelistRow | null> {
  return selectByEmail(getSupabaseAdmin(), email)
}

/**
 * Önce service role. Anahtar/ağ hatasında oturum client'ına düşer.
 * O da patlarsa null — çağıran "yetki yok" gibi davranır.
 */
export async function findAdminByEmailFallback(
  email: string,
  userScoped: SupabaseClient,
): Promise<AdminWhitelistRow | null> {
  try {
    return await findAdminByEmail(email)
  } catch (err) {
    console.error(
      '[admin-whitelist] service role okunamadı:',
      err instanceof Error ? err.message : err,
    )
  }

  try {
    return await selectByEmail(userScoped, email)
  } catch (err) {
    console.error(
      '[admin-whitelist] oturum sorgusu da başarısız:',
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

export function isActiveAdmin(row: AdminWhitelistRow | null): row is AdminWhitelistRow {
  return Boolean(row && row.is_active !== false)
}

/** UPDATE policy olmasa da son girişi yazar. Başarısızlık girişi bozmaz. */
export async function touchAdminLastLogin(id: string): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin()
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('[admin-whitelist] last_login güncellenemedi:', error.message)
    }
  } catch (err) {
    console.error(
      '[admin-whitelist] last_login güncellenemedi:',
      err instanceof Error ? err.message : err,
    )
  }
}
