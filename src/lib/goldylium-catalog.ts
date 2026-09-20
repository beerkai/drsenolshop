// ═══════════════════════════════════════════════════════════════
// Goldylium (parfüm) katalog — DB'de üst kategori "Kozmetik"
// Canlı slug: kozmetik (+ kozmetik-kadin | erkek | unisex altları)
// ═══════════════════════════════════════════════════════════════

import { getAllCategories } from '@/lib/categories'

/** Marka adı Goldylium; vitrin kök kategorisi Kozmetik */
export const GOLDYLIUM_CATALOG_ROOT_SLUG = 'kozmetik'

export const GOLDYLIUM_LANDING_PATH = '/goldylium'

/** Üst kategori + tüm alt kategori id'leri */
export async function getGoldyliumCategoryIds(): Promise<string[]> {
  const all = await getAllCategories()
  const root = all.find((c) => c.slug === GOLDYLIUM_CATALOG_ROOT_SLUG)
  if (!root) return []
  const childIds = all.filter((c) => c.parent_id === root.id).map((c) => c.id)
  return [root.id, ...childIds]
}
