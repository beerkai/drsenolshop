import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

const NAV_COLS = [
  {
    title: 'Koleksiyon',
    links: [
      { label: 'Bal Çeşitleri', href: '/kategori/bal' },
      { label: 'Signature Series', href: '/kategori/signature', en: true },
      { label: 'Propolis', href: '/kategori/propolis' },
      { label: 'Arı Sütü & Polen', href: '/kategori/ari-sutu-polen' },
      { label: 'Goldylium Kozmetik', href: '/kategori/kozmetik' },
    ],
  },
  {
    title: 'Marka',
    links: [
      { label: 'Hikâyemiz', href: '/hikaye' },
      { label: 'Saitabat Köyü', href: '/saitabat-koyu' },
      { label: 'Bilim Yaklaşımımız', href: '/bilim-yaklasimimiz' },
      { label: 'Analiz Raporları', href: '/analiz-raporlari' },
      { label: 'Basında Biz', href: '/basinda-biz' },
    ],
  },
  {
    title: 'Yardım',
    links: [
      { label: 'Sipariş Takibi', href: '/siparis-takibi' },
      { label: 'Kargo & Teslimat', href: '/kargo-teslimat' },
      { label: 'İade & Değişim', href: '/iade-degisim' },
      { label: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar' },
      { label: 'İletişim', href: '/iletisim' },
    ],
  },
];

const CERTS = [
  { label: 'TSE Onaylı' },
  { label: 'ISO 22000', en: true },
  { label: 'Gıda Tarım Bakanlığı' },
  { label: 'Helal Sertifikalı' },
];

const TICKER = [
  'DR. ŞENOL NATURAL',
  'THE HONEY SCIENTIST',
  'PREMIUM RAW HONEY',
  'SAITABAT EST. 1985',
  'LABORATUVAR ONAYLI',
  '1.247 AKTIF KOVAN',
  'ULUDAĞ MİKROKLİMASI',
  'KOVANDAN LABORATUVARA',
]

/** Ürün detay sayfası — marka manifestosu yerine alışveriş / güven odaklı kayan şerit */
type FooterTickerToken = string | { text: string; lang: 'en' }

const PRODUCT_PAGE_TICKER: FooterTickerToken[] = [
  'ÜCRETSİZ KARGO · TÜM TÜRKİYE',
  'KAPIDA ÖDEME İMKÂNI',
  'ETİKET İLE LAB SONUÇLARI UYUMLU',
  'FATURALI TESLİMAT · ORİJİNAL ÜRÜN',
  'SAITABAT HASADI · KOVANDAN ŞİŞEYE',
  { text: 'SEALED BATCH · TRACEABLE LOT', lang: 'en' },
  { text: 'PREMIUM RAW · SINGLE ORIGIN', lang: 'en' },
  'GÜVENLİ ÖDEME ALTYAPISI',
  'HASAT TARİHİ VE MENŞEİ ŞİŞEDE',
]

export type FooterVariant = 'default' | 'product'

interface FooterProps {
  variant?: FooterVariant
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const tickerItems: FooterTickerToken[] =
    variant === 'product'
      ? [...PRODUCT_PAGE_TICKER, ...PRODUCT_PAGE_TICKER]
      : [...TICKER, ...TICKER]

  return (
    <footer style={{ backgroundColor: '#0A0908', borderTop: '1px solid rgba(244,240,232,0.06)', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 899px) {
          .footer-link-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: clamp(32px, 6vw, 48px) !important;
          }
        }
        @media (max-width: 420px) {
          .footer-link-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      {/* ════ MARQUEE TICKER ════ */}
      <div style={{
        borderBottom: '1px solid rgba(244,240,232,0.06)',
        padding: 'clamp(10px, 2vw, 13px) 0',
        overflow: 'hidden',
        backgroundColor: '#080706',
      }}>
        <div style={{
          display: 'flex',
          width: 'max-content',
          animation:
            variant === 'product' ? 'marquee 42s linear infinite' : 'marquee 50s linear infinite',
        }}>
          {tickerItems.map((item, i) => {
            const label = typeof item === 'string' ? item : item.text
            const lang = typeof item === 'string' ? undefined : item.lang
            return (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'clamp(10px, 3vw, 18px)',
                paddingRight: 'clamp(10px, 3vw, 18px)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(8px, 2vw, 10px)',
                letterSpacing: 'clamp(0.16em, 0.65vw, 0.28em)',
                textTransform: 'uppercase',
                color: i % 2 === 0 ? 'rgba(244,240,232,0.35)' : 'rgba(244,240,232,0.15)',
                whiteSpace: 'nowrap',
              }}
              {...(lang ? { lang } : {})}
            >
              {label}
              <span style={{ color: '#C9A961', fontSize: '7px', opacity: 0.7 }}>✦</span>
            </span>
            )
          })}
        </div>
      </div>

      {variant !== 'product' && (
      <div style={{
        position: 'relative',
        padding: 'clamp(48px, 10vw, 96px) clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid rgba(244,240,232,0.06)',
        overflow: 'hidden',
        textAlign: 'center',
      }}>

        {/* Marka manifestosu — ürün detayında bu blok gösterilmez (variant="product"). */}

        {/* Faint watermark */}
        <div aria-hidden style={{
          position: 'absolute',
          bottom: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(180px, 28vw, 380px)',
          fontWeight: 700,
          color: 'rgba(201,169,97,0.035)',
          lineHeight: 1,
          letterSpacing: '-0.05em',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          1985
        </div>

        {/* Corner coordinates */}
        <div style={{ position: 'absolute', top: '36px', right: 'clamp(24px, 5vw, 96px)', textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(244,240,232,0.15)', margin: '0 0 5px' }}>
            40°15′N 29°07′E
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(201,169,97,0.4)', margin: 0 }}>
            Saitabat · Bursa
          </p>
        </div>

        {/* Lot tag */}
        <div style={{ position: 'absolute', top: '36px', left: 'clamp(24px, 5vw, 96px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '1px', height: '28px', backgroundColor: '#C9A961', opacity: 0.5 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: 0 }}>
                Lot No.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(244,240,232,0.25)', margin: '3px 0 0' }}>
                2026 / Q1
              </p>
            </div>
          </div>
        </div>

        {/* Eyebrow */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.35em',
          color: '#C9A961',
          textTransform: 'uppercase',
          margin: '0 0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          Manifesto · Est. 1985
        </p>

        {/* Gold line */}
        <div style={{ width: '48px', height: '1px', backgroundColor: '#C9A961', margin: '0 auto 48px', position: 'relative', zIndex: 1 }} />

        {/* Quote */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 4.5vw, 36px)',
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: '-0.01em',
          color: '#F4F0E8',
          maxWidth: '860px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{ color: '#C9A961', fontStyle: 'italic' }}>Kovandan laboratuvara </span>
          uzanan kırk yıllık bir yolculuk.{' '}
          <span style={{ color: 'rgba(244,240,232,0.4)', fontStyle: 'italic', fontWeight: 300 }}>
            Her kavanoz, bir bilim insanının imzasını taşır.
          </span>
        </p>

        {/* Inline stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0',
          marginTop: '64px',
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(244,240,232,0.06)',
          paddingTop: '40px',
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {[
            { label: 'Aktif Hasat', value: 'Q1 — 2026' },
            { label: 'Aktif Kovan', value: '1,247' },
            { label: 'Analiz Laboratuvarı', value: 'Akredite' },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              flex: '1 1 160px',
              textAlign: 'center',
              padding: '0 32px',
              borderLeft: i > 0 ? '1px solid rgba(244,240,232,0.06)' : 'none',
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(244,240,232,0.25)', textTransform: 'uppercase', margin: '0 0 10px' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: '#C9A961', margin: 0, letterSpacing: '0.01em' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ════ NAV GRID ════ */}
      <div style={{
        padding: 'clamp(48px, 10vw, 88px) clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid rgba(244,240,232,0.06)',
      }}>
        <div className="footer-link-grid" style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: '56px',
        }}>

          {/* ── Brand column ── */}
          <div>
            {/* Wordmark */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.4em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 10px' }}>
                The Honey Scientist
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 500, color: '#F4F0E8', lineHeight: 1, margin: 0 }}>
                Dr. Şenol
              </p>
            </div>

            {/* Divider */}
            <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(201,169,97,0.35)', marginBottom: '24px' }} />

            <p style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: 'rgba(244,240,232,0.4)', lineHeight: 1.8, maxWidth: '230px', margin: '0 0 28px' }}>
              Saitabat Köyü, Uludağ eteği. 1985'ten bu yana kovandan laboratuvara, bilimsel arıcılık.
            </p>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="tel:+902241234567"
                className="hover:text-gold transition-colors duration-200"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(244,240,232,0.4)', textDecoration: 'none' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.62 4.47 2 2 0 0 1 3.59 2.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +90 224 123 45 67
              </a>
              <a
                href="mailto:bilgi@drsenol.shop"
                className="hover:text-gold transition-colors duration-200"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(244,240,232,0.4)', textDecoration: 'none' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                bilgi@drsenol.shop
              </a>
            </div>
          </div>

          {/* ── Nav columns ── */}
          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: '#C9A961',
                textTransform: 'uppercase',
                margin: '0 0 28px',
              }}>
                {col.title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-cream transition-colors duration-200"
                      style={{ fontSize: '13px', color: 'rgba(244,240,232,0.38)', textDecoration: 'none' }}
                      {...(link.en ? { lang: 'en' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ════ NEWSLETTER STRIP ════ */}
      <div style={{
        padding: 'clamp(36px, 8vw, 60px) clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid rgba(244,240,232,0.06)',
        backgroundColor: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Hasat Bildirimi
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2vw, 24px)', color: '#F4F0E8', fontWeight: 400, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              Yeni hasat döneminde ilk siz haberdar olun.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* ════ BOTTOM BAR ════ */}
      <div style={{ padding: 'clamp(20px, 5vw, 28px) clamp(16px, 4vw, 48px)' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>

          {/* Certifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {CERTS.map((cert, i) => (
              <span key={cert.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(244,240,232,0.2)', textTransform: 'uppercase' }}
                  {...(cert.en ? { lang: 'en' } : {})}
                >
                  {cert.label}
                </span>
                {i < CERTS.length - 1 && (
                  <span style={{ color: 'rgba(201,169,97,0.25)', fontSize: '7px' }}>✦</span>
                )}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(244,240,232,0.18)', textTransform: 'uppercase', margin: 0 }}>
            © 2026 Dr. Şenol Shop
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {[
              {
                href: 'https://instagram.com/drsenolshop',
                label: 'Instagram',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                ),
              },
              {
                href: 'https://youtube.com/@drsenol',
                label: 'YouTube',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <path d="m10 15 5-3-5-3z"/>
                  </svg>
                ),
              },
              {
                href: 'https://wa.me/902241234567',
                label: 'WhatsApp',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                ),
              },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-gold transition-colors duration-200"
                style={{ color: 'rgba(244,240,232,0.25)', display: 'flex' }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
