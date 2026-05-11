// ═══════════════════════════════════════════════════════════════
// Admin yetki kontrolleri — Server Component / Route Handler
// ─ requireAdmin: oturum + admin_users whitelist; eksikse redirect
// ─ getCurrentAdmin: throw etmeden döner (UI'da koşullu render için)
// ═══════════════════════════════════════════════════════════════

import { redirect } from 'next/navigation'
import { getSupabaseServer } from './supabase-server'
import type { User } from '@supabase/supabase-js'

export interface AdminContext {
  user: User
  admin: {
    id: string
    email: string
    full_name: string | null
    role: 'owner' | 'staff'
  }
}

export async function getCurrentAdmin(): Promise<AdminContext | null> {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active')
    .eq('email', user.email)
    .maybeSingle()

  if (!admin || admin.is_active === false) return null

  return {
    user,
    admin: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role as 'owner' | 'staff',
    },
  }
}

/** Admin yoksa /admin/giris'e redirect — Server Component'te kullan */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getCurrentAdmin()
  if (!ctx) redirect('/admin/giris')
  return ctx
}
