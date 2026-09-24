'use client'

// ═══════════════════════════════════════════════════════════════
// Katalog etiketleri — tema editöründen gelen metinleri client
// bileşenlerine taşır (ProductCard, ProductGrid, ürün detayı).
//
// Değer root layout'ta sunucu tarafında okunur ve Providers üzerinden
// aktarılır. Provider yoksa statik varsayılana düşer — bileşenler
// tek başına render edildiğinde (test, storybook) kırılmaz.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext } from 'react'
import { defaultProductLabels, type ProductLabels } from '@/lib/cms/product-labels'

const ProductLabelsContext = createContext<ProductLabels>(defaultProductLabels)

export function ProductLabelsProvider({
  value,
  children,
}: {
  value: ProductLabels
  children: React.ReactNode
}) {
  return <ProductLabelsContext.Provider value={value}>{children}</ProductLabelsContext.Provider>
}

export function useProductLabels(): ProductLabels {
  return useContext(ProductLabelsContext)
}
