// ═══════════════════════════════════════════════════════════════
// /admin/tema — Tema editörü (anasayfa içeriği + katalog etiketleri)
// ═══════════════════════════════════════════════════════════════

import { requireAdmin } from '@/lib/admin-auth'
import { getHomeContent } from '@/lib/cms/home-content'
import { getProducts } from '@/lib/products'
import { formatPrice, getProductImage, getProductStartingPrice } from '@/types'
import ThemeEditorClient from './ThemeEditorClient'

export const dynamic = 'force-dynamic'

export default async function AdminThemePage() {
  await requireAdmin()

  const [content, { products }] = await Promise.all([
    getHomeContent(),
    getProducts({ isActive: true, limit: 200, orderBy: 'name' }),
  ])

  const options = products.map((p) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: price ? formatPrice(price.current) : '',
      image: getProductImage(p),
      category: p.category?.name ?? 'Koleksiyon',
    }
  })

  return <ThemeEditorClient initialContent={content} products={options} />
}
