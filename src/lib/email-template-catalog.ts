// ═══════════════════════════════════════════════════════════════
// E-posta şablon kataloğu — admin galerisi metadata + HTML üretimi
// ═══════════════════════════════════════════════════════════════

import { readFile } from 'fs/promises'
import path from 'path'
import {
  buildOrderConfirmationHtml,
  buildOrderStatusUpdateHtml,
  buildPaymentReminderHtml,
} from './email'
import {
  SAMPLE_BANK_INFO,
  SAMPLE_ORDER_BANK,
  SAMPLE_ORDER_ITEMS,
  SAMPLE_ORDER_PAYTR,
  SAMPLE_SITE_URL,
} from './email-sample-data'
import type { OrderStatus } from '@/types'

export type EmailTemplateChannel = 'resend' | 'supabase_auth'

export interface EmailTemplateDefinition {
  id: string
  channel: EmailTemplateChannel
  category: 'siparis' | 'odeme' | 'durum' | 'auth'
  title: string
  description: string
  trigger: string
  subject: string
  /** Supabase Auth template adı (Dashboard) */
  supabaseTemplateName?: string
  /** Repo'daki HTML dosya adı */
  authFile?: string
  codeRef?: string
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Ödeme onaylandı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
}

const AUTH_TEMPLATES: EmailTemplateDefinition[] = [
  {
    id: 'auth_confirm_signup',
    channel: 'supabase_auth',
    category: 'auth',
    title: 'Hesap onayı (Confirm signup)',
    description: 'Yeni kayıt sonrası e-posta doğrulama linki.',
    trigger: 'POST /auth signup → Supabase Auth mailer',
    subject: 'Dr. Şenol — Hesabınızı onaylayın',
    supabaseTemplateName: 'Confirm signup',
    authFile: 'confirm-signup.html',
  },
  {
    id: 'auth_magic_link',
    channel: 'supabase_auth',
    category: 'auth',
    title: 'Magic link',
    description: 'Şifresiz tek kullanımlık giriş linki.',
    trigger: 'signInWithOtp / magic link',
    subject: 'Dr. Şenol — Tek kullanımlık giriş linki',
    supabaseTemplateName: 'Magic Link',
    authFile: 'magic-link.html',
  },
  {
    id: 'auth_reset_password',
    channel: 'supabase_auth',
    category: 'auth',
    title: 'Şifre sıfırlama',
    description: '/sifre-unuttum akışından gelen sıfırlama maili.',
    trigger: 'resetPasswordForEmail',
    subject: 'Dr. Şenol — Şifre sıfırlama isteği',
    supabaseTemplateName: 'Reset Password',
    authFile: 'reset-password.html',
  },
  {
    id: 'auth_change_email',
    channel: 'supabase_auth',
    category: 'auth',
    title: 'E-posta değişikliği',
    description: 'Hesapta yeni e-posta adresi onayı.',
    trigger: 'updateUser email change',
    subject: 'Dr. Şenol — E-posta adresinizi onaylayın',
    supabaseTemplateName: 'Change Email Address',
    authFile: 'change-email.html',
  },
  {
    id: 'auth_invite_user',
    channel: 'supabase_auth',
    category: 'auth',
    title: 'Davet',
    description: 'Admin veya Supabase üzerinden kullanıcı daveti.',
    trigger: 'inviteUserByEmail',
    subject: 'Dr. Şenol — Hesap daveti',
    supabaseTemplateName: 'Invite user',
    authFile: 'invite-user.html',
  },
]

function resendTransactional(): EmailTemplateDefinition[] {
  const siteUrl = SAMPLE_SITE_URL
  const base = {
    channel: 'resend' as const,
    codeRef: 'src/lib/email.ts',
  }

  const confirmationBank = buildOrderConfirmationHtml({
    order: SAMPLE_ORDER_BANK,
    items: SAMPLE_ORDER_ITEMS,
    bankInfo: SAMPLE_BANK_INFO,
    siteUrl,
  })

  const confirmationPaytr = buildOrderConfirmationHtml({
    order: SAMPLE_ORDER_PAYTR,
    items: SAMPLE_ORDER_ITEMS,
    bankInfo: SAMPLE_BANK_INFO,
    siteUrl,
  })

  const reminderBank1 = buildPaymentReminderHtml({
    order: SAMPLE_ORDER_BANK,
    bankInfo: SAMPLE_BANK_INFO,
    attempt: 1,
    siteUrl,
  })

  const reminderBank2 = buildPaymentReminderHtml({
    order: SAMPLE_ORDER_BANK,
    bankInfo: SAMPLE_BANK_INFO,
    attempt: 2,
    siteUrl,
  })

  const reminderPaytr = buildPaymentReminderHtml({
    order: SAMPLE_ORDER_PAYTR,
    bankInfo: null,
    attempt: 1,
    siteUrl,
  })

  const transactional: EmailTemplateDefinition[] = [
    {
      id: 'order_confirmation_bank',
      category: 'siparis',
      title: 'Sipariş onayı · Havale/EFT',
      description: 'Checkout sonrası sipariş özeti, banka bilgileri ve teslimat adresi.',
      trigger: 'POST /api/orders (bank_transfer) → sendOrderConfirmation',
      subject: confirmationBank.subject,
      ...base,
    },
    {
      id: 'order_confirmation_paytr',
      category: 'siparis',
      title: 'Sipariş onayı · PayTR',
      description: 'Kart ödemeli siparişte banka bloğu olmadan özet.',
      trigger: 'POST /api/orders (paytr) veya PayTR callback sonrası',
      subject: confirmationPaytr.subject,
      ...base,
    },
    {
      id: 'payment_reminder_bank_1',
      category: 'odeme',
      title: 'Ödeme hatırlatması · 1. gönderim (havale)',
      description: 'Pending sipariş için ilk nazik hatırlatma.',
      trigger: 'Cron /api/cron/order-reminders (08:00 UTC)',
      subject: reminderBank1.subject,
      ...base,
    },
    {
      id: 'payment_reminder_bank_2',
      category: 'odeme',
      title: 'Ödeme hatırlatması · 2. gönderim (havale)',
      description: 'İkinci hatırlatma metni — iptal seçeneği vurgulu.',
      trigger: 'Cron order-reminders (reminder_count ≥ 1)',
      subject: reminderBank2.subject,
      ...base,
    },
    {
      id: 'payment_reminder_paytr_1',
      category: 'odeme',
      title: 'Ödeme hatırlatması · PayTR',
      description: 'Tamamlanmamış kart ödemesi için ödeme sayfası CTA.',
      trigger: 'Cron order-reminders (payment_method=paytr)',
      subject: reminderPaytr.subject,
      ...base,
    },
  ]

  const statuses: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered', 'cancelled']
  for (const status of statuses) {
    const order =
      status === 'shipped'
        ? { ...SAMPLE_ORDER_BANK, status, tracking_number: '1234567890' }
        : { ...SAMPLE_ORDER_BANK, status }
    const built = buildOrderStatusUpdateHtml({
      order,
      newStatus: status,
      trackingNumber: status === 'shipped' ? '1234567890' : null,
      siteUrl,
    })
    if (!built) continue
    transactional.push({
      id: `order_status_${status}`,
      category: 'durum',
      title: `Durum güncellemesi · ${STATUS_LABELS[status] ?? status}`,
      description: `Admin sipariş durumu "${status}" yapınca müşteriye gider.`,
      trigger: 'PATCH /api/admin/orders/[id] (status değişimi)',
      subject: built.subject,
      ...base,
    })
  }

  return transactional
}

/** Tüm şablon tanımları (subject satırı dinamik üretilir) */
export function listEmailTemplates(): EmailTemplateDefinition[] {
  return [...resendTransactional(), ...AUTH_TEMPLATES]
}

export function getEmailTemplateById(id: string): EmailTemplateDefinition | undefined {
  return listEmailTemplates().find((t) => t.id === id)
}

const AUTH_SAMPLE_VARS: Record<string, string> = {
  '{{ .ConfirmationURL }}': `${SAMPLE_SITE_URL}/auth/callback?next=/hesabim&code=preview-ornek`,
  '{{ .Email }}': 'ayse.yilmaz@ornek.com',
  '{{ .SiteURL }}': SAMPLE_SITE_URL,
  '{{ .Token }}': '482910',
}

async function readAuthTemplateHtml(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'supabase', 'email-templates', fileName)
  let raw = await readFile(filePath, 'utf8')
  for (const [token, value] of Object.entries(AUTH_SAMPLE_VARS)) {
    raw = raw.split(token).join(value)
  }
  return raw
}

/** Admin önizleme — tam HTML döner */
export async function renderEmailTemplateHtml(id: string): Promise<{ html: string; subject: string } | null> {
  const def = getEmailTemplateById(id)
  if (!def) return null

  if (def.channel === 'supabase_auth' && def.authFile) {
    const html = await readAuthTemplateHtml(def.authFile)
    return { html, subject: def.subject }
  }

  const siteUrl = SAMPLE_SITE_URL

  switch (id) {
    case 'order_confirmation_bank':
      return buildOrderConfirmationHtml({
        order: SAMPLE_ORDER_BANK,
        items: SAMPLE_ORDER_ITEMS,
        bankInfo: SAMPLE_BANK_INFO,
        siteUrl,
      })
    case 'order_confirmation_paytr':
      return buildOrderConfirmationHtml({
        order: SAMPLE_ORDER_PAYTR,
        items: SAMPLE_ORDER_ITEMS,
        bankInfo: SAMPLE_BANK_INFO,
        siteUrl,
      })
    case 'payment_reminder_bank_1':
      return buildPaymentReminderHtml({
        order: SAMPLE_ORDER_BANK,
        bankInfo: SAMPLE_BANK_INFO,
        attempt: 1,
        siteUrl,
      })
    case 'payment_reminder_bank_2':
      return buildPaymentReminderHtml({
        order: SAMPLE_ORDER_BANK,
        bankInfo: SAMPLE_BANK_INFO,
        attempt: 2,
        siteUrl,
      })
    case 'payment_reminder_paytr_1':
      return buildPaymentReminderHtml({
        order: SAMPLE_ORDER_PAYTR,
        bankInfo: null,
        attempt: 1,
        siteUrl,
      })
    default:
      if (id.startsWith('order_status_')) {
        const status = id.replace('order_status_', '') as OrderStatus
        const order =
          status === 'shipped'
            ? { ...SAMPLE_ORDER_BANK, status, tracking_number: '1234567890' }
            : { ...SAMPLE_ORDER_BANK, status }
        const built = buildOrderStatusUpdateHtml({
          order,
          newStatus: status,
          trackingNumber: status === 'shipped' ? '1234567890' : null,
          siteUrl,
        })
        return built
      }
      return null
  }
}

/** JSON API — ham HTML (kopyala) */
export async function renderEmailTemplateForApi(id: string): Promise<{
  id: string
  subject: string
  html: string
  definition: EmailTemplateDefinition
} | null> {
  const definition = getEmailTemplateById(id)
  if (!definition) return null
  const rendered = await renderEmailTemplateHtml(id)
  if (!rendered) return null
  return { id, subject: rendered.subject, html: rendered.html, definition }
}
