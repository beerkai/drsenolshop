'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { formatPrice } from '@/types'

interface NewOrderEvent {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  created_at: string
}

/**
 * Pano'nun üstüne yerleştirilen küçük canlı banner.
 * Yeni sipariş geldiğinde:
 *  1. Banner kayar (slide-in)
 *  2. Audio bip (kullanıcı sayfa tıklamadıkça çalmaz)
 *  3. 30 saniye sonra otomatik söner
 *  4. "Pano'yu yenile" CTA sayfayı router.refresh ile günceller
 */
export function RealtimeOrdersBanner() {
  const router = useRouter()
  const [event, setEvent] = useState<NewOrderEvent | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    if (!supabase) return

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          setEvent({
            id: String(row.id),
            order_number: String(row.order_number ?? ''),
            customer_name: String(row.customer_name ?? '—'),
            total_amount: Number(row.total_amount ?? 0),
            created_at: String(row.created_at ?? new Date().toISOString()),
          })
          // 30 saniye sonra otomatik sön
          setTimeout(() => setEvent(null), 30_000)
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!event) {
    // Sadece bağlantı göstergesi minik
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: 'var(--ad-fg-faint)',
          textTransform: 'uppercase',
        }}
      >
        <span
          aria-hidden
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: connected ? 'var(--ad-success)' : 'var(--ad-fg-faint)',
          }}
        />
        Realtime · {connected ? 'Bağlı' : 'Bağlanıyor…'}
      </div>
    )
  }

  return (
    <div
      role="status"
      style={{
        animation: 'ad-fadeup 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        marginBottom: '20px',
        padding: '14px 20px',
        backgroundColor: 'var(--ad-surface)',
        border: '1px solid var(--ad-gold)',
        boxShadow: '0 4px 16px rgba(201,169,97,0.16)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <span className="ad-live-dot" aria-hidden />
      <div style={{ flex: 1, minWidth: '200px' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ad-gold-deep)' }}>
          Yeni Sipariş · {event.order_number}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--ad-fg)' }}>
          <strong>{event.customer_name}</strong> ·{' '}
          <span className="ad-display" style={{ fontSize: '17px', color: 'var(--ad-gold-deep)', fontWeight: 500 }}>
            {formatPrice(event.total_amount)}
          </span>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link
          href={`/admin/siparisler/${event.order_number}`}
          className="ad-btn ad-btn-primary ad-btn-sm"
        >
          Detay →
        </Link>
        <button
          type="button"
          onClick={() => {
            router.refresh()
            setEvent(null)
          }}
          className="ad-btn ad-btn-secondary ad-btn-sm"
        >
          Yenile
        </button>
        <button
          type="button"
          onClick={() => setEvent(null)}
          aria-label="Kapat"
          className="ad-icon-btn"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
