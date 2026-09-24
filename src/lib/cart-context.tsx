'use client'

import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import { MAX_CUSTOMER_ORDER_QTY } from '@/lib/order-qty'

export { MAX_CUSTOMER_ORDER_QTY, customerOrderCap } from '@/lib/order-qty'

export interface CartItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  slug: string
  image: string | null
  price: number
  variantLabel: string | null
  quantity: number
  /** Bu kalem için izin verilen üst adet. Eski sepetlerde yoksa 150 kabul edilir. */
  maxQuantity?: number
}

type CartAction =
  | { type: 'LOAD'; items: CartItem[] }
  | { type: 'ADD'; item: Omit<CartItem, 'id' | 'quantity'>; quantity?: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_QTY'; id: string; quantity: number }
  | { type: 'CLEAR' }

function makeId(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? 'base'}`
}

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'LOAD':
      return action.items
    case 'ADD': {
      const id = makeId(action.item.productId, action.item.variantId)
      const cap = action.item.maxQuantity ?? MAX_CUSTOMER_ORDER_QTY
      const qty = Math.min(Math.max(1, action.quantity ?? 1), cap)
      const existing = items.find(i => i.id === id)
      if (existing) {
        const lineCap = Math.min(existing.maxQuantity ?? MAX_CUSTOMER_ORDER_QTY, cap)
        return items.map(i => i.id === id
          ? { ...i, ...action.item, id, maxQuantity: lineCap, quantity: Math.min(i.quantity + qty, lineCap) }
          : i)
      }
      return [...items, { ...action.item, id, maxQuantity: cap, quantity: qty }]
    }
    case 'REMOVE':
      return items.filter(i => i.id !== action.id)
    case 'SET_QTY':
      if (action.quantity <= 0) return items.filter(i => i.id !== action.id)
      return items.map(i => {
        if (i.id !== action.id) return i
        const cap = i.maxQuantity ?? MAX_CUSTOMER_ORDER_QTY
        return { ...i, quantity: Math.min(action.quantity, cap) }
      })
    case 'CLEAR':
      return []
    default:
      return items
  }
}

interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drsenol-cart')
      if (stored) dispatch({ type: 'LOAD', items: JSON.parse(stored) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('drsenol-cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      dispatch,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      itemCount,
      subtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
