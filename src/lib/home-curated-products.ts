// ═══════════════════════════════════════════════════════════════
// Anasayfa kürasyon ürünleri — tek sorgu paketi + kısa önbellek
// ═══════════════════════════════════════════════════════════════

import { unstable_cache } from 'next/cache'
import type { HomeCuratedBlockConfig, HomeCuratedSettings } from '@/types/home-curated'
import type { ProductWithRelations } from '@/types'
import { getProducts, getProductsByIds } from '@/lib/products'
import { isSupabaseConfigured } from '@/lib/supabase'

function orderByIds(ids: string[], products: ProductWithRelations[]): ProductWithRelations[] {
  const map = new Map(products.map((p) => [p.id, p]))
  return ids.map((id) => map.get(id)).filter((p): p is ProductWithRelations => Boolean(p))
}

async function resolveBlock(config: HomeCuratedBlockConfig): Promise<ProductWithRelations[]> {
  if (!config.enabled) return []

  if (config.productIds.length > 0) {
    const picked = await getProductsByIds(config.productIds)
    const active = picked.filter((p) => p.is_active !== false)
    return orderByIds(config.productIds, active).slice(0, config.limit)
  }

  const { products } = await getProducts({
    categorySlug: config.categorySlug,
    isActive: true,
    inStockOnly: true,
    limit: config.limit,
    orderBy: config.orderBy,
  })

  if (products.length > 0) return products

  if (config.categorySlug === 'bal') {
    const fallback = await getProducts({
      isActive: true,
      inStockOnly: true,
      limit: config.limit,
      orderBy: config.orderBy,
    })
    return fallback.products
  }

  return []
}

const cachedResolveBlock = unstable_cache(
  async (serialized: string) => {
    const config = JSON.parse(serialized) as HomeCuratedBlockConfig
    return resolveBlock(config)
  },
  ['home-curated-block'],
  { revalidate: 60, tags: ['home-curated', 'products'] }
)

export async function getCuratedBlockProducts(config: HomeCuratedBlockConfig): Promise<ProductWithRelations[]> {
  if (!isSupabaseConfigured()) return []
  return cachedResolveBlock(JSON.stringify(config))
}

export interface HomeCuratedProductSets {
  mostPreferred: ProductWithRelations[]
  signature: ProductWithRelations[]
  supabaseConfigured: boolean
}

export async function getHomeCuratedProductSets(
  settings: HomeCuratedSettings
): Promise<HomeCuratedProductSets> {
  const supabaseConfigured = isSupabaseConfigured()
  if (!supabaseConfigured) {
    return { mostPreferred: [], signature: [], supabaseConfigured: false }
  }

  const [mostPreferred, signature] = await Promise.all([
    getCuratedBlockProducts(settings.mostPreferred),
    getCuratedBlockProducts(settings.signature),
  ])

  return { mostPreferred, signature, supabaseConfigured: true }
}
