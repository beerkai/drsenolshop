// Ayarlar sayfası — sunucu veri paketi (API + test)

import type { AdminContext } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getBankInfo, getShippingConfig, type BankInfo, type ShippingConfig } from '@/lib/site-settings'
import { getBroadcastChatIds } from '@/lib/telegram'
import { isEmailConfigured } from '@/lib/email'
import { isPaytrConfigured, isPaytrTestMode } from '@/lib/paytr'

export interface AdminUserRow {
  id: string
  email: string
  full_name: string | null
  role: 'owner' | 'staff'
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface AyarlarPagePayload {
  admin: {
    id: string
    email: string
    full_name: string | null
    role: 'owner' | 'staff'
  }
  bankInfo: BankInfo
  shippingConfig: ShippingConfig
  telegramConfigured: boolean
  emailConfigured: boolean
  paytrConfigured: boolean
  paytrTestMode: boolean
  adminHostsRaw: string
  broadcastRecipientCount: number
  resendFromEmail: string
  admins: AdminUserRow[]
}

export async function loadAyarlarPageData(ctx: AdminContext): Promise<AyarlarPagePayload> {
  const adminHostsRaw = process.env.ADMIN_HOSTS?.trim() ?? '(kısıt yok)'
  const broadcastIds = getBroadcastChatIds()

  const [bankInfo, shippingConfig, admins] = await Promise.all([
    getBankInfo(),
    getShippingConfig(),
    ctx.admin.role === 'owner'
      ? getSupabaseAdmin()
          .from('admin_users')
          .select('id, email, full_name, role, is_active, last_login_at, created_at')
          .order('created_at', { ascending: true })
          .then((r) => (r.data ?? []) as AdminUserRow[])
      : Promise.resolve([] as AdminUserRow[]),
  ])

  return {
    admin: {
      id: ctx.admin.id,
      email: ctx.admin.email,
      full_name: ctx.admin.full_name,
      role: ctx.admin.role,
    },
    bankInfo,
    shippingConfig,
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()) && Boolean(process.env.TELEGRAM_CHAT_ID?.trim()),
    emailConfigured: isEmailConfigured(),
    paytrConfigured: isPaytrConfigured(),
    paytrTestMode: isPaytrTestMode(),
    adminHostsRaw,
    broadcastRecipientCount: broadcastIds.length,
    resendFromEmail: process.env.RESEND_FROM_EMAIL ?? 'siparis@drsenol.shop (default)',
    admins,
  }
}
