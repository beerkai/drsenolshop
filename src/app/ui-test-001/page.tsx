// ═══════════════════════════════════════════════════════════════
// /ui-test-001 — UI konsept: "Koleksiyon" — masaüstü birincil, app dili
// ─ Manrope + yuvarlatılmış kartlar + marka renkleri (ink/bone/gold).
// ─ Gerçek responsive sayfa (telefon mockup değil) — geniş ekranda
//   header + hero + çok sütunlu ürün ızgarası, dar ekranda tek sütun.
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

const NAV = ['Bal', 'Signature', 'Propolis', 'Kozmetik']
const CHIPS = ['Tümü', 'Bal', 'Signature', 'Propolis', 'Kozmetik', 'Diğer']

export default async function UiTest001Page() {
  const { products } = await getProducts({ isActive: true, limit: 8, orderBy: 'newest' })

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

  const hero = cards[0]

  return (
    <div className={manrope.className} style={{ backgroundColor: '#EBE5D8', minHeight: '100vh' }}>
      <style>{`
        .ui1-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .ui1-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
        .ui1-nav-links { display: flex; gap: 28px; }
        @media (max-width: 1080px) { .ui1-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 860px) {
          .ui1-hero { grid-template-columns: 1fr; }
          .ui1-nav-links { display: none; }
          .ui1-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) { .ui1-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px clamp(20px, 4vw, 56px) 0' }}>
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

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px clamp(20px, 4vw, 56px)',
          gap: '24px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, fontSize: '19px', letterSpacing: '-0.01em', color: '#15110D', flexShrink: 0 }}>
          Dr. Şenol
        </p>

        <nav className="ui1-nav-links">
          {NAV.map((n, i) => (
            <span key={n} style={{ fontSize: '14px', fontWeight: 700, color: i === 0 ? '#15110D' : '#6B6258', cursor: 'default' }}>
              {n}
            </span>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -14px rgba(21,17,13,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -14px rgba(21,17,13,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <span
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#15110D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#C9A961',
                color: '#15110D',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
          </span>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="ui1-hero" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 56px) clamp(48px, 6vw, 72px)' }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#9C7C3C' }}>Saitabat Köyü, Bursa</p>
          <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(34px, 4.2vw, 54px)', fontWeight: 800, lineHeight: 1.08, color: '#15110D', letterSpacing: '-0.015em', maxWidth: '11ch' }}>
            En taze <span style={{ color: '#9C7C3C' }}>balı</span> keşfet.
          </h1>
          <p style={{ margin: '0 0 26px', fontSize: '15px', color: '#3A342C', maxWidth: '42ch', lineHeight: 1.6 }}>
            1985&apos;ten bu yana Saitabat Köyü&apos;nde, laboratuvar onaylı premium arı ürünleri. Kovandan
            kapına, tek dokunuşta.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fff',
              borderRadius: '16px',
              padding: '14px 18px',
              maxWidth: '420px',
              marginBottom: '22px',
              boxShadow: '0 14px 32px -20px rgba(21,17,13,0.3)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9B9285" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span style={{ fontSize: '14px', color: '#9B9285', fontWeight: 500 }}>Kestane, propolis, polen…</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CHIPS.map((c, i) => (
              <span
                key={c}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background: i === 0 ? '#15110D' : '#fff',
                  color: i === 0 ? '#F4F0E8' : '#3A342C',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {hero?.image && (
          <div
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              borderRadius: '32px',
              background: '#fff',
              boxShadow: '0 30px 60px -30px rgba(21,17,13,0.35)',
              overflow: 'hidden',
            }}
          >
            <Image src={hero.image} alt={hero.name} fill sizes="(max-width: 860px) 90vw, 40vw" style={{ objectFit: 'contain', padding: '48px' }} />
          </div>
        )}
      </section>

      {/* ── Ürün ızgarası ───────────────────────────────────────── */}
      <section style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#15110D' }}>Öne Çıkanlar</h2>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#9C7C3C' }}>Tümünü gör →</span>
        </div>

        <div className="ui1-grid">
          {cards.map((c) => (
            <div key={c.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 28px -18px rgba(21,17,13,0.22)' }}>
              <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#EBE5D8' }}>
                {c.image && <Image src={c.image} alt={c.name} fill sizes="(max-width: 520px) 100vw, (max-width: 1080px) 33vw, 22vw" style={{ objectFit: 'contain', padding: '16px' }} />}
                <span style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(244,240,232,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
              </div>
              <div style={{ padding: '14px 14px 16px', position: 'relative' }}>
                <p style={{ margin: '0 0 3px', fontSize: '10.5px', fontWeight: 700, color: '#9B9285', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{c.category}</p>
                <p style={{ margin: '0 0 7px', fontSize: '14px', fontWeight: 700, color: '#15110D', lineHeight: 1.3, paddingRight: '30px', minHeight: '36px' }}>{c.name}</p>
                {c.price && <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#15110D' }}>{c.price}</p>}
                <span style={{ position: 'absolute', bottom: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '50%', background: '#C9A961', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15110D" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
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
