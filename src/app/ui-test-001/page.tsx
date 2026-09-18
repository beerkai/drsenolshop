// ═══════════════════════════════════════════════════════════════
// /ui-test-001 — UI konsept önizlemesi: "Koleksiyon" (app ekranı)
// ─ Önceki editoryal/defter dilinden tamamen kopuyor: yuvarlatılmış
//   app kartları, tek modern sans (Manrope), telefon çerçevesi içinde
//   fonksiyonel bir ürün keşif ekranı. Marka renkleri (ink/bone/gold)
//   korunuyor, tipografi ve kompozisyon dili bilinçli olarak farklı.
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
  title: 'UI Konsept 001',
  robots: { index: false, follow: false },
}

const CHIPS = ['Tümü', 'Bal', 'Signature', 'Propolis', 'Kozmetik']

export default async function UiTest001Page() {
  const { products } = await getProducts({ isActive: true, limit: 4, orderBy: 'newest' })

  const cards = products.map((p) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      name: p.name,
      category: p.category?.name ?? '—',
      image: getProductImage(p),
      price: price ? formatPrice(price.current) : null,
    }
  })

  return (
    <div className={manrope.className} style={{ backgroundColor: '#EBE5D8', minHeight: '100vh' }}>
      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px clamp(20px, 4vw, 56px)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em', color: '#15110D' }}>
          Dr. Şenol
        </p>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'clamp(24px, 5vw, 56px) 20px clamp(64px, 8vw, 96px)',
          position: 'relative',
        }}
      >
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
            background: 'radial-gradient(circle, rgba(201,169,97,0.22), rgba(201,169,97,0) 70%)',
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
          <div
            style={{
              background: '#F4F0E8',
              borderRadius: '34px',
              overflow: 'hidden',
              position: 'relative',
              minHeight: '760px',
            }}
          >
            {/* Dynamic island */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90px',
                height: '24px',
                borderRadius: '999px',
                background: '#15110D',
                zIndex: 2,
              }}
            />

            <div style={{ padding: '52px 22px 28px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#9C7C3C' }}>
                Saitabat Köyü, Bursa
              </p>
              <h1 style={{ margin: '0 0 20px', fontSize: '27px', fontWeight: 800, lineHeight: 1.2, color: '#15110D', letterSpacing: '-0.01em' }}>
                En taze <span style={{ color: '#9C7C3C' }}>balı</span> keşfet.
              </h1>

              {/* Arama */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '13px 16px',
                  marginBottom: '18px',
                  boxShadow: '0 10px 24px -16px rgba(21,17,13,0.25)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9B9285" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span style={{ fontSize: '14px', color: '#9B9285', fontWeight: 500 }}>Kestane, propolis, polen…</span>
              </div>

              {/* Kategori chip'leri */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '22px', paddingBottom: '2px' }}>
                {CHIPS.map((c, i) => (
                  <span
                    key={c}
                    style={{
                      flex: '0 0 auto',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '9px 16px',
                      borderRadius: '999px',
                      background: i === 0 ? '#15110D' : '#fff',
                      color: i === 0 ? '#F4F0E8' : '#3A342C',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Ürün ızgarası */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {cards.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#fff',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 12px 28px -18px rgba(21,17,13,0.25)',
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#EBE5D8' }}>
                      {c.image && (
                        <Image src={c.image} alt={c.name} fill sizes="180px" style={{ objectFit: 'contain', padding: '14px' }} />
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(244,240,232,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ padding: '12px 12px 14px', position: 'relative' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '10.5px', fontWeight: 700, color: '#9B9285', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {c.category}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 700, color: '#15110D', lineHeight: 1.25, paddingRight: '28px' }}>
                        {c.name}
                      </p>
                      {c.price && (
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#15110D' }}>{c.price}</p>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#C9A961',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt not + palet ─────────────────────────────────────── */}
      <footer
        style={{
          padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 56px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
