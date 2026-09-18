// ═══════════════════════════════════════════════════════════════
// /ui-test-003 — UI konsept önizlemesi: "Hesabım" (app ekranı)
// ─ 001/002 ile aynı bileşen dili, farklı ekran: profil, marka
//   künyesi kartları, favoriler listesi.
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
  title: 'UI Konsept 003',
  robots: { index: false, follow: false },
}

const TABS = ['Hesap', 'Siparişler', 'Favoriler']

export default async function UiTest003Page() {
  const { products } = await getProducts({ isActive: true, limit: 3, orderBy: 'newest' })

  const favorites = products.map((p) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      name: p.name,
      image: getProductImage(p),
      price: price ? formatPrice(price.current) : null,
    }
  })

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
            background: 'radial-gradient(circle, rgba(201,169,97,0.2), rgba(201,169,97,0) 70%)',
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
          <div style={{ background: '#F4F0E8', borderRadius: '34px', overflow: 'hidden', position: 'relative', minHeight: '760px' }}>
            <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '24px', borderRadius: '999px', background: '#15110D', zIndex: 2 }} />

            <div style={{ padding: '52px 22px 0' }}>
              {/* Profil satırı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#15110D',
                    color: '#F4F0E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  AY
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: '#15110D' }}>Ayşe Yılmaz</p>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>ayse@ornek.com</p>
                </div>
              </div>

              {/* Sekmeler */}
              <div style={{ display: 'flex', gap: '22px', marginBottom: '22px', borderBottom: '1px solid rgba(21,17,13,0.1)' }}>
                {TABS.map((t, i) => (
                  <div key={t} style={{ paddingBottom: '12px', borderBottom: i === 0 ? '2px solid #15110D' : '2px solid transparent' }}>
                    <span style={{ fontSize: '13px', fontWeight: i === 0 ? 800 : 600, color: i === 0 ? '#15110D' : '#9B9285' }}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Marka künyesi kartları */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '2px' }}>
                <div
                  style={{
                    flex: '0 0 auto',
                    width: '168px',
                    borderRadius: '20px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #15110D, #322B22)',
                    color: '#F4F0E8',
                  }}
                >
                  <p style={{ margin: '0 0 18px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em', color: '#D4B570' }}>AKTİF KOVAN</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>1.247</p>
                  <p style={{ margin: '14px 0 0', fontSize: '10.5px', fontWeight: 600, color: 'rgba(244,240,232,0.6)' }}>Saitabat, Bursa</p>
                </div>
                <div
                  style={{
                    flex: '0 0 auto',
                    width: '168px',
                    borderRadius: '20px',
                    padding: '16px',
                    background: '#C9A961',
                    color: '#15110D',
                  }}
                >
                  <p style={{ margin: '0 0 18px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(21,17,13,0.6)' }}>KURULUŞ</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>1985</p>
                  <p style={{ margin: '14px 0 0', fontSize: '10.5px', fontWeight: 700, color: 'rgba(21,17,13,0.6)' }}>Akredite Lab.</p>
                </div>
              </div>

              {/* Favoriler listesi */}
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#15110D' }}>Favorilerim</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '10px',
                      boxShadow: '0 8px 20px -16px rgba(21,17,13,0.25)',
                    }}
                  >
                    <div style={{ position: 'relative', width: '46px', height: '46px', borderRadius: '12px', background: '#EBE5D8', flexShrink: 0 }}>
                      {f.image && <Image src={f.image} alt={f.name} fill sizes="46px" style={{ objectFit: 'contain', padding: '5px' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#15110D', lineHeight: 1.2 }}>{f.name}</p>
                      {f.price && <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#9B9285' }}>{f.price}</p>}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#C8472D" stroke="#C8472D" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                ))}
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
