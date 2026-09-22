// ═══════════════════════════════════════════════════════════════
// Goldylium (parfüm) katalog — DB'de üst kategori "Kozmetik"
// Canlı slug: kozmetik (+ kozmetik-kadin | erkek | unisex altları)
// ═══════════════════════════════════════════════════════════════

import { getAllCategories } from '@/lib/categories'
import { GOLDYLIUM_CATALOG_ROOT_SLUG } from '@/lib/catalog-scope'

export { GOLDYLIUM_CATALOG_ROOT_SLUG, GOLDYLIUM_LANDING_PATH } from '@/lib/catalog-scope'

/** Üst kategori + tüm alt kategori id'leri */
export async function getGoldyliumCategoryIds(): Promise<string[]> {
  const all = await getAllCategories()
  const root = all.find((c) => c.slug === GOLDYLIUM_CATALOG_ROOT_SLUG)
  if (!root) return []
  const childIds = all.filter((c) => c.parent_id === root.id).map((c) => c.id)
  return [root.id, ...childIds]
}
