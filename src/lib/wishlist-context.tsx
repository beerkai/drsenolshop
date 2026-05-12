'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import type { Dispatch } from 'react'

export interface WishlistItem {
  productId: string
  slug: string
  name: string
  image: string | null
  addedAt: string // ISO
}

type Action =
  | { type: 'LOAD'; items: WishlistItem[] }
  | { type: 'ADD'; item: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' }

function reducer(items: WishlistItem[], action: Action): WishlistItem[] {
  switch (action.type) {
    case 'LOAD':
      return action.items
    case 'ADD': {
      if (items.some((i) => i.productId === action.item.productId)) return items
      return [
        { ...action.item, addedAt: new Date().toISOString() },
        ...items,
      ]
    }
    case 'REMOVE':
      return items.filter((i) => i.productId !== action.productId)
    case 'CLEAR':
      return []
    default:
      return items
  }
}

interface WishlistContextValue {
  items: WishlistItem[]
  dispatch: Dispatch<Action>
  count: number
  isInWishlist: (productId: string) => boolean
  toggle: (item: Omit<WishlistItem, 'addedAt'>) => boolean // returns true if added, false if removed
}

const Ctx = createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = 'drsenol-wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: 'LOAD', items: JSON.parse(stored) })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const isInWishlist = (productId: string) => items.some((i) => i.productId === productId)

  const toggle = (item: Omit<WishlistItem, 'addedAt'>): boolean => {
    if (isInWishlist(item.productId)) {
      dispatch({ type: 'REMOVE', productId: item.productId })
      return false
    }
    dispatch({ type: 'ADD', item })
    return true
  }

  return (
    <Ctx.Provider value={{ items, dispatch, count: items.length, isInWishlist, toggle }}>
      {children}
    </Ctx.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider')
  return ctx
}
