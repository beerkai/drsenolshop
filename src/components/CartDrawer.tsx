'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/types'

export default function CartDrawer() {
  const { items, dispatch, isOpen, closeCart, itemCount, subtotal } = useCart()

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes cartSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes cartFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10,9,8,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'cartFadeIn 0.3s ease both',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#141210',
          borderLeft: '1px solid rgba(244,240,232,0.08)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'cartSlideIn 0.38s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: 0 }}>
              Sepetiniz
            </p>
            {itemCount > 0 && (
              <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#6E665A', margin: '4px 0 0' }}>
                {itemCount} ürün
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Kapat"
            style={{ color: '#6E665A', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: '64px 0' }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,232,0.1)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p style={{ fontFamily: 'var(--font-cormorant)', color: '#6E665A', fontSize: '24px', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                Sepetiniz boş.
              </p>
              <button
                type="button"
                onClick={closeCart}
                style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#C9A961', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Alışverişe Devam →
              </button>
            </div>
          ) : (
            <div style={{ paddingTop: '8px', paddingBottom: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid rgba(244,240,232,0.06)' }}>
                  {/* Görsel */}
                  <div style={{ width: '70px', height: '88px', flexShrink: 0, backgroundColor: '#0A0908', position: 'relative' }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="70px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#3A3530', fontFamily: 'var(--font-cormorant)', fontSize: '10px' }}>—</span>
                      </div>
                    )}
                  </div>

                  {/* Bilgi */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '17px', fontWeight: 500, lineHeight: 1.25, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      {item.variantLabel && (
                        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', margin: 0 }}>
                          {item.variantLabel}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Adet */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(244,240,232,0.1)' }}>
                        <button type="button" onClick={() => dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity - 1 })}
                          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E665A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                          −
                        </button>
                        <span style={{ width: '24px', textAlign: 'center', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#F4F0E8' }}>
                          {item.quantity}
                        </span>
                        <button type="button" onClick={() => dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity + 1 })}
                          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E665A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                          +
                        </button>
                      </div>

                      {/* Fiyat + sil */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '19px', fontWeight: 500 }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button type="button" onClick={() => dispatch({ type: 'REMOVE', id: item.id })} aria-label="Kaldır"
                          style={{ color: '#3A3530', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                            <path d="M6 6l12 12M6 18L18 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', padding: '24px 28px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', color: '#6E665A', textTransform: 'uppercase' }}>
                Ara Toplam
              </span>
              <span style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '28px', fontWeight: 500 }}>
                {formatPrice(subtotal)}
              </span>
            </div>

            <Link href="/odeme" onClick={closeCart}
              style={{ display: 'block', textAlign: 'center', padding: '18px', backgroundColor: '#C9A961', color: '#0A0908', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '10px' }}>
              Ödemeye Geç →
            </Link>

            <button type="button" onClick={closeCart}
              style={{ display: 'block', width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6E665A', fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
              Alışverişe Devam
            </button>
          </div>
        )}
      </div>
    </>
  )
}
