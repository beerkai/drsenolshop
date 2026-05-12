'use client'

import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import CartDrawer from '@/components/CartDrawer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </WishlistProvider>
  )
}
