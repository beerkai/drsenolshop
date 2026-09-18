// ═══════════════════════════════════════════════════════════════
// /ui-test-002 — UI konsept önizlemesi: "Sepet" (app ekranı)
// ─ 001 ile aynı bileşen dili (yuvarlatılmış app kartları, Manrope),
//   farklı ekran: sepet / adet stepper / özet kartı.
// ─ Canlı katalogla bağlantılı değil, navigasyonda linki yok.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import { getProductImage, getProductStartingPrice, formatPrice } from '@/types'

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UI Konsept 002',
  robots: { index: false, follow: false },
}

const QUANTITIES = [2, 1, 1]

export default async function UiTest002Page() {
  const { products } = await getProducts({ isActive: true, limit: 3, orderBy: 'newest' })

  const lines = products.map((p, i) => {
    const price = getProductStartingPrice(p)
    const unit = price?.current ?? 0
    const qty = QUANTITIES[i] ?? 1
    return {
      id: p.id,
      name: p.name,
      image: getProductImage(p),
      unit,
      qty,
      lineTotal: unit * qty,
    }
  })

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const shipping = 0
  const total = subtotal + shipping

  return (
    <div className={manrope.className} style={{ backgroundColor: '#EBE5D8', minHeight: '100vh' }}>
      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px clamp(20px, 4vw, 56px)' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em', color: '#15110D' }}>Dr. Şenol</p>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: '11px',
            color: '#9C7C3C',
            border: '1px solid rgba(201,169,97,0.5)',
            borderRadius: '999px',
            padding: '6px 14px',
            background: '#F4F0E8',
          }}
        >
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Telefon çerçevesi ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'clamp(24px, 5vw, 56px) 20px clamp(64px, 8vw, 96px)', position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(92,122,63,0.16), rgba(92,122,63,0) 70%)',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: 'min(380px, 100%)',
            background: '#15110D',
            borderRadius: '46px',
            padding: '14px',
            boxShadow: '0 50px 90px -30px rgba(21,17,13,0.55), 0 20px 40px -24px rgba(21,17,13,0.35)',
          }}
        >
          <div style={{ background: '#F4F0E8', borderRadius: '34px', overflow: 'hidden', position: 'relative', minHeight: '760px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '24px', borderRadius: '999px', background: '#15110D', zIndex: 2 }} />

            <div style={{ padding: '52px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#15110D', letterSpacing: '-0.01em' }}>Sepetim</h1>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -10px rgba(21,17,13,0.3)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </span>
            </div>

            {/* Satırlar */}
            <div style={{ padding: '8px 22px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {lines.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: '#fff',
                    borderRadius: '18px',
                    padding: '12px',
                    boxShadow: '0 10px 24px -18px rgba(21,17,13,0.25)',
                  }}
                >
                  <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '14px', background: '#EBE5D8', flexShrink: 0 }}>
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="56px" style={{ objectFit: 'contain', padding: '6px' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: 700, color: '#15110D', lineHeight: 1.25 }}>{l.name}</p>
                    <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>{formatPrice(l.unit)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#EBE5D8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#15110D' }}>
                      −
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#15110D', minWidth: '14px', textAlign: 'center' }}>{l.qty}</span>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#15110D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#F4F0E8' }}>
                      +
                    </span>
                  </div>
                </div>
              ))}

              {/* Promosyon */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: '14px', padding: '12px 14px', fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>
                  Kupon kodu
                </div>
                <div style={{ background: '#15110D', color: '#F4F0E8', borderRadius: '14px', padding: '12px 20px', fontSize: '12.5px', fontWeight: 700 }}>
                  Uygula
                </div>
              </div>
            </div>

            {/* Özet + CTA */}
            <div style={{ padding: '18px 22px 28px', background: '#fff', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', boxShadow: '0 -16px 32px -24px rgba(21,17,13,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>Ara Toplam</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#15110D' }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>Kargo</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#5C7A3F' }}>Ücretsiz</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingTop: '14px', borderTop: '1px dashed rgba(21,17,13,0.15)' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#15110D' }}>Toplam</span>
                <span style={{ fontSize: '19px', fontWeight: 800, color: '#15110D' }}>{formatPrice(total)}</span>
              </div>
              <div
                style={{
                  background: '#15110D',
                  color: '#F4F0E8',
                  borderRadius: '999px',
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                Ödemeye Geç
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt not + palet ─────────────────────────────────────── */}
      <footer style={{ padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 56px)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#9B9285', maxWidth: '48ch' }}>
          Bu sayfa bir tasarım konseptidir — canlı katalogla bağlantılı değildir, arama motorlarında dizinlenmez.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { name: 'Ink', value: '#15110D' },
            { name: 'Bone', value: '#F4F0E8' },
            { name: 'Gold', value: '#C9A961' },
          ].map((c) => (
            <div key={c.name} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.value, border: '1px solid rgba(21,17,13,0.15)' }} />
          ))}
        </div>
      </footer>
    </div>
  )
}
