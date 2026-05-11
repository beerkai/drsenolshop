import type { MetadataRoute } from 'next'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

const BASE_URL = 'https://drsenol.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/koleksiyon`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  if (!isSupabaseConfigured()) return staticRoutes

  const supabase = getSupabase()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('slug, updated_at').eq('is_active', true),
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
  ])

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${BASE_URL}/kategori/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/urun/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
