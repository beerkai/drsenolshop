import type { MetadataRoute } from 'next'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

const BASE_URL = 'https://drsenol.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/koleksiyon`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // Marka sayfaları
    { url: `${BASE_URL}/hikaye`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/saitabat-koyu`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/bilim-yaklasimimiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/basinda-biz`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    // Yardım
    { url: `${BASE_URL}/kargo-teslimat`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/iade-degisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/sikca-sorulanlar`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/iletisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    // Yasal
    { url: `${BASE_URL}/gizlilik-politikasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cerez-politikasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/uyelik-sozlesmesi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/on-bilgilendirme-formu`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/mesafeli-satis-sozlesmesi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
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
