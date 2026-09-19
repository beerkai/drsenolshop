// ═══════════════════════════════════════════════════════════════
// Varyant görseli Storage klasör adı (products bucket)
// ═══════════════════════════════════════════════════════════════

import type { ProductVariant } from '@/types'
import { getVariantImageKeys } from '@/types'

/** `{slug}/{segment}/dosya.webp` — segment: 850, 355 vb. yoksa kısa id */
export function variantImageStorageSegment(variant: Pick<ProductVariant, 'id' | 'label' | 'variant_value' | 'weight_grams' | 'volume_ml' | 'sku'>): string {
  const keys = getVariantImageKeys(variant as ProductVariant)
  if (keys.length > 0) return keys[0]!
  return variant.id.replace(/-/g, '').slice(0, 12)
}
