// ═══════════════════════════════════════════════════════════════
// Kargo politikası metinleri — admin `shipping_config` ile senkron
// ═══════════════════════════════════════════════════════════════

import { formatPrice } from '@/types'
import type { ShippingConfig } from '@/lib/site-settings'

export const SHIPPING_CUTOFF = "hafta içi 14:00"
export const SHIPPING_WINDOW = '2–4 iş günü'

export interface ShippingCopy {
  intro: string
  items: string[]
  courierLine: string | null
}

export function shippingCopy(config: ShippingConfig): ShippingCopy {
  const { flat_fee, free_threshold, courier_name } = config
  const courierLine = courier_name
    ? `Anlaşmalı kargo: ${courier_name}.`
    : null

  const cadence = [
    `Aynı gün kargo: ${SHIPPING_CUTOFF}'e kadar onaylanan ödemelerde`,
    `Türkiye geneli teslimat: ${SHIPPING_WINDOW}`,
  ]

  if (flat_fee <= 0) {
    return {
      intro:
        'Türkiye içi siparişlerde kargo ücretsizdir. Ödenecek tutar, sipariş özetinde KDV dahil olarak gösterilir.',
      items: ['Türkiye içi kargo: ücretsiz', ...cadence],
      courierLine,
    }
  }

  if (free_threshold > 0) {
    return {
      intro: `${formatPrice(free_threshold)} ve üzeri siparişlerde kargo ücretsizdir. Eşiğin altındaki siparişlerde kargo ücreti ${formatPrice(flat_fee)} olarak uygulanır.`,
      items: [
        `${formatPrice(free_threshold)} altı siparişler: ${formatPrice(flat_fee)}`,
        `${formatPrice(free_threshold)} ve üzeri siparişler: ücretsiz`,
        ...cadence,
      ],
      courierLine,
    }
  }

  return {
    intro: `Kargo ücreti ${formatPrice(flat_fee)} olarak uygulanır. Ödenecek tutar sipariş özetinde gösterilir.`,
    items: [`Türkiye içi kargo: ${formatPrice(flat_fee)}`, ...cadence],
    courierLine,
  }
}
