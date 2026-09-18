// ═══════════════════════════════════════════════════════════════
// /ui-test-002 — UI konsept: "Sepetim" — masaüstü birincil, app dili
// ─ 001 ile aynı navbar/bileşen dili; masaüstünde klasik iki sütun
//   sepet düzeni (satırlar solda, sabit özet kartı sağda).
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

const NAV = ['Bal', 'Signature', 'Propolis', 'Kozmetik']
const QUANTITIES = [2, 1, 3]

export default async function UiTest002Page() {
  const { products } = await getProducts({ isActive: true, limit: 3, orderBy: 'newest' })

  const lines = products.map((p, i) => {
    const price = getProductStartingPrice(p)
    const unit = price?.current ?? 0
    const qty = QUANTITIES[i] ?? 1
    return { id: p.id, name: p.name, category: p.category?.name ?? '—', image: getProductImage(p), unit, qty, lineTotal: unit * qty }
  })

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const total = subtotal

  return (
    <div className={manrope.className} style={{ backgroundColor: '#EBE5D8', minHeight: '100vh' }}>
      <style>{`
        .ui2-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 32px; align-items: start; }
        .ui2-summary { position: sticky; top: 24px; }
        .ui2-nav-links { display: flex; gap: 28px; }
        @media (max-width: 860px) {
          .ui2-layout { grid-template-columns: 1fr; }
          .ui2-summary { position: static; }
          .ui2-nav-links { display: none; }
        }
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
        <nav className="ui2-nav-links">
          {NAV.map((n) => (
            <span key={n} style={{ fontSize: '14px', fontWeight: 700, color: '#6B6258' }}>{n}</span>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -14px rgba(21,17,13,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span
            style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#15110D',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#C9A961', color: '#15110D', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {lines.length}
            </span>
          </span>
        </div>
      </header>

      {/* ── Sepet gövdesi ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(20px, 4vw, 32px) clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
        <h1 style={{ margin: '0 0 28px', fontSize: '30px', fontWeight: 800, color: '#15110D', letterSpacing: '-0.01em' }}>
          Sepetim <span style={{ color: '#9B9285', fontWeight: 700 }}>· {lines.length} ürün</span>
        </h1>

        <div className="ui2-layout">
          {/* Satırlar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {lines.map((l) => (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '0 12px 28px -20px rgba(21,17,13,0.22)',
                }}
              >
                <div style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '16px', background: '#EBE5D8', flexShrink: 0 }}>
                  {l.image && <Image src={l.image} alt={l.name} fill sizes="84px" style={{ objectFit: 'contain', padding: '10px' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '10.5px', fontWeight: 700, color: '#9B9285', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{l.category}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#15110D' }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#9B9285' }}>{formatPrice(l.unit)} / adet</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EBE5D8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#15110D' }}>−</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#15110D', minWidth: '16px', textAlign: 'center' }}>{l.qty}</span>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#15110D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#F4F0E8' }}>+</span>
                </div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#15110D', width: '90px', textAlign: 'right', flexShrink: 0 }}>{formatPrice(l.lineTotal)}</p>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#9B9285' }}>Kupon kodu</div>
              <div style={{ background: '#15110D', color: '#F4F0E8', borderRadius: '16px', padding: '14px 26px', fontSize: '13px', fontWeight: 700 }}>Uygula</div>
            </div>
          </div>

          {/* Özet */}
          <div className="ui2-summary" style={{ background: '#fff', borderRadius: '24px', padding: '26px', boxShadow: '0 20px 44px -24px rgba(21,17,13,0.28)' }}>
            <p style={{ margin: '0 0 18px', fontSize: '17px', fontWeight: 800, color: '#15110D' }}>Sipariş Özeti</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#9B9285' }}>Ara Toplam</span>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#15110D' }}>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#9B9285' }}>Kargo</span>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#5C7A3F' }}>Ücretsiz</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingTop: '16px', borderTop: '1px dashed rgba(21,17,13,0.15)' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#15110D' }}>Toplam</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#15110D' }}>{formatPrice(total)}</span>
            </div>
            <div style={{ background: '#15110D', color: '#F4F0E8', borderRadius: '999px', padding: '17px', textAlign: 'center', fontSize: '14.5px', fontWeight: 700 }}>
              Ödemeye Geç
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
