// ═══════════════════════════════════════════════════════════════
// Admin e-posta galerisi — örnek sipariş verisi (önizleme)
// ═══════════════════════════════════════════════════════════════

import type { Order, OrderItem } from '@/types'
import type { BankInfo } from './site-settings'

const NOW = '2026-09-19T14:32:00.000Z'

export const SAMPLE_BANK_INFO: BankInfo = {
  bank_name: 'Türkiye İş Bankası',
  account_holder: 'Dr. Şenol Arıcılık Ltd. Şti.',
  iban: 'TR330006100519786457841326',
  enabled: true,
}

function baseOrder(overrides: Partial<Order>): Order {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    order_number: 'DS-2026-0042',
    status: 'pending',
    customer_email: 'ayse.yilmaz@ornek.com',
    customer_phone: '+90 532 000 00 00',
    customer_name: 'Ayşe Yılmaz',
    user_id: null,
    shipping_address: {
      full_name: 'Ayşe Yılmaz',
      address_line1: 'Atatürk Cad. No: 12 Daire: 4',
      address_line2: '',
      district: 'Nilüfer',
      city: 'Bursa',
      postal_code: '16110',
      phone: '+90 532 000 00 00',
    },
    billing_address: null,
    shipping_method: 'standart',
    shipping_cost: 0,
    subtotal: 1180,
    tax_amount: 196.67,
    discount_amount: 0,
    total_amount: 1180,
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    payment_ref: null,
    paytr_response: null,
    paid_at: null,
    notes: null,
    tracking_number: null,
    reminded_at: null,
    reminder_count: 0,
    stock_decremented_at: null,
    coupon_code: null,
    coupon_consumed_at: null,
    created_at: NOW,
    updated_at: NOW,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    ...overrides,
  }
}

export const SAMPLE_ORDER_BANK = baseOrder({ payment_method: 'bank_transfer', payment_status: 'pending' })
export const SAMPLE_ORDER_PAYTR = baseOrder({
  payment_method: 'paytr',
  payment_status: 'pending',
  order_number: 'DS-2026-0043',
})

export const SAMPLE_ORDER_ITEMS: OrderItem[] = [
  {
    id: '00000000-0000-4000-8000-000000000011',
    order_id: SAMPLE_ORDER_BANK.id,
    product_id: null,
    variant_id: null,
    product_name: 'Kestane Balı',
    variant_label: '850 gr',
    sku: 'KB-850',
    product_slug: 'kestane-bali',
    product_image: 'kestane-bali/850/0.webp',
    unit_price: 890,
    tax_rate: 20,
    quantity: 1,
    subtotal: 890,
    created_at: NOW,
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    order_id: SAMPLE_ORDER_BANK.id,
    product_id: null,
    variant_id: null,
    product_name: 'Propolis Damla',
    variant_label: '30 ml',
    sku: 'PR-30',
    product_slug: 'propolis-damla',
    product_image: 'propolis-damla/0.webp',
    unit_price: 290,
    tax_rate: 20,
    quantity: 1,
    subtotal: 290,
    created_at: NOW,
  },
]

export const SAMPLE_SITE_URL = 'https://drsenol.shop'
