// ═══════════════════════════════════════════════════════════════
// Supabase bağlantı duman testi
// Çalıştırma: npm run test:supabase
//
// Not: ESM'de statik import'lar önce yüklendiği için .env.local burada
// dotenv ile yüklenir, ardından uygulama modülleri dinamik import edilir.
// ═══════════════════════════════════════════════════════════════

import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const [{ getFeaturedProducts, getProducts }, { getCategoryWithProductCount }, typeHelpers] =
    await Promise.all([
      import('../src/lib/products'),
      import('../src/lib/categories'),
      import('../src/types'),
    ])

  const { formatPrice, getProductImage, getProductStartingPrice } = typeHelpers

  console.log('═══════════════════════════════════════════════')
  console.log('🐝 Dr. Şenol Shop — Supabase Bağlantı Testi')
  console.log('───────────────────────────────────────────────')

  try {
    const { products: allProducts, total: allTotal } = await getProducts({ limit: 100 })
    console.log(`📦 Toplam aktif ürün: ${allTotal} (${allProducts.length} çekildi)`)

    const featured = await getFeaturedProducts(10)
    console.log(`⭐ Featured ürün: ${featured.length}`)

    const categoryTree = await getCategoryWithProductCount()
    const totalCategories = categoryTree.reduce(
      (sum, c) => sum + 1 + (c.children?.length ?? 0),
      0
    )
    console.log(`📁 Toplam kategori: ${totalCategories}`)
    console.log(`📁 Ana kategori: ${categoryTree.length}`)

    console.log('───────────────────────────────────────────────')
    console.log('📊 Kategori Dağılımı:')
    for (const cat of categoryTree) {
      console.log(`   • ${cat.name}: ${cat.product_count ?? 0} ürün`)
      if (cat.children && cat.children.length > 0) {
        for (const child of cat.children) {
          console.log(`     └─ ${child.name}: ${child.product_count ?? 0} ürün`)
        }
      }
    }

    console.log('───────────────────────────────────────────────')
    console.log('🌟 Featured Ürünler:')
    for (const product of featured) {
      const price = getProductStartingPrice(product)
      const priceStr = price
        ? price.original
          ? `${formatPrice(price.current)} (${formatPrice(price.original)} ${price.discount}% indirim)`
          : formatPrice(price.current)
        : 'Fiyat yok'
      const img = getProductImage(product)
      const imgStatus = img ? '🖼️' : '❌'
      console.log(`   ${imgStatus} ${product.name}`)
      console.log(`      💰 ${priceStr}`)
      if (product.variants && product.variants.length > 0) {
        console.log(`      📐 ${product.variants.length} varyant`)
      }
    }

    console.log('═══════════════════════════════════════════════')
    console.log('✅ Supabase bağlantısı başarılı!')
    console.log('═══════════════════════════════════════════════')
  } catch (err) {
    console.error('═══════════════════════════════════════════════')
    console.error('❌ HATA:', err instanceof Error ? err.message : String(err))
    console.error('═══════════════════════════════════════════════')
    process.exit(1)
  }
}

void main()
