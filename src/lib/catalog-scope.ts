// ═══════════════════════════════════════════════════════════════
// Katalog filtresi — bal koleksiyonu ile Goldylium parfüm ayrımı
// Saf yardımcılar; sunucu istemcisi içermez (Client Component'tan da import edilir)
// ═══════════════════════════════════════════════════════════════

/** Marka adı Goldylium; vitrin kök kategorisi Kozmetik */
export const GOLDYLIUM_CATALOG_ROOT_SLUG = 'kozmetik'

export const GOLDYLIUM_LANDING_PATH = '/goldylium'

export const HONEY_CATALOG_PATH = '/koleksiyon'

type TreeNode = {
  slug: string
  parent_id: string | null
  children?: TreeNode[]
}

/** Parfüm vitrini: yalnızca kozmetik alt kategorileri (yoksa şerit sadece "Tümü") */
export function perfumeFilterCategories<T extends TreeNode>(categories: T[]): T[] {
  const root = categories.find((c) => c.slug === GOLDYLIUM_CATALOG_ROOT_SLUG)
  if (!root) return []
  return (root.children ?? []) as T[]
}

/** Bal koleksiyonu: kozmetik kökü ve altları şeritte yok */
export function honeyFilterCategories<T extends TreeNode>(categories: T[]): T[] {
  return categories.filter((c) => !c.parent_id && c.slug !== GOLDYLIUM_CATALOG_ROOT_SLUG)
}

export function isGoldyliumCatalogSlug(categories: TreeNode[], slug: string): boolean {
  const root = categories.find((c) => c.slug === GOLDYLIUM_CATALOG_ROOT_SLUG)
  if (!root) return slug === GOLDYLIUM_CATALOG_ROOT_SLUG
  if (root.slug === slug) return true
  return (root.children ?? []).some((c) => c.slug === slug)
}
