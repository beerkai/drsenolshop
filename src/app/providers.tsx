'use client'

import { CartProvider } from '@/lib/cart-context'
import CartDrawer from '@/components/CartDrawer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  )
}
