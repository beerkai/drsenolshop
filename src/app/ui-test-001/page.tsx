// ═══════════════════════════════════════════════════════════════
// /ui-test-001 — UI konsept önizlemesi (yalnızca görsel örnek)
// ─ Canlı katalogla bağlantılı değil, site navigasyonunda linki yok
// ─ Marka tokenleri (ink/bone/gold, Cormorant/Inter/JetBrains) aynı,
//   kompozisyon mevcut ana sayfadan bilinçli olarak farklı:
//   "numune endeksi / saha defteri" yönü — koyu vitrin yerine
//   açık zeminde asimetrik, laboratuvar-defteri hizalı bir düzen.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import { getProductImage, getProductStartingPrice, formatPrice } from '@/types'

export const metadata: Metadata = {
  title: 'UI Konsept 001',
  robots: { index: false, follow: false },
}

const SWATCHES = [
  { name: 'Ink', value: '#15110D' },
  { name: 'Bone', value: '#F4F0E8' },
  { name: 'Gold', value: '#C9A961' },
  { name: 'Success', value: '#5C7A3F' },
]

export default async function UiTest001Page() {
  const { products } = await getProducts({ isActive: true, limit: 6, orderBy: 'newest' })

  const specimens = products.map((p, i) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      no: String(i + 1).padStart(2, '0'),
      name: p.name,
      slug: p.slug,
      category: p.category?.name ?? '—',
      image: getProductImage(p),
      price: price ? formatPrice(price.current) : null,
    }
  })

  return (
    <div
      lang="tr"
      style={{
        backgroundColor: '#F4F0E8',
        color: '#15110D',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <style>{`
        .ut-specimen-strip { display: flex; gap: 1px; background: rgba(21,17,13,0.12); overflow-x: auto; }
        .ut-specimen-card { background: #F4F0E8; flex: 0 0 240px; scroll-snap-align: start; }
        .ut-specimen-strip { scroll-snap-type: x proximity; }
        .ut-masthead-grid { display: grid; grid-template-columns: 160px 1fr; gap: 40px; }
        .ut-ledger-row { display: grid; grid-template-columns: 1fr auto; gap: 16px; }
        @media (max-width: 760px) {
          .ut-masthead-grid { grid-template-columns: 1fr; gap: 20px; }
          .ut-headline { font-size: 42px !important; }
          .ut-specimen-card { flex-basis: 200px; }
        }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px clamp(20px, 4vw, 56px)',
          borderBottom: '1px solid rgba(21,17,13,0.14)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}
        >
          Dr. Şenol
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#9C7C3C',
            border: '1px solid rgba(201,169,97,0.5)',
            borderRadius: '999px',
            padding: '5px 12px',
          }}
        >
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Masthead ────────────────────────────────────────────── */}
      <section
        className="ut-masthead-grid"
        style={{ padding: 'clamp(48px, 8vw, 96px) clamp(20px, 4vw, 56px) clamp(56px, 8vw, 88px)' }}
      >
        <div>
          <p
            style={{
              margin: '0 0 6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#6B6258',
              writingMode: 'vertical-rl' as const,
              transform: 'rotate(180deg)',
              height: 'fit-content',
            }}
          >
            Vol. II — 2026
          </p>
          <p
            className="ut-headline"
            style={{
              margin: '18px 0 0',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(60px, 9vw, 108px)',
              lineHeight: 0.85,
              color: 'rgba(21,17,13,0.10)',
            }}
          >
            04
          </p>
        </div>

        <div>
          <p
            style={{
              margin: '0 0 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#9C7C3C',
            }}
          >
            Numune Endeksi
          </p>
          <h1
            className="ut-headline"
            style={{
              margin: '0 0 24px',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(38px, 6vw, 68px)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              textWrap: 'balance' as const,
              maxWidth: '14ch',
            }}
          >
            Her kavanoz, <em style={{ fontStyle: 'italic', color: '#9C7C3C' }}>bir alan notu.</em>
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '46ch',
              fontSize: '15px',
              lineHeight: 1.75,
              color: '#3A342C',
            }}
          >
            Bu sayfa, Dr. Şenol markasının görsel dilini farklı bir kompozisyonla
            deneyen bir tasarım konseptidir — koyu vitrin yerine açık zeminde,
            saha defteri hizasında. Katalogla bağlantılı değildir.
          </p>
          <div style={{ marginTop: '32px', height: '1px', width: '64px', background: '#C9A961' }} />
        </div>
      </section>

      {/* ── Numune şeridi ───────────────────────────────────────── */}
      {specimens.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(21,17,13,0.14)' }}>
          <p
            style={{
              margin: 0,
              padding: '20px clamp(20px, 4vw, 56px) 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#6B6258',
            }}
          >
            Numune Şeridi — Son Eklenenler
          </p>
          <div className="ut-specimen-strip" style={{ marginTop: '20px', padding: '0 clamp(20px, 4vw, 56px)' }}>
            {specimens.map((s) => (
              <article
                key={s.id}
                className="ut-specimen-card"
                style={{ border: '1px solid rgba(21,17,13,0.14)', marginRight: '-1px' }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    background: '#EBE5D8',
                    padding: '20px',
                  }}
                >
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="240px"
                      style={{ objectFit: 'contain', padding: '20px' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
                <div
                  style={{
                    borderTop: '1px dashed rgba(21,17,13,0.25)',
                    padding: '14px 16px 18px',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#9C7C3C',
                    }}
                  >
                    Ref. {s.no} · {s.category}
                  </p>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '17px',
                      fontWeight: 500,
                      lineHeight: 1.25,
                    }}
                  >
                    {s.name}
                  </p>
                  {s.price && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#3A342C',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.price}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Saha defteri alıntısı ───────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid rgba(21,17,13,0.14)',
          padding: 'clamp(56px, 9vw, 104px) clamp(20px, 4vw, 56px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,72px) 1fr',
          gap: '24px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9C7C3C',
          }}
        >
          § 02
          <br />
          Manifesto
        </p>
        <blockquote
          style={{
            margin: 0,
            maxWidth: '22ch',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(28px, 4.2vw, 44px)',
            lineHeight: 1.3,
          }}
        >
          Kovandan laboratuvara uzanan kırk yıllık bir yolculuk. Her kavanoz, bir
          bilim insanının imzasını taşır.
        </blockquote>
      </section>

      {/* ── Defter tablosu ──────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid rgba(21,17,13,0.14)',
          borderBottom: '1px solid rgba(21,17,13,0.14)',
          padding: 'clamp(40px, 6vw, 64px) clamp(20px, 4vw, 56px)',
        }}
      >
        <p
          style={{
            margin: '0 0 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6B6258',
          }}
        >
          Saha Kaydı
        </p>
        <div style={{ maxWidth: '560px' }}>
          {[
            ['Kuruluş', '1985'],
            ['Konum', 'Saitabat Köyü, Bursa'],
            ['Aktif Kovan', '1.247'],
            ['Analiz Laboratuvarı', 'Akredite'],
            ['Aktif Hasat', 'Q1 — 2026'],
          ].map(([label, value], i) => (
            <div
              key={label}
              className="ut-ledger-row"
              style={{
                padding: '14px 0',
                borderTop: i === 0 ? 'none' : '1px solid rgba(21,17,13,0.10)',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: '#3A342C' }}>{label}</p>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alt not + palet referansı ───────────────────────────── */}
      <footer
        style={{
          padding: 'clamp(28px, 5vw, 40px) clamp(20px, 4vw, 56px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: '#9B9285',
            maxWidth: '48ch',
          }}
        >
          Bu sayfa bir tasarım konseptidir — canlı katalogla bağlantılı değildir,
          arama motorlarında dizinlenmez.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {SWATCHES.map((c) => (
            <div key={c.name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: c.value,
                  border: '1px solid rgba(21,17,13,0.15)',
                }}
              />
              <p
                style={{
                  margin: '4px 0 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  color: '#9B9285',
                  textTransform: 'uppercase',
                }}
              >
                {c.name}
              </p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
