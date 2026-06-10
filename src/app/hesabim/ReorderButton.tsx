'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

interface CartLine {
  productId: string
  variantId: string | null
  name: string
  slug: string
  image: string | null
  price: number
  variantLabel: string | null
  quantity: number
}

interface Skipped { name: string; reason: string }

export default function ReorderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter()
  const { dispatch, openCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ added: number; skipped: Skipped[] } | null>(null)

  async function handleReorder(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/reorder`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setFeedback({ added: 0, skipped: [{ name: 'Hata', reason: data.message ?? 'Sipariş yüklenemedi' }] })
        setLoading(false)
        return
      }
      const lines = (data.items ?? []) as CartLine[]
      for (const line of lines) {
        dispatch({
          type: 'ADD',
          item: {
            productId: line.productId,
            variantId: line.variantId,
            name: line.name,
            slug: line.slug,
            image: line.image,
            price: line.price,
            variantLabel: line.variantLabel,
          },
          quantity: line.quantity,
        })
      }
      setFeedback({ added: lines.length, skipped: (data.skipped ?? []) as Skipped[] })
      setLoading(false)
      if (lines.length > 0) {
        openCart()
        router.refresh()
      }
    } catch {
      setFeedback({ added: 0, skipped: [{ name: 'Ağ hatası', reason: 'Tekrar deneyin' }] })
      setLoading(false)
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleReorder}
        disabled={loading}
        style={{
          marginTop: '12px',
          padding: '8px 14px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(201,169,97,0.4)',
          color: 'var(--color-gold)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
          minHeight: '36px',
        }}
      >
        {loading ? 'Sepete ekleniyor…' : 'Tekrar Sipariş Ver'}
      </button>

      {feedback && (
        <div role="status" style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.5, color: 'var(--color-cream-muted)' }}>
          {feedback.added > 0 && (
            <p style={{ margin: 0, color: 'var(--color-success-soft)' }}>
              ✓ {feedback.added} ürün sepete eklendi.
            </p>
          )}
          {feedback.skipped.length > 0 && (
            <p style={{ margin: '4px 0 0', color: 'var(--color-alert-soft)' }}>
              {feedback.skipped.length} ürün eklenemedi: {feedback.skipped.map((s) => `${s.name} (${s.reason})`).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
