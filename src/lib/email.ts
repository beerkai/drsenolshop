// ═══════════════════════════════════════════════════════════════
// E-posta gönderim altyapısı — Resend
// ─ Server-only. RESEND_API_KEY env'i set değilse no-op (sessiz).
// ─ Sipariş onayı, status güncelleme bildirimleri için.
// ═══════════════════════════════════════════════════════════════

import type { Order, OrderItem } from '@/types'
import { formatPrice } from '@/types'
import type { BankInfo } from './site-settings'

interface EmailResult {
  ok: boolean
  id?: string
  error?: string
}

interface EmailConfig {
  apiKey: string
  fromAddress: string
  fromName: string
  replyTo?: string
}

function getConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'siparis@drsenolnaturalhoney.shop'
  const fromName = process.env.RESEND_FROM_NAME?.trim() || 'Dr. Şenol Shop'
  const replyTo = process.env.RESEND_REPLY_TO?.trim()
  if (!apiKey) return null
  return { apiKey, fromAddress, fromName, replyTo }
}

export function isEmailConfigured(): boolean {
  return getConfig() !== null
}

/** Düşük seviye Resend API çağrısı */
async function sendEmail(input: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<EmailResult> {
  const cfg = getConfig()
  if (!cfg) {
    console.warn('[email] RESEND_API_KEY eksik, mail gönderilmedi')
    return { ok: false, error: 'not_configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${cfg.fromName} <${cfg.fromAddress}>`,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: cfg.replyTo,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[email] resend hatası:', data)
      return { ok: false, error: data?.message ?? 'send_failed' }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    console.error('[email] network hatası:', err)
    return { ok: false, error: 'network' }
  }
}

// ─── HTML şablonu yardımcıları ──────────────────────────────────

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailLayout(opts: {
  preheader?: string
  title: string
  intro?: string
  bodyHtml: string
  cta?: { label: string; url: string }
}): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F0E8; font-family: Georgia, 'Times New Roman', serif; color:#1A1714;">

${opts.preheader ? `<div style="display:none; max-height:0; overflow:hidden; visibility:hidden; mso-hide:all; font-size:1px; line-height:1px;">${escapeHtml(opts.preheader)}</div>` : ''}

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F4F0E8;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background-color:#FFFFFF; border:1px solid #E0D8C7;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px; border-bottom:1px solid #E0D8C7;">
            <p style="margin:0 0 6px; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">DR. ŞENOL</p>
            <p style="margin:0; font-family:Menlo, Consolas, monospace; font-size:9px; letter-spacing:0.22em; color:#6B6258; text-transform:uppercase;">THE HONEY SCIENTIST · EST. 1985</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 24px;">
            <h1 style="margin:0 0 16px; font-family:Georgia, 'Times New Roman', serif; font-size:28px; font-weight:500; line-height:1.2; color:#1A1714; letter-spacing:-0.01em;">${escapeHtml(opts.title)}</h1>
            ${opts.intro ? `<p style="margin:0 0 24px; font-size:15px; line-height:1.65; color:#6B6258;">${escapeHtml(opts.intro)}</p>` : ''}

            ${opts.bodyHtml}

            ${opts.cta ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
              <tr>
                <td style="background-color:#C9A961; padding:14px 28px;">
                  <a href="${escapeHtml(opts.cta.url)}" style="display:inline-block; font-family:Menlo, Consolas, monospace; font-size:11px; letter-spacing:0.28em; color:#0A0908; text-decoration:none; text-transform:uppercase;">${escapeHtml(opts.cta.label)} &rarr;</a>
                </td>
              </tr>
            </table>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px 32px; border-top:1px solid #E0D8C7; background-color:#FAFAF7;">
            <p style="margin:0 0 8px; font-family:Menlo, Consolas, monospace; font-size:9.5px; letter-spacing:0.22em; color:#6B6258; text-transform:uppercase;">SAITABAT KÖYÜ · BURSA</p>
            <p style="margin:0; font-size:12px; color:#9B9285;">
              Bu e-posta sipariş&nbsp;kayıtlarınıza ulaşmanız için gönderildi.
              <br>
              Soru için: <a href="mailto:bilgi@drsenol.shop" style="color:#9C7C3C; text-decoration:none;">bilgi@drsenol.shop</a>
            </p>
          </td>
        </tr>

      </table>

      <p style="margin:16px 0 0; font-family:Menlo, Consolas, monospace; font-size:9.5px; letter-spacing:0.22em; color:#9B9285; text-transform:uppercase;">DRSENOL.SHOP</p>
    </td>
  </tr>
</table>
</body>
</html>`
}

function orderItemsTable(items: OrderItem[]): string {
  const rows = items
    .map((it) => {
      const variantLine = it.variant_label
        ? `<br><span style="font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.18em; color:#9B9285; text-transform:uppercase;">${escapeHtml(it.variant_label)}</span>`
        : ''
      return `
      <tr>
        <td style="padding:14px 0; border-bottom:1px solid #EDE9DE; vertical-align:top;">
          <p style="margin:0; font-family:Georgia, serif; font-size:15px; color:#1A1714; font-weight:500;">${escapeHtml(it.product_name)}${variantLine}</p>
          <p style="margin:6px 0 0; font-family:Menlo, Consolas, monospace; font-size:11px; color:#6B6258;">${it.quantity} × ${formatPrice(Number(it.unit_price))}</p>
        </td>
        <td style="padding:14px 0; border-bottom:1px solid #EDE9DE; text-align:right; vertical-align:top; font-family:Georgia, serif; font-size:16px; color:#1A1714; font-weight:500;">
          ${formatPrice(Number(it.subtotal))}
        </td>
      </tr>`
    })
    .join('')

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">${rows}</table>`
}

function totalsBlock(order: Order): string {
  const subtotal = Number(order.subtotal)
  const tax = Number(order.tax_amount ?? 0)
  const shipping = Number(order.shipping_cost ?? 0)
  const total = Number(order.total_amount)
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:11px; color:#6B6258;">Ara Toplam</td>
        <td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:11px; color:#6B6258; text-align:right;">${formatPrice(subtotal)}</td></tr>
    <tr><td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:10px; color:#9B9285;">· içerisinde KDV</td>
        <td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:10px; color:#9B9285; text-align:right;">${formatPrice(tax)}</td></tr>
    <tr><td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:11px; color:#6B6258;">Kargo</td>
        <td style="padding:4px 0; font-family:Menlo, Consolas, monospace; font-size:11px; text-align:right; color:${shipping > 0 ? '#6B6258' : '#4F7A2A'};">${shipping > 0 ? formatPrice(shipping) : 'Ücretsiz'}</td></tr>
    <tr><td colspan="2" style="padding:8px 0 0; border-top:1px solid #D4CFC0;"></td></tr>
    <tr>
      <td style="padding:10px 0 0; font-family:Menlo, Consolas, monospace; font-size:11px; letter-spacing:0.22em; color:#1A1714; text-transform:uppercase;">Toplam</td>
      <td style="padding:10px 0 0; font-family:Georgia, serif; font-size:22px; color:#9C7C3C; font-weight:500; text-align:right;">${formatPrice(total)}</td>
    </tr>
  </table>`
}

function bankInfoBlock(bank: BankInfo, orderNumber: string, total: number): string {
  if (!bank.bank_name && !bank.iban) return ''
  const ibanFormatted = bank.iban ? bank.iban.replace(/(.{4})/g, '$1 ').trim() : ''
  return `
  <div style="margin:24px 0 0; padding:20px; background-color:#FAFAF7; border:1px solid rgba(201,169,97,0.3);">
    <p style="margin:0 0 12px; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">Banka Bilgileri (Havale/EFT)</p>
    <p style="margin:0 0 16px; font-size:13px; line-height:1.6; color:#6B6258;">
      Aşağıdaki hesaba <strong style="color:#1A1714;">${formatPrice(total)}</strong> tutarında havale/EFT yapın.<br>
      Açıklamaya <strong style="color:#9C7C3C;">${escapeHtml(orderNumber)}</strong> yazmayı unutmayın.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E0D8C7; padding-top:12px;">
      ${bank.bank_name ? `<tr><td style="padding:6px 0; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.22em; color:#9B9285; text-transform:uppercase;">Banka</td>
        <td style="padding:6px 0; font-size:13px; color:#1A1714; text-align:right;">${escapeHtml(bank.bank_name)}</td></tr>` : ''}
      ${bank.account_holder ? `<tr><td style="padding:6px 0; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.22em; color:#9B9285; text-transform:uppercase;">Hesap Sahibi</td>
        <td style="padding:6px 0; font-size:13px; color:#1A1714; text-align:right;">${escapeHtml(bank.account_holder)}</td></tr>` : ''}
      ${ibanFormatted ? `<tr><td style="padding:6px 0; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.22em; color:#9B9285; text-transform:uppercase; vertical-align:top;">IBAN</td>
        <td style="padding:6px 0; font-family:Menlo, Consolas, monospace; font-size:12px; color:#1A1714; text-align:right; word-break:break-all;">${escapeHtml(ibanFormatted)}</td></tr>` : ''}
    </table>
  </div>`
}

function shippingAddressBlock(order: Order): string {
  const ship = order.shipping_address as Record<string, string> | null
  if (!ship) return ''
  return `
  <div style="margin:24px 0 0; padding:20px; background-color:#FAFAF7; border:1px solid #E0D8C7;">
    <p style="margin:0 0 12px; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">Teslimat Adresi</p>
    <p style="margin:0; font-size:14px; line-height:1.7; color:#1A1714;">
      <strong>${escapeHtml(ship.full_name)}</strong><br>
      ${escapeHtml(ship.address_line1)}${ship.address_line2 ? `, ${escapeHtml(ship.address_line2)}` : ''}<br>
      ${escapeHtml(ship.district)}, ${escapeHtml(ship.city)}${ship.postal_code ? ` ${escapeHtml(ship.postal_code)}` : ''}<br>
      <span style="font-family:Menlo, Consolas, monospace; font-size:12px; color:#6B6258;">${escapeHtml(ship.phone)}</span>
    </p>
  </div>`
}

// ─── Public API ─────────────────────────────────────────────────

export interface OrderConfirmationInput {
  order: Order
  items: OrderItem[]
  bankInfo: BankInfo | null
  siteUrl?: string
}

export async function sendOrderConfirmation(input: OrderConfirmationInput): Promise<EmailResult> {
  const { order, items, bankInfo } = input
  const siteUrl = (input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drsenolnaturalhoney.shop').replace(/\/$/, '')
  const orderUrl = `${siteUrl}/siparis/${order.order_number}`
  const trackUrl = `${siteUrl}/siparis-takibi?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer_email)}`

  const isBankTransfer = order.payment_method === 'bank_transfer'

  const body = `
    <div style="margin:0 0 24px; padding:16px 20px; background-color:#FAFAF7; border-left:3px solid #C9A961;">
      <p style="margin:0; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">Sipariş No</p>
      <p style="margin:6px 0 0; font-family:Menlo, Consolas, monospace; font-size:18px; color:#1A1714; letter-spacing:0.05em; font-weight:500;">${escapeHtml(order.order_number)}</p>
    </div>

    <p style="margin:0 0 12px; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">Ürünler</p>
    ${orderItemsTable(items)}

    ${totalsBlock(order)}

    ${isBankTransfer && bankInfo ? bankInfoBlock(bankInfo, order.order_number, Number(order.total_amount)) : ''}

    ${shippingAddressBlock(order)}

    <p style="margin:32px 0 0; font-size:13px; line-height:1.7; color:#6B6258;">
      Siparişinizi <a href="${escapeHtml(trackUrl)}" style="color:#9C7C3C;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}/siparis-takibi</a> sayfasından her zaman takip edebilirsiniz.
    </p>`

  const html = emailLayout({
    preheader: `Sipariş ${order.order_number} alındı — ${formatPrice(Number(order.total_amount))}`,
    title: 'Siparişinizi aldık.',
    intro: `Merhaba ${order.customer_name.split(' ')[0]}, ilgin için teşekkürler. Aşağıda sipariş özetin yer alıyor.`,
    bodyHtml: body,
    cta: { label: 'Siparişi Görüntüle', url: orderUrl },
  })

  const text = [
    `Dr. Şenol — Sipariş Onayı`,
    ``,
    `Sipariş No: ${order.order_number}`,
    `Toplam: ${formatPrice(Number(order.total_amount))}`,
    ``,
    `Takip: ${trackUrl}`,
  ].join('\n')

  return sendEmail({
    to: order.customer_email,
    subject: `Siparişiniz alındı — ${order.order_number}`,
    html,
    text,
  })
}

export interface OrderStatusUpdateInput {
  order: Order
  newStatus: Order['status']
  trackingNumber?: string | null
  siteUrl?: string
}

const STATUS_COPY: Record<string, { title: string; intro: string; cta: string }> = {
  paid: {
    title: 'Ödemeniz onaylandı.',
    intro: 'Havalenizi aldık, sipariş hazırlığa girdi.',
    cta: 'Siparişi Görüntüle',
  },
  preparing: {
    title: 'Siparişiniz hazırlanıyor.',
    intro: 'Ürünleriniz özenle paketleniyor.',
    cta: 'Siparişi Görüntüle',
  },
  shipped: {
    title: 'Siparişiniz yola çıktı.',
    intro: 'Kargo firmasına teslim ettik, yakında elinize ulaşır.',
    cta: 'Kargoyu Takip Et',
  },
  delivered: {
    title: 'Siparişiniz teslim edildi.',
    intro: 'Afiyetle kullanın. Geri bildiriminiz bizim için değerli.',
    cta: 'İletişime Geç',
  },
  cancelled: {
    title: 'Siparişiniz iptal edildi.',
    intro: 'Soru için bizimle iletişime geçebilirsiniz.',
    cta: 'İletişim',
  },
}

export async function sendOrderStatusUpdate(input: OrderStatusUpdateInput): Promise<EmailResult> {
  const copy = STATUS_COPY[input.newStatus]
  if (!copy) return { ok: false, error: 'no_template' }

  const siteUrl = (input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drsenolnaturalhoney.shop').replace(/\/$/, '')
  const orderUrl = `${siteUrl}/siparis-takibi?order=${encodeURIComponent(input.order.order_number)}&email=${encodeURIComponent(input.order.customer_email)}`

  const trackingBlock = input.trackingNumber
    ? `
    <div style="margin:16px 0 0; padding:14px 18px; background-color:rgba(201,169,97,0.08); border:1px solid rgba(201,169,97,0.3);">
      <p style="margin:0 0 4px; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.22em; color:#9C7C3C; text-transform:uppercase;">Kargo Takip No</p>
      <p style="margin:0; font-family:Menlo, Consolas, monospace; font-size:14px; color:#1A1714; letter-spacing:0.05em; word-break:break-all;">${escapeHtml(input.trackingNumber)}</p>
    </div>`
    : ''

  const body = `
    <div style="margin:0 0 24px; padding:16px 20px; background-color:#FAFAF7; border-left:3px solid #C9A961;">
      <p style="margin:0; font-family:Menlo, Consolas, monospace; font-size:10px; letter-spacing:0.3em; color:#9C7C3C; text-transform:uppercase;">Sipariş No</p>
      <p style="margin:6px 0 0; font-family:Menlo, Consolas, monospace; font-size:18px; color:#1A1714; letter-spacing:0.05em; font-weight:500;">${escapeHtml(input.order.order_number)}</p>
    </div>
    ${trackingBlock}`

  const html = emailLayout({
    preheader: copy.title,
    title: copy.title,
    intro: copy.intro,
    bodyHtml: body,
    cta: { label: copy.cta, url: orderUrl },
  })

  return sendEmail({
    to: input.order.customer_email,
    subject: `${copy.title} — ${input.order.order_number}`,
    html,
  })
}
