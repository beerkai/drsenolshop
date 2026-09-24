'use client'

import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ProductLabelsProvider } from '@/lib/product-labels-context'
import { defaultProductLabels, type ProductLabels } from '@/lib/cms/product-labels'
import CartDrawer from '@/components/editorial/EditorialCartDrawer'

export function Providers({
  children,
  productLabels = defaultProductLabels,
}: {
  children: React.ReactNode
  productLabels?: ProductLabels
}) {
  return (
    <ProductLabelsProvider value={productLabels}>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </WishlistProvider>
    </ProductLabelsProvider>
  )
}
