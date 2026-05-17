// ═══════════════════════════════════════════════════════════════
// PayTR iframe ödeme yardımcıları
// ─ Token üretimi (HMAC-SHA256 base64 hash)
// ─ Callback hash doğrulama
// ─ Env eksikse isPaytrConfigured() false → checkout PayTR seçeneği gizler,
//   /api/payments/paytr/* 503 döner
// ─ Test modunda PAYTR_TEST_MODE=1 set edilmeli
//
// Referans: https://dev.paytr.com/iframe-api
// ═══════════════════════════════════════════════════════════════

import crypto from 'node:crypto'
import type { Order, OrderItem } from '@/types'

const PAYTR_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token'

export interface PaytrCredentials {
  merchant_id: string
  merchant_key: string
  merchant_salt: string
  test_mode: '0' | '1'
}

export function getPaytrCredentials(): PaytrCredentials | null {
  const merchant_id = process.env.PAYTR_MERCHANT_ID?.trim()
  const merchant_key = process.env.PAYTR_MERCHANT_KEY?.trim()
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT?.trim()
  if (!merchant_id || !merchant_key || !merchant_salt) return null
  const test_mode = process.env.PAYTR_TEST_MODE?.trim() === '1' ? '1' : '0'
  return { merchant_id, merchant_key, merchant_salt, test_mode }
}

export function isPaytrConfigured(): boolean {
  return getPaytrCredentials() !== null
}

// PayTR user_basket: base64(JSON([[name, price_str, quantity], ...]))
export function buildPaytrBasket(items: OrderItem[]): string {
  const arr = items.map((it) => {
    const name = it.product_name + (it.variant_label ? ` / ${it.variant_label}` : '')
    // PayTR fiyat formatı: "100.00" (string, nokta ondalık)
    const price = (Math.round(it.unit_price * 100) / 100).toFixed(2)
    return [name.slice(0, 80), price, it.quantity]
  })
  return Buffer.from(JSON.stringify(arr), 'utf8').toString('base64')
}

interface InitInput {
  order: Order
  items: OrderItem[]
  user_ip: string
  merchant_ok_url: string
  merchant_fail_url: string
}

export interface PaytrInitResult {
  ok: true
  token: string
  iframe_url: string
}

export interface PaytrInitError {
  ok: false
  status: number
  message: string
  raw?: unknown
}

/**
 * PayTR get-token endpoint'inden iframe token'ı alır.
 * Fiyat kuruş cinsinden gönderilir (1250.50 TL → 125050).
 */
export async function paytrInitToken(input: InitInput): Promise<PaytrInitResult | PaytrInitError> {
  const cred = getPaytrCredentials()
  if (!cred) {
    return { ok: false, status: 503, message: 'PayTR yapılandırılmamış' }
  }

  const merchant_oid = input.order.order_number.replace(/[^a-zA-Z0-9]/g, '') // PayTR alphanumeric
  const email = input.order.customer_email
  const payment_amount = String(Math.round(input.order.total_amount * 100)) // kuruş
  const user_name = input.order.customer_name
  const user_phone = input.order.customer_phone || '0000000000'
  const shippingAddr = (input.order.shipping_address ?? {}) as Record<string, string>
  const user_address = [
    shippingAddr.address_line1,
    shippingAddr.address_line2,
    shippingAddr.district,
    shippingAddr.city,
  ].filter(Boolean).join(', ').slice(0, 400) || '-'

  const user_basket = buildPaytrBasket(input.items)
  const no_installment = '0'
  const max_installment = '0'
  const currency = 'TL'
  const timeout_limit = '30'
  const lang = 'tr'

  // Hash hesaplama — PayTR docs sırası önemli
  const hashStr =
    cred.merchant_id +
    input.user_ip +
    merchant_oid +
    email +
    payment_amount +
    user_basket +
    no_installment +
    max_installment +
    currency +
    cred.test_mode

  const paytr_token = crypto
    .createHmac('sha256', cred.merchant_key)
    .update(hashStr + cred.merchant_salt)
    .digest('base64')

  const params = new URLSearchParams({
    merchant_id: cred.merchant_id,
    user_ip: input.user_ip,
    merchant_oid,
    email,
    payment_amount,
    paytr_token,
    user_basket,
    debug_on: '1',
    no_installment,
    max_installment,
    user_name,
    user_address,
    user_phone,
    merchant_ok_url: input.merchant_ok_url,
    merchant_fail_url: input.merchant_fail_url,
    timeout_limit,
    currency,
    test_mode: cred.test_mode,
    lang,
  })

  let res: Response
  try {
    res = await fetch(PAYTR_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
  } catch (err) {
    return { ok: false, status: 502, message: `PayTR'ye ulaşılamadı: ${(err as Error).message}` }
  }

  let json: { status?: string; token?: string; reason?: string }
  try {
    json = await res.json()
  } catch {
    return { ok: false, status: 502, message: 'PayTR cevabı parse edilemedi' }
  }

  if (json.status !== 'success' || !json.token) {
    return { ok: false, status: 400, message: json.reason || 'PayTR token alınamadı', raw: json }
  }

  return {
    ok: true,
    token: json.token,
    iframe_url: `https://www.paytr.com/odeme/guvenli/${json.token}`,
  }
}

/**
 * PayTR async callback hash doğrulama.
 * PayTR şu form-encoded fields gönderir:
 *   merchant_oid, status (success|failed), total_amount, hash, ...
 */
export function verifyPaytrCallback(form: Record<string, string>): boolean {
  const cred = getPaytrCredentials()
  if (!cred) return false

  const merchant_oid = form.merchant_oid
  const status = form.status
  const total_amount = form.total_amount
  const hash = form.hash
  if (!merchant_oid || !status || !total_amount || !hash) return false

  const expected = crypto
    .createHmac('sha256', cred.merchant_key)
    .update(merchant_oid + cred.merchant_salt + status + total_amount)
    .digest('base64')

  return expected === hash
}

/** Client IP'i alır — header öncelikli */
export function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return '0.0.0.0'
}
