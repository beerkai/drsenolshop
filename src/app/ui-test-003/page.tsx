// ═══════════════════════════════════════════════════════════════
// /ui-test-003 — UI konsept: "Hesabım" — masaüstü birincil, app dili
// ─ 001/002 ile aynı navbar/bileşen dili; masaüstünde klasik hesap
//   paneli düzeni (sol sabit sekme sütunu, sağ içerik + kart ızgarası).
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

const NAV = ['Bal', 'Signature', 'Propolis', 'Kozmetik']
const TABS = ['Hesap', 'Siparişler', 'Favoriler', 'Adresler']

export default async function UiTest003Page() {
  const { products } = await getProducts({ isActive: true, limit: 4, orderBy: 'newest' })

  const favorites = products.map((p) => {
    const price = getProductStartingPrice(p)
    return { id: p.id, name: p.name, category: p.category?.name ?? '—', image: getProductImage(p), price: price ? formatPrice(price.current) : null }
  })

  return (
    <div className={manrope.className} style={{ backgroundColor: '#EBE5D8', minHeight: '100vh' }}>
      <style>{`
        .ui3-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }
        .ui3-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ui3-fav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ui3-nav-links { display: flex; gap: 28px; }
        @media (max-width: 900px) { .ui3-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 860px) {
          .ui3-layout { grid-template-columns: 1fr; }
          .ui3-nav-links { display: none; }
        }
        @media (max-width: 560px) { .ui3-fav-grid { grid-template-columns: 1fr; } .ui3-stats { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px clamp(20px, 4vw, 56px) 0' }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '11px', color: '#9C7C3C', border: '1px solid rgba(201,169,97,0.5)', borderRadius: '999px', padding: '6px 14px', background: '#F4F0E8' }}>
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px clamp(20px, 4vw, 56px)', gap: '24px' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '19px', letterSpacing: '-0.01em', color: '#15110D', flexShrink: 0 }}>Dr. Şenol</p>
        <nav className="ui3-nav-links">
          {NAV.map((n) => (
            <span key={n} style={{ fontSize: '14px', fontWeight: 700, color: '#6B6258' }}>{n}</span>
          ))}
        </nav>
        <div
          style={{
            width: '40px', height: '40px', borderRadius: '50%', background: '#15110D', color: '#F4F0E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0,
          }}
        >
          AY
        </div>
      </header>

      {/* ── Hesap gövdesi ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(20px, 4vw, 32px) clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
        <h1 style={{ margin: '0 0 28px', fontSize: '30px', fontWeight: 800, color: '#15110D', letterSpacing: '-0.01em' }}>Hesabım</h1>

        <div className="ui3-layout">
          {/* Sol panel */}
          <div>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '22px', marginBottom: '16px', boxShadow: '0 12px 28px -20px rgba(21,17,13,0.22)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#15110D', color: '#F4F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
                AY
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#15110D' }}>Ayşe Yılmaz</p>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#9B9285' }}>ayse@ornek.com</p>
            </div>

            <div style={{ background: '#fff', borderRadius: '20px', padding: '10px', boxShadow: '0 12px 28px -20px rgba(21,17,13,0.22)' }}>
              {TABS.map((t, i) => (
                <div
                  key={t}
                  style={{
                    padding: '13px 14px',
                    borderRadius: '14px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: i === 0 ? '#F4F0E8' : '#3A342C',
                    background: i === 0 ? '#15110D' : 'transparent',
                    marginBottom: i === TABS.length - 1 ? 0 : '4px',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Sağ içerik */}
          <div>
            <div className="ui3-stats" style={{ marginBottom: '28px' }}>
              <div style={{ borderRadius: '20px', padding: '20px', background: 'linear-gradient(135deg, #15110D, #322B22)', color: '#F4F0E8' }}>
                <p style={{ margin: '0 0 22px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', color: '#D4B570' }}>AKTİF KOVAN</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>1.247</p>
                <p style={{ margin: '16px 0 0', fontSize: '11px', fontWeight: 600, color: 'rgba(244,240,232,0.6)' }}>Saitabat, Bursa</p>
              </div>
              <div style={{ borderRadius: '20px', padding: '20px', background: '#C9A961', color: '#15110D' }}>
                <p style={{ margin: '0 0 22px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(21,17,13,0.6)' }}>KURULUŞ</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>1985</p>
                <p style={{ margin: '16px 0 0', fontSize: '11px', fontWeight: 700, color: 'rgba(21,17,13,0.6)' }}>Akredite Lab.</p>
              </div>
              <div style={{ borderRadius: '20px', padding: '20px', background: '#fff', boxShadow: '0 12px 28px -20px rgba(21,17,13,0.22)' }}>
                <p style={{ margin: '0 0 22px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', color: '#9B9285' }}>TOPLAM SİPARİŞ</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#15110D' }}>6</p>
                <p style={{ margin: '16px 0 0', fontSize: '11px', fontWeight: 600, color: '#5C7A3F' }}>Üye · 2026</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#15110D' }}>Favorilerim</p>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#9C7C3C' }}>Tümünü gör →</span>
            </div>

            <div className="ui3-fav-grid">
              {favorites.map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', borderRadius: '18px', padding: '12px', boxShadow: '0 10px 24px -18px rgba(21,17,13,0.2)' }}>
                  <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '14px', background: '#EBE5D8', flexShrink: 0 }}>
                    {f.image && <Image src={f.image} alt={f.name} fill sizes="56px" style={{ objectFit: 'contain', padding: '6px' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#15110D', lineHeight: 1.25 }}>{f.name}</p>
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
      </section>

      {/* ── Alt not + palet ─────────────────────────────────────── */}
      <footer style={{ padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 56px)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(21,17,13,0.08)' }}>
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
