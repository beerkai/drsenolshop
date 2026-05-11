import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedProducts from '@/components/FeaturedProducts';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />

      <main className="w-full">

        {/* ════════════ BÖLÜM I — HERO ════════════ */}
        <section className="relative bg-ink overflow-hidden" style={{ minHeight: '780px' }}>

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="hero-orb-1 absolute rounded-full"
              style={{
                top: '-25%',
                left: '-15%',
                width: '700px',
                height: '700px',
                background: 'radial-gradient(circle, rgba(201,169,97,0.18) 0%, rgba(201,169,97,0.05) 30%, transparent 65%)',
              }}
            />
            <div
              className="hero-orb-2 absolute rounded-full"
              style={{
                bottom: '-30%',
                right: '-15%',
                width: '900px',
                height: '900px',
                background: 'radial-gradient(circle, rgba(212,192,148,0.10) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.025,
                backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A961 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Hero üst kısım — Lot No + Kovan */}
          <div
            className="relative z-10 mx-auto px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: '32px',
            }}
          >
            <div className="flex w-full flex-wrap items-start justify-between gap-6">
              <div className="flex items-center" style={{ gap: '14px' }}>
                <div className="bg-gold shrink-0" style={{ width: '1px', height: '36px' }} />
                <div className="text-left">
                  <p lang="en" className="font-mono uppercase text-gold" style={{ fontSize: '10px', letterSpacing: '0.25em', margin: 0 }}>
                    Lot No. 2026/Q1
                  </p>
                  <p className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.22em', marginTop: '4px' }}>
                    Hasat · İlkbahar
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.25em', margin: 0 }}>
                  Aktif Kovan
                </p>
                <p className="font-display text-gold" style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1, marginTop: '4px' }}>
                  1,247
                </p>
              </div>
            </div>
          </div>

          {/* Hero ana içerik — orta, ortalı */}
          <div
            className="relative z-10 mx-auto text-center px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: '80px',
              paddingBottom: '48px',
            }}
          >

            <p className="font-mono uppercase text-gold animate-fade-up" style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '20px' }}>
              Bölüm I · <span lang="en">The Honey Scientist</span>
            </p>

            <div className="bg-gold mx-auto animate-fade-up-1" style={{ width: '60px', height: '1px', marginBottom: '32px' }} />

            <h1
              className="font-display text-cream mx-auto animate-fade-up-1"
              style={{
                fontSize: 'clamp(56px, 9vw, 110px)',
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: '-0.015em',
                maxWidth: '900px',
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Doğanın{' '}
              <span className="text-gold" style={{ fontStyle: 'italic', fontWeight: 300 }}>en saf</span>
              {' '}hâli.
            </h1>

            <p
              className="text-cream-muted mx-auto animate-fade-up-2"
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                maxWidth: '480px',
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '32px',
                marginBottom: '40px',
              }}
            >
              1985{'\u2019'}ten bu yana Saitabat Köyü{'\u2019'}nde, her damla balın arkasında bir bilim insanının imzası. Laboratuvar onaylı, analiz raporlu.
            </p>

            <div className="flex flex-wrap justify-center animate-fade-up-3" style={{ gap: '14px' }}>
              <Link
                href="/kategori/bal"
                className="inline-flex items-center bg-gold text-ink font-mono uppercase hover:bg-[#D4B570] transition-colors duration-300"
                style={{ gap: '12px', padding: '16px 32px', fontSize: '11px', letterSpacing: '0.22em' }}
              >
                Koleksiyonu Keşfet
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/hikaye"
                className="inline-flex items-center text-cream font-mono uppercase hover:border-gold hover:text-gold transition-all duration-300"
                style={{ gap: '12px', padding: '16px 32px', fontSize: '11px', letterSpacing: '0.22em', border: '1px solid rgba(244,240,232,0.2)' }}
              >
                Hikâyemiz
              </Link>
            </div>
          </div>

          {/* Hero alt kısım — 4'lü metadata */}
          <div
            className="relative z-10 mx-auto px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: '32px',
              paddingBottom: '32px',
              marginTop: '40px',
              borderTop: '1px solid rgba(244,240,232,0.08)',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 justify-items-center text-center" style={{ gap: '32px' }}>
              {[
                { k: 'Kuruluş', v: '1985', en: false },
                { k: 'Konum', v: 'Saitabat, Bursa', en: false },
                { k: 'Analiz Lab.', v: 'Akredite', en: false },
                { k: 'Hasat', v: 'Q1 2026', en: true },
              ].map((item) => (
                <div key={item.k}>
                  <p className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.22em', marginBottom: '6px' }}>
                    {item.k}
                  </p>
                  <p
                    className="font-mono text-cream"
                    style={{ fontSize: '13px', letterSpacing: '0.04em', margin: 0 }}
                    {...(item.en ? { lang: 'en' } : {})}
                  >
                    {item.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ BÖLÜM II — KATEGORİLER ════════════ */}
        <section style={{ backgroundColor: '#F4F0E8', paddingTop: '96px', paddingBottom: '96px', borderBottom: '1px solid rgba(26,23,20,0.08)' }}>
          <div
            className="mx-auto px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >

            <div className="text-center" style={{ marginBottom: '80px' }}>
              <p className="font-mono uppercase text-gold" style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '20px' }}>
                Bölüm II
              </p>
              <div className="bg-gold mx-auto" style={{ width: '60px', height: '1px', marginBottom: '32px' }} />
              <h2 className="font-display" style={{ color: '#1A1714', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
                Üç hâne,{' '}
                <span className="text-gold" style={{ fontStyle: 'italic', fontWeight: 300 }}>tek miras.</span>
              </h2>
              <p
                style={{
                  color: '#6B6258',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  maxWidth: '520px',
                  width: '100%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: '32px',
                }}
              >
                Her kategori, on yılları aşan ustalığın bir bölümü. Kovandan kavanoza her aşama belgelenmiştir.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{ gap: '1px', backgroundColor: 'rgba(26,23,20,0.10)', border: '1px solid rgba(26,23,20,0.10)' }}
            >
              {[
                { num: '01 / 03', title: 'Bal Çeşitleri', desc: 'Kestane, kekik, çiçek ve yayla balları.', meta: '10 çeşit · 180g – 900g', href: '/kategori/bal' },
                { num: '02 / 03', titleEn: true, title: 'Signature Series', desc: 'Bilim ve doğanın buluştuğu imza formüller.', meta: '7 ürün · El yapımı', href: '/kategori/signature' },
                { num: '03 / 03', title: 'Arı Ürünleri', desc: 'Propolis, polen, arı sütü ve arı ekmeği.', meta: '6 ürün · Soğuk zincir', href: '/koleksiyon' },
              ].map((cat) => (
                <Link
                  key={cat.num}
                  href={cat.href}
                  className="cat-card flex flex-col items-center text-center"
                  style={{ paddingTop: '48px', paddingBottom: '48px', paddingLeft: '40px', paddingRight: '40px', backgroundColor: '#EBE5D8' }}
                >
                  <p className="font-mono text-gold" style={{ fontSize: '10px', letterSpacing: '0.25em', marginBottom: '32px' }}>
                    {cat.num}
                  </p>
                  <h3
                    className="font-display"
                    style={{ color: '#1A1714', fontSize: '32px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
                    {...('titleEn' in cat && cat.titleEn ? { lang: 'en' } : {})}
                  >
                    {cat.title}
                  </h3>
                  <p style={{ color: '#6B6258', fontSize: '14px', lineHeight: 1.7, marginTop: '16px', marginBottom: '32px', maxWidth: '240px' }}>
                    {cat.desc}
                  </p>
                  <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(26,23,20,0.15)', marginBottom: '24px' }} />
                  <p className="font-mono uppercase" style={{ color: '#9B9285', fontSize: '10px', letterSpacing: '0.2em', margin: 0 }}>
                    {cat.meta}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ BÖLÜM III — HİKÂYEMİZ ════════════ */}
        <section
          style={{
            backgroundColor: '#F4F0E8',
            paddingTop: '96px',
            paddingBottom: '96px',
            borderTop: '1px solid rgba(26,23,20,0.08)',
            borderBottom: '1px solid rgba(26,23,20,0.08)',
          }}
        >
          <div
            className="mx-auto px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >

            <div className="text-center" style={{ marginBottom: '64px' }}>
              <p className="font-mono uppercase text-gold" style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '20px' }}>
                Bölüm III · Hikâyemiz
              </p>
              <div className="bg-gold mx-auto" style={{ width: '60px', height: '1px', marginBottom: '32px' }} />
              <h2 className="font-display" style={{ color: '#1A1714', fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
                Bir köy, bir laboratuvar,<br />
                <span className="text-gold" style={{ fontStyle: 'italic', fontWeight: 300 }}>kırk yıl.</span>
              </h2>
            </div>

            <div
              className="mx-auto text-center"
              style={{
                width: '100%',
                maxWidth: '680px',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '64px',
              }}
            >
              <p style={{ color: '#6B6258', fontSize: '15px', lineHeight: 1.85, marginBottom: '24px' }}>
                Saitabat Köyü, Uludağ{'\u2019'}ın kuzey eteğinde, endemik bitki örtüsünün doruğa ulaştığı bir mikro-iklim. Burada Dr. Şenol, 1985{'\u2019'}ten bu yana arıcılığı bir bilim olarak ele alıyor.
              </p>
              <p style={{ color: '#6B6258', fontSize: '15px', lineHeight: 1.85, margin: 0 }}>
                Her hasat, akredite laboratuvarda fenolik madde, prolin, diastaz ve HMF değerleri için analiz edilir. Etiketin altındaki QR kod, ürününüze ait analiz raporuna açılır.
              </p>
            </div>

            <div
              className="grid grid-cols-2 md:grid-cols-4 mx-auto"
              style={{
                width: '100%',
                maxWidth: '1000px',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '48px',
                gap: '1px',
                backgroundColor: 'rgba(26,23,20,0.10)',
                border: '1px solid rgba(26,23,20,0.10)',
              }}
            >
              {[
                { value: '1985', label: 'Kuruluş', sub: 'Saitabat Köyü' },
                { value: '40+', label: 'Yıl Deneyim', sub: 'Üç kuşak' },
                { value: '1,247', label: 'Kovan', sub: 'Aktif üretim' },
                { value: '%100', label: 'Doğal', sub: 'Lab onaylı' },
              ].map((stat) => (
                <div key={stat.label} className="text-center" style={{ backgroundColor: '#EBE5D8', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '24px', paddingRight: '24px' }}>
                  <p className="font-display text-gold" style={{ fontSize: '44px', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.015em', margin: 0 }}>
                    {stat.value}
                  </p>
                  <p className="font-mono uppercase" style={{ color: '#1A1714', fontSize: '10px', letterSpacing: '0.22em', marginTop: '14px', marginBottom: '4px' }}>
                    {stat.label}
                  </p>
                  <p className="font-mono" style={{ color: '#9B9285', fontSize: '10px', letterSpacing: '0.15em', margin: 0 }}>
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/hikaye"
                className="inline-flex items-center hover:text-gold transition-colors duration-300 group"
                style={{ gap: '12px', color: '#1A1714' }}
              >
                <span className="font-mono uppercase" style={{ fontSize: '11px', letterSpacing: '0.22em' }}>
                  Tüm Hikâyeyi Oku
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════ BÖLÜM IV — ÖNE ÇIKANLAR ════════════ */}
        <FeaturedProducts />

        {/* ════════════ BÖLÜM V — SUPERBLEND ════════════ */}
        <section className="bg-ink" style={{ paddingTop: '96px', paddingBottom: '96px' }}>
          <div
            className="mx-auto px-responsive"
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >

            <div className="text-center" style={{ marginBottom: '64px' }}>
              <p className="font-mono uppercase text-gold" style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '20px' }}>
                Bölüm V · <span lang="en">Signature</span>
              </p>
              <div className="bg-gold mx-auto" style={{ width: '60px', height: '1px', marginBottom: '32px' }} />
              <h2 className="font-display text-cream" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0 }}>
                Bilim ve doğanın<br />
                <span className="text-gold" style={{ fontStyle: 'italic', fontWeight: 300 }}>en yüksek formu.</span>
              </h2>
              <p
                className="text-cream-muted mx-auto"
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  maxWidth: '480px',
                  width: '100%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: '32px',
                }}
              >
                Superblend formüllerimiz, dört nesil arıcılığın özünü tek bir kavanozda buluşturuyor.
              </p>
            </div>

            <Link
              href="/urun/superblend-5"
              className="block group hover:border-gold/40 transition-all duration-700"
              style={{ border: '1px solid rgba(244,240,232,0.08)' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">

                <div className="flex flex-col justify-center" style={{ paddingTop: '64px', paddingBottom: '64px', paddingLeft: '56px', paddingRight: '56px' }}>

                  <div className="flex items-center" style={{ gap: '14px', marginBottom: '24px' }}>
                    <span className="font-mono text-gold" style={{ fontSize: '11px', letterSpacing: '0.25em' }}>
                      No. 05
                    </span>
                    <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(201,169,97,0.4)' }} />
                    <span lang="en" className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                      Signature
                    </span>
                  </div>

                  <h3 lang="en" className="font-display text-cream group-hover:text-gold transition-colors duration-700" style={{ fontSize: '56px', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.015em', margin: 0 }}>
                    Superblend 5
                  </h3>

                  <p className="text-cream-muted" style={{ fontSize: '14px', lineHeight: 1.85, marginTop: '24px', marginBottom: '32px', maxWidth: '380px' }}>
                    Arı sütü, propolis, polen, arı ekmeği ve ham balın bilimsel oranlarda buluştuğu imza formülümüz.
                  </p>

                  <div style={{ marginBottom: '32px' }}>
                    {[
                      ['Ham Yayla Balı', '%55'],
                      ['Taze Arı Sütü', '%12'],
                      ['Propolis Ekstrakt', '%8'],
                      ['Çiçek Poleni', '%15'],
                      ['Arı Ekmeği', '%10'],
                    ].map(([name, pct], i, arr) => (
                      <div
                        key={name}
                        className="flex items-baseline justify-between"
                        style={{
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(244,240,232,0.08)',
                        }}
                      >
                        <p className="text-cream" style={{ fontSize: '13px', margin: 0 }}>{name}</p>
                        <p className="font-mono text-gold" style={{ fontSize: '11px', letterSpacing: '0.1em', margin: 0 }}>{pct}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-end justify-between" style={{ paddingTop: '24px', borderTop: '1px solid rgba(244,240,232,0.08)' }}>
                    <div>
                      <p className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.22em', marginBottom: '6px' }}>
                        Fiyat
                      </p>
                      <div className="flex items-baseline" style={{ gap: '10px' }}>
                        <p className="font-display text-cream" style={{ fontSize: '32px', fontWeight: 500, margin: 0 }}>
                          2.080 ₺
                        </p>
                        <p className="font-mono text-cream-faint" style={{ fontSize: '12px', textDecoration: 'line-through', margin: 0 }}>
                          2.600 ₺
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-cream group-hover:text-gold transition-colors duration-500" style={{ gap: '10px' }}>
                      <span className="font-mono uppercase" style={{ fontSize: '11px', letterSpacing: '0.22em' }}>
                        Ürünü İncele
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-ink-3 relative flex items-center justify-center" style={{ minHeight: '560px' }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(201,169,97,0.15) 0%, transparent 70%)',
                      opacity: 0.5,
                    }}
                  />
                  <div className="text-center relative" style={{ zIndex: 1 }}>
                    <p className="font-mono uppercase text-gold" style={{ fontSize: '10px', letterSpacing: '0.3em', marginBottom: '16px' }}>
                      Ürün Görseli
                    </p>
                    <p lang="en" className="font-display text-cream-muted" style={{ fontStyle: 'italic', fontSize: '24px', margin: 0 }}>
                      Superblend 5
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
