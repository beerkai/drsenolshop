// ═══════════════════════════════════════════════════════════════
// /ui-test-004 — UI konsept: "Editorial Minimal / Instagram Feed"
// ─ Brief: Beymen Club sessizliği + Instagram grid akışı. Bol negatif
//   alan, tek vurgu rengi (bal ambersi), ince çizgiler, hafif tipografi.
//   UI neredeyse görünmez — ürün fotoğrafı konuşuyor.
// ─ Tek sayfa içinde 4 ekranı sırayla gösterir: Anasayfa (hero+feed),
//   Koleksiyon, Ürün Detay, Sepet paneli.
// ─ Canlı katalogla bağlantılı değil, navigasyonda linki yok.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import Image from 'next/image'
import { getProducts, getProductBySlug } from '@/lib/products'
import { getProductImage, getProductImages, getProductStartingPrice, formatPrice } from '@/types'

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UI Konsept 004',
  robots: { index: false, follow: false },
}

const INK = '#141414'
const PAPER = '#FAFAF8'
const AMBER = '#D9A342'
const GREY = '#8C8C8C'
const LINE = '#E4E2DC'

const EDITORIAL_CARDS = [
  { index: 3, line: 'Kovandan sofraya,\ntek dokunuş.' },
  { index: 7, line: 'Saitabat\nKöyü, 1985.' },
]

export default async function UiTest004Page() {
  const [{ products: pool }, detail] = await Promise.all([
    getProducts({ isActive: true, limit: 12, orderBy: 'newest' }),
    getProductBySlug('sedir-bali'),
  ])

  const feed = pool.slice(0, 9).map((p) => {
    const price = getProductStartingPrice(p)
    const imgs = getProductImages(p)
    return { id: p.id, name: p.name, price: price ? formatPrice(price.current) : null, imgs }
  })

  const collection = pool.slice(0, 8).map((p) => {
    const price = getProductStartingPrice(p)
    const imgs = getProductImages(p)
    return { id: p.id, name: p.name, category: p.category?.name ?? '—', price: price ? formatPrice(price.current) : null, imgs }
  })

  const cartLines = pool.slice(0, 3).map((p, i) => {
    const price = getProductStartingPrice(p)
    const unit = price?.current ?? 0
    const qty = [1, 2, 1][i]
    return { id: p.id, name: p.name, image: getProductImage(p), unit, qty }
  })
  const cartTotal = cartLines.reduce((s, l) => s + l.unit * l.qty, 0)

  const detailImgs = detail ? getProductImages(detail) : []
  const detailPrice = detail ? getProductStartingPrice(detail) : null
  const detailVariants = detail?.variants ?? []

  return (
    <div className={archivo.className} style={{ backgroundColor: PAPER, color: INK, minHeight: '100vh' }}>
      <style>{`
        .ed-nav-links { display: flex; gap: 32px; }
        .ed-feed-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }
        .ed-coll-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid ${LINE}; border-left: 1px solid ${LINE}; }
        .ed-coll-cell { border-right: 1px solid ${LINE}; border-bottom: 1px solid ${LINE}; }
        .ed-fade { position: relative; overflow: hidden; }
        .ed-fade img { transition: opacity 0.5s ease, transform 0.6s ease; }
        .ed-fade:hover img.ed-fade-a { opacity: 0; }
        .ed-fade:hover img.ed-fade-b { opacity: 1; }
        .ed-fade:hover .ed-fade-scale { transform: scale(1.035); }
        .ed-detail-layout { display: grid; grid-template-columns: 1fr 380px; gap: 64px; align-items: start; }
        .ed-detail-sticky { position: sticky; top: 40px; }
        .ed-size-pill { transition: border-color 0.2s ease, color 0.2s ease; }
        @media (max-width: 1000px) {
          .ed-feed-grid { grid-template-columns: repeat(3, 1fr); }
          .ed-coll-grid { grid-template-columns: repeat(3, 1fr); }
          .ed-detail-layout { grid-template-columns: 1fr; }
          .ed-detail-sticky { position: static; }
        }
        @media (max-width: 640px) {
          .ed-nav-links { display: none; }
          .ed-feed-grid { grid-template-columns: repeat(2, 1fr); }
          .ed-coll-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Üst şerit ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px clamp(20px, 4vw, 56px)', borderBottom: `1px solid ${LINE}` }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER, border: `1px solid ${AMBER}`, padding: '5px 12px' }}>
          Önizleme · Yayında Değil
        </p>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(20px, 4vw, 56px)' }}>
        <p style={{ margin: 0, fontWeight: 400, fontSize: '15px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Dr. Şenol</p>
        <nav className="ed-nav-links">
          {['Bal', 'Signature', 'Goldylium', 'Hikâye'].map((n) => (
            <span key={n} style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '0.05em', color: INK }}>{n}</span>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      </header>

      {/* ═══ 1 · ANASAYFA ═══════════════════════════════════════ */}
      <p style={{ margin: '10px clamp(20px, 4vw, 56px) 0', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
        01 — Anasayfa
      </p>

      {/* Hero */}
      {feed[0]?.imgs[0] && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(420px, 82vh, 820px)', marginTop: '14px' }}>
          <Image src={feed[0].imgs[0]} alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,20,20,0.55), rgba(20,20,20,0) 45%)' }} />
          <div style={{ position: 'absolute', left: 'clamp(20px, 4vw, 56px)', bottom: 'clamp(28px, 5vw, 56px)', color: PAPER }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.85 }}>
              Est. 1985 — Saitabat Köyü
            </p>
            <h1 style={{ margin: 0, fontSize: 'clamp(30px, 4.6vw, 56px)', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.1 }}>
              Saitabat&apos;tan, tek hasat.
            </h1>
          </div>
        </div>
      )}

      {/* Feed grid */}
      <section style={{ padding: 'clamp(48px, 7vw, 80px) clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: '13px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK }}>Keşfet</h2>

        <div className="ed-feed-grid">
          {feed.map((f, i) => {
            const editorial = EDITORIAL_CARDS.find((e) => e.index === i)
            if (editorial) {
              return (
                <div
                  key={`ed-${i}`}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    background: INK,
                    color: PAPER,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 'clamp(14px, 1.6vw, 19px)', fontWeight: 300, letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {editorial.line}
                  </p>
                </div>
              )
            }
            const [imgA, imgB] = f.imgs
            return (
              <div key={f.id} className="ed-fade" style={{ position: 'relative', aspectRatio: '1 / 1', background: '#EFEDE7' }}>
                <div className="ed-fade-scale" style={{ position: 'absolute', inset: 0 }}>
                  {imgA && (
                    <Image src={imgA} alt={f.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="ed-fade-a" style={{ objectFit: 'cover', opacity: 1 }} />
                  )}
                  {imgB && (
                    <Image src={imgB} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="ed-fade-b" style={{ objectFit: 'cover', opacity: 0, position: 'absolute', inset: 0 }} />
                  )}
                </div>
                <div
                  aria-hidden
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', background: 'linear-gradient(to top, rgba(20,20,20,0.62), rgba(20,20,20,0) 100%)', pointerEvents: 'none' }}
                />
                <div style={{ position: 'absolute', left: '12px', bottom: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '11px', fontWeight: 400, color: PAPER }}>{f.name}</span>
                  {f.price && <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', color: AMBER }}>{f.price}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ 2 · KOLEKSİYON ══════════════════════════════════════ */}
      <p style={{ margin: '0 clamp(20px, 4vw, 56px)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
        02 — Koleksiyon
      </p>
      <section style={{ padding: '12px clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, letterSpacing: '0.01em' }}>Bal Çeşitleri</h2>

        <div className="ed-coll-grid">
          {collection.map((c) => {
            const [imgA, imgB] = c.imgs
            return (
              <div key={c.id} className="ed-coll-cell">
                <div className="ed-fade" style={{ position: 'relative', aspectRatio: '4 / 5', background: '#EFEDE7' }}>
                  <div className="ed-fade-scale" style={{ position: 'absolute', inset: 0 }}>
                    {imgA && <Image src={imgA} alt={c.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="ed-fade-a" style={{ objectFit: 'cover' }} />}
                    {imgB && <Image src={imgB} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="ed-fade-b" style={{ objectFit: 'cover', opacity: 0, position: 'absolute', inset: 0 }} />}
                  </div>
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '9.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREY }}>{c.category}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 400 }}>{c.name}</p>
                  {c.price && <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em', color: AMBER }}>{c.price}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ 3 · ÜRÜN DETAY ══════════════════════════════════════ */}
      {detail && (
        <>
          <p style={{ margin: '0 clamp(20px, 4vw, 56px)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
            03 — Ürün Detay
          </p>
          <section style={{ padding: '12px clamp(20px, 4vw, 56px) clamp(64px, 8vw, 96px)' }}>
            <div className="ed-detail-layout">
              {/* Galeri */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {(detailImgs.length > 0 ? detailImgs : [null]).slice(0, 3).map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: i === 0 ? '1 / 1' : '4 / 3', background: '#EFEDE7' }}>
                    {src && <Image src={src} alt={detail.name} fill sizes="(max-width: 1000px) 100vw, 60vw" style={{ objectFit: 'cover' }} />}
                  </div>
                ))}
              </div>

              {/* Bilgi paneli */}
              <div className="ed-detail-sticky">
                <p style={{ margin: '0 0 14px', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREY }}>
                  {detail.category?.name ?? 'Bal Çeşitleri'}
                </p>
                <h2 style={{ margin: '0 0 18px', fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.15 }}>
                  {detail.name}
                </h2>
                <p style={{ margin: '0 0 26px', fontSize: '14px', fontWeight: 400, color: '#3D3D3D', lineHeight: 1.75, maxWidth: '38ch' }}>
                  Uludağ&apos;ın sedir ormanlarından, tek hasat. Saitabat&apos;ın soğuk gecelerinde
                  yavaşça olgunlaşan, koyu ve dengelenmiş bir koku.
                </p>

                {detailPrice && (
                  <p style={{ margin: '0 0 28px', fontSize: '18px', fontWeight: 500, letterSpacing: '0.04em', color: AMBER }}>
                    {formatPrice(detailPrice.current)}
                  </p>
                )}

                {detailVariants.length > 0 && (
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREY }}>Boyut</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {detailVariants.slice(0, 3).map((v, i) => (
                        <span
                          key={v.id}
                          className="ed-size-pill"
                          style={{
                            fontSize: '12px',
                            fontWeight: 400,
                            padding: '10px 18px',
                            border: `1px solid ${i === 0 ? INK : LINE}`,
                            color: i === 0 ? INK : GREY,
                          }}
                        >
                          {v.label ?? v.variant_value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: INK, color: PAPER, textAlign: 'center', padding: '17px', fontSize: '12.5px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Sepete Ekle
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ 4 · SEPET ═══════════════════════════════════════════ */}
      <p style={{ margin: '0 clamp(20px, 4vw, 56px)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
        04 — Sepet
      </p>
      <section style={{ padding: '12px clamp(20px, 4vw, 56px) clamp(80px, 10vw, 120px)' }}>
        <div style={{ marginLeft: 'auto', width: '100%', maxWidth: '400px', border: `1px solid ${LINE}` }}>
          <div style={{ padding: '22px 22px 16px', borderBottom: `1px solid ${LINE}` }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sepet · {cartLines.length}
            </p>
          </div>

          <div>
            {cartLines.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 22px', borderBottom: `1px solid ${LINE}` }}>
                <div style={{ position: 'relative', width: '44px', height: '44px', background: '#EFEDE7', flexShrink: 0 }}>
                  {l.image && <Image src={l.image} alt={l.name} fill sizes="44px" style={{ objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '12.5px', fontWeight: 400 }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 400, color: GREY }}>Adet {l.qty}</p>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 500, color: AMBER, flexShrink: 0 }}>{formatPrice(l.unit * l.qty)}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}` }}>
            <span style={{ fontSize: '13px', fontWeight: 400 }}>Toplam</span>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatPrice(cartTotal)}</span>
          </div>

          <div style={{ padding: '20px 22px' }}>
            <div style={{ background: INK, color: PAPER, textAlign: 'center', padding: '16px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Ödemeye Geç
            </div>
          </div>
        </div>
      </section>

      {/* ── Alt not + palet ─────────────────────────────────────── */}
      <footer style={{ padding: 'clamp(24px, 5vw, 32px) clamp(20px, 4vw, 56px)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${LINE}` }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 400, color: GREY, maxWidth: '52ch' }}>
          Bu sayfa bir tasarım konseptidir — canlı katalogla bağlantılı değildir, arama motorlarında dizinlenmez.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { name: 'Ink', value: INK },
            { name: 'Paper', value: PAPER },
            { name: 'Amber', value: AMBER },
            { name: 'Grey', value: GREY },
          ].map((c) => (
            <div key={c.name} style={{ width: '18px', height: '18px', background: c.value, border: `1px solid ${LINE}` }} />
          ))}
        </div>
      </footer>
    </div>
  )
}
