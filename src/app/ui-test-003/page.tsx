// ═══════════════════════════════════════════════════════════════
// /ui-test-003 — UI konsept önizlemesi C: "Etiket Arşivi"
// ─ Açık zemin ama 001'in sakin defter dilinden uzak: istiflenmiş
//   kağıt gölgeleri, döndürülmüş etiketler, mühür rozetleri —
//   dokunsal, eczane-etiketi kökenli ama iddialı bir kompozisyon.
// ─ Canlı katalogla bağlantılı değil, navigasyonda linki yok.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import { getProductImage, getProductStartingPrice, formatPrice } from '@/types'

export const metadata: Metadata = {
  title: 'UI Konsept 003',
  robots: { index: false, follow: false },
}

const RECORDS: [string, string][] = [
  ['Kuruluş', '1985'],
  ['Konum', 'Saitabat, Bursa'],
  ['Aktif Kovan', '1.247'],
  ['Laboratuvar', 'Akredite'],
  ['Hasat', 'Q1 — 2026'],
]

const CARD_TILT = [-1.6, 1.4, -0.8, 1.8, -1.3, 0.9]

export default async function UiTest003Page() {
  const { products } = await getProducts({ isActive: true, limit: 6, orderBy: 'newest' })

  const labels = products.map((p, i) => {
    const price = getProductStartingPrice(p)
    return {
      id: p.id,
      no: String(i + 1).padStart(2, '0'),
      name: p.name,
      category: p.category?.name ?? '—',
      image: getProductImage(p),
      price: price ? formatPrice(price.current) : null,
      tilt: CARD_TILT[i % CARD_TILT.length],
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
        .la-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
        .la-card:hover { transform: rotate(0deg) translateY(-4px) !important; }
        .la-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 44px 40px; }
        .la-records { display: flex; flex-wrap: wrap; gap: 14px; }
        @media (max-width: 900px) {
          .la-grid { grid-template-columns: repeat(2, 1fr); gap: 36px 24px; }
        }
        @media (max-width: 560px) {
          .la-grid { grid-template-columns: 1fr; }
          .la-headline { font-size: 46px !important; }
        }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px clamp(20px, 4vw, 56px)',
          background: 'rgba(201,169,97,0.08)',
          borderBottom: '1px solid rgba(21,17,13,0.1)',
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
            color: '#9C7C3C',
            border: '1px solid rgba(201,169,97,0.5)',
            borderRadius: '999px',
            padding: '5px 12px',
            background: '#F4F0E8',
          }}
        >
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Masthead ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4vw, 56px) clamp(88px, 10vw, 128px)' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 'clamp(30px, 6vw, 64px)',
            left: 'clamp(20px, 4vw, 60px)',
            transform: 'rotate(-7deg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3A342C',
            background: '#F4F0E8',
            border: '1px solid rgba(21,17,13,0.35)',
            borderRadius: '3px',
            padding: '6px 12px 6px 20px',
            boxShadow: '3px 4px 0 rgba(201,169,97,0.35)',
          }}
        >
          <span style={{ position: 'absolute', left: '8px', width: '5px', height: '5px', borderRadius: '50%', border: '1px solid #3A342C' }} />
          No. 03 · Saha Arşivi
        </div>

        <h1
          className="la-headline"
          style={{
            margin: '96px 0 0',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(58px, 9.5vw, 116px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            maxWidth: '15ch',
            textWrap: 'balance' as const,
          }}
        >
          Etiketlenmiş <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#9C7C3C' }}>her hasat.</span>
        </h1>
        <p style={{ margin: '28px 0 0', maxWidth: '48ch', fontSize: '15px', lineHeight: 1.75, color: '#3A342C' }}>
          Saitabat&apos;tan çıkan her kavanoz, kayıt altına alınmadan rafa
          çıkmaz. Bu sayfa, o arşivin farklı bir düzenle okunuşudur —
          katalogla bağlantılı değildir.
        </p>
      </section>

      {/* ── Etiket ızgarası ─────────────────────────────────────── */}
      {labels.length > 0 && (
        <section style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(72px, 9vw, 104px)' }}>
          <p style={{ margin: '0 0 40px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B6258' }}>
            Arşiv — Son Etiketlenenler
          </p>
          <div className="la-grid">
            {labels.map((l) => (
              <article
                key={l.id}
                className="la-card"
                style={{
                  position: 'relative',
                  transform: `rotate(${l.tilt}deg)`,
                  background: '#F4F0E8',
                  border: '1px solid rgba(21,17,13,0.16)',
                  boxShadow: '7px 7px 0 #E0D8C7, 13px 12px 0 rgba(201,169,97,0.22)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '-14px',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#5C7A3F',
                    color: '#F4F0E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    letterSpacing: '0.05em',
                    lineHeight: 1.3,
                    transform: 'rotate(12deg)',
                    boxShadow: '0 4px 10px rgba(21,17,13,0.25)',
                    zIndex: 2,
                  }}
                >
                  SAHA
                  <br />
                  ONAYLI
                </span>

                <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#EBE5D8', padding: '22px' }}>
                  {l.image ? (
                    <Image src={l.image} alt={l.name} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: 'contain', padding: '22px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>

                <div style={{ padding: '16px 18px 20px', borderTop: '1px dashed rgba(21,17,13,0.28)' }}>
                  <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9C7C3C' }}>
                    Etiket {l.no} · {l.category}
                  </p>
                  <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, lineHeight: 1.25 }}>
                    {l.name}
                  </p>
                  {l.price && (
                    <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#3A342C', fontVariantNumeric: 'tabular-nums' }}>
                      {l.price}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Manifesto — koyu blok ───────────────────────────────── */}
      <section style={{ background: '#15110D', color: '#F4F0E8', padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 56px)' }}>
        <p style={{ margin: '0 0 20px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4B570' }}>
          Manifesto
        </p>
        <blockquote
          style={{
            margin: 0,
            maxWidth: '20ch',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(30px, 4.6vw, 48px)',
            lineHeight: 1.28,
          }}
        >
          Kovandan laboratuvara uzanan kırk yıllık bir yolculuk. Her kavanoz,
          bir bilim insanının imzasını taşır.
        </blockquote>
      </section>

      {/* ── Saha kayıtları — döndürülmüş etiket şeridi ─────────── */}
      <section style={{ padding: 'clamp(48px, 7vw, 72px) clamp(20px, 4vw, 56px)' }}>
        <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B6258' }}>
          Saha Kaydı
        </p>
        <div className="la-records">
          {RECORDS.map(([label, value], i) => (
            <div
              key={label}
              style={{
                transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                background: '#EBE5D8',
                border: '1px solid rgba(21,17,13,0.14)',
                borderRadius: '3px',
                padding: '14px 20px',
              }}
            >
              <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B6258' }}>
                {label}
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alt not + palet ─────────────────────────────────────── */}
      <footer
        style={{
          padding: 'clamp(28px, 5vw, 40px) clamp(20px, 4vw, 56px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(21,17,13,0.12)',
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: '#9B9285', maxWidth: '48ch' }}>
          Bu sayfa bir tasarım konseptidir — canlı katalogla bağlantılı
          değildir, arama motorlarında dizinlenmez.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { name: 'Ink', value: '#15110D' },
            { name: 'Bone', value: '#F4F0E8' },
            { name: 'Gold', value: '#C9A961' },
            { name: 'Success', value: '#5C7A3F' },
          ].map((c) => (
            <div key={c.name} style={{ textAlign: 'center' }}>
              <div style={{ width: '22px', height: '22px', background: c.value, border: '1px solid rgba(21,17,13,0.15)' }} />
              <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.08em', color: '#9B9285', textTransform: 'uppercase' }}>
                {c.name}
              </p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
