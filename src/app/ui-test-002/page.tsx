// ═══════════════════════════════════════════════════════════════
// /ui-test-002 — UI konsept önizlemesi B: "Saha Haritası"
// ─ Koyu zemin, köşegen kesimli, altıgen çerçeveli — 001'in sakin
//   defter diline karşı enerjik, diyagramatik bir yön.
// ─ Canlı katalogla bağlantılı değil, navigasyonda linki yok.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import { getProductImage, getProductStartingPrice, formatPrice } from '@/types'

export const metadata: Metadata = {
  title: 'UI Konsept 002',
  robots: { index: false, follow: false },
}

const FIELD_LOG: [string, string][] = [
  ['Konum', '40°15′N · 29°07′E'],
  ['Kuruluş', '1985'],
  ['Aktif Kovan', '1.247'],
  ['Hasat', 'Q1 — 2026'],
]

// Kart başına hafif, düzensiz-organik sapma — köşegen tema ile tutarlı.
const TILT = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2]
const LIFT = [0, 18, 6, 26, 10, 2]

export default async function UiTest002Page() {
  const { products } = await getProducts({ isActive: true, limit: 6, orderBy: 'newest' })

  const pins = products.map((p, i) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      no: String(i + 1).padStart(2, '0'),
      name: p.name,
      category: p.category?.name ?? '—',
      image: getProductImage(p),
      price: price ? formatPrice(price.current) : null,
      tilt: TILT[i % TILT.length],
      lift: LIFT[i % LIFT.length],
    }
  })

  return (
    <div
      lang="tr"
      style={{
        backgroundColor: '#15110D',
        color: '#F4F0E8',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .ft-pin { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
        .ft-pin:hover { transform: translateY(-6px) rotate(0deg) !important; box-shadow: 0 24px 48px -20px rgba(0,0,0,0.6); }
        .ft-pin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px 22px; }
        .ft-log-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 900px) {
          .ft-pin-grid { grid-template-columns: repeat(2, 1fr); }
          .ft-log-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ft-pin-grid { grid-template-columns: 1fr; }
          .ft-headline { font-size: 44px !important; }
        }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px clamp(20px, 4vw, 56px)',
          borderBottom: '1px solid rgba(244,240,232,0.1)',
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Dr. Şenol
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#D4B570',
            border: '1px solid rgba(212,181,112,0.4)',
            borderRadius: '999px',
            padding: '5px 12px',
          }}
        >
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Köşegen masthead ────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(64px, 10vw, 128px) clamp(20px, 4vw, 56px) clamp(72px, 9vw, 104px)',
        }}
      >
        <svg
          aria-hidden
          viewBox="0 0 100 92"
          style={{
            position: 'absolute',
            top: '6%',
            right: 'clamp(-40px, -2vw, 20px)',
            width: 'min(560px, 68vw)',
            aspectRatio: '1 / 0.92',
            transform: 'rotate(8deg)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <polygon
            points="25,3 75,3 100,46 75,89 25,89 0,46"
            fill="none"
            stroke="rgba(212,181,112,0.5)"
            strokeWidth="1"
          />
        </svg>

        <p style={{ margin: '0 0 22px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#D4B570' }}>
          Saha Haritası — Uludağ Eteği
        </p>

        <h1
          className="ft-headline"
          style={{
            position: 'relative',
            margin: '0 0 28px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(52px, 9vw, 104px)',
            lineHeight: 0.98,
            letterSpacing: '-0.015em',
            maxWidth: '13ch',
            textWrap: 'balance' as const,
          }}
        >
          Kovandan çıkan{' '}
          <span style={{ color: '#D4B570', fontStyle: 'italic', fontWeight: 500 }}>koordinat.</span>
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#C3BCA9',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ width: '28px', height: '1px', background: '#D4B570' }} />
          40°15′N · 29°07′E — Saitabat Köyü, Bursa
        </div>
      </section>

      {/* ── Numune iğneleri (staggered grid) ───────────────────── */}
      {pins.length > 0 && (
        <section style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
          <p style={{ margin: '0 0 32px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7D7466' }}>
            İşaretlenen Numuneler
          </p>
          <div className="ft-pin-grid">
            {pins.map((p) => (
              <article
                key={p.id}
                className="ft-pin"
                style={{
                  transform: `rotate(${p.tilt}deg) translateY(${p.lift}px)`,
                  background: '#1C1814',
                  border: '1px solid rgba(244,240,232,0.08)',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#25201A' }}>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: 'contain', padding: '18px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      color: '#15110D',
                      background: '#7AAD8B',
                      padding: '3px 7px',
                      borderRadius: '2px',
                    }}
                  >
                    ● NO.{p.no}
                  </span>
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7D7466' }}>
                    {p.category}
                  </p>
                  <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, lineHeight: 1.25 }}>
                    {p.name}
                  </p>
                  {p.price && (
                    <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#D4B570', fontVariantNumeric: 'tabular-nums' }}>
                      {p.price}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Saha kaydı — altın blok ─────────────────────────────── */}
      <section style={{ background: '#D4B570', color: '#15110D' }}>
        <div className="ft-log-grid">
          {FIELD_LOG.map(([label, value], i) => (
            <div
              key={label}
              style={{
                padding: 'clamp(28px, 4vw, 40px) clamp(16px, 3vw, 28px)',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(21,17,13,0.18)',
              }}
            >
              <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(18px, 2.4vw, 26px)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alt not ──────────────────────────────────────────────── */}
      <footer
        style={{
          padding: 'clamp(24px, 4vw, 32px) clamp(20px, 4vw, 56px)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          color: '#7D7466',
        }}
      >
        Bu sayfa bir tasarım konseptidir — canlı katalogla bağlantılı değildir, arama motorlarında dizinlenmez.
      </footer>
    </div>
  )
}
