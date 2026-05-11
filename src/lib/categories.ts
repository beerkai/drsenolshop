// ═══════════════════════════════════════════════════════════════
// Kategori veri çekme yardımcıları
// ═══════════════════════════════════════════════════════════════

import { getSupabase, isSupabaseConfigured } from './supabase'
import type { Category, CategoryWithChildren } from '@/types'

// ───────────────────────────────────────────────────────────────
// Aktif kategoriler — düz liste
// ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[getAllCategories] Supabase ortam değişkenleri eksik; boş liste dönülüyor.')
    return []
  }

  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('[getAllCategories] Hata:', error.message)
    return []
  }

  return (data ?? []) as Category[]
}

// ───────────────────────────────────────────────────────────────
// Slug ile tek kategori
// ───────────────────────────────────────────────────────────────

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    console.warn('[getCategoryBySlug] Supabase ortam değişkenleri eksik.')
    return null
  }

  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[getCategoryBySlug] Hata:', error.message)
    return null
  }

  return (data as Category | null) ?? null
}

// ───────────────────────────────────────────────────────────────
// parent_id ile ağaç (orphan çocuklar köke eklenmez — sessizce atlanır)
// ───────────────────────────────────────────────────────────────

export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const all = await getAllCategories()

  const roots: CategoryWithChildren[] = all
    .filter((c) => !c.parent_id)
    .map((c) => ({ ...c, children: [] }))

  all.filter((c) => c.parent_id).forEach((child) => {
    const parent = roots.find((r) => r.id === child.parent_id)
    if (parent) {
      parent.children = parent.children ?? []
      parent.children.push({ ...child, children: [] })
    }
  })

  return roots
}

// ───────────────────────────────────────────────────────────────
// Ağaç + doğrudan bağlı ürün sayısı (alt kategori sayıları ayrı)
// ───────────────────────────────────────────────────────────────

export async function getCategoryWithProductCount(): Promise<CategoryWithChildren[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[getCategoryWithProductCount] Supabase ortam değişkenleri eksik; boş ağaç dönülüyor.')
    return []
  }

  const supabase = getSupabase()
  const tree = await getCategoryTree()

  for (const root of tree) {
    const { count, error: rootErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', root.id)
      .eq('is_active', true)

    if (!rootErr) root.product_count = count ?? 0

    const children = root.children
    if (children) {
      for (const child of children) {
        const { count: childCount, error: childErr } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', child.id)
          .eq('is_active', true)

        if (!childErr) child.product_count = childCount ?? 0
      }
    }
  }

  return tree
}
