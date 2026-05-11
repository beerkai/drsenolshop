import Link from 'next/link';

const COLS = [
  {
    title: 'Koleksiyon',
    links: [
      { label: 'Bal Çeşitleri', href: '/kategori/bal' },
      { label: 'Signature Series', href: '/kategori/signature' },
      { label: 'Propolis', href: '/kategori/propolis' },
      { label: 'Arı Sütü & Polen', href: '/kategori/ari-sutu-polen' },
      { label: 'Kozmetik', href: '/kategori/kozmetik' },
    ],
  },
  {
    title: 'Marka',
    links: [
      { label: 'Hikâyemiz', href: '/hikaye' },
      { label: 'Saitabat Köyü', href: '/saitabat' },
      { label: 'Bilim Yaklaşımımız', href: '/bilim' },
      { label: 'Analiz Raporları', href: '/analiz-raporlari' },
      { label: 'Basında Biz', href: '/basinda-biz' },
    ],
  },
  {
    title: 'Yardım',
    links: [
      { label: 'Sipariş Takibi', href: '/siparis-takibi' },
      { label: 'Kargo & Teslimat', href: '/kargo' },
      { label: 'İade & Değişim', href: '/iade' },
      { label: 'Sıkça Sorulanlar', href: '/sss' },
      { label: 'İletişim', href: '/iletisim' },
    ],
  },
];

const CERTS = ['TSE Onaylı', 'ISO 22000', 'Gıda Tarım Bakanlığı', 'Helal Sertifikalı'];

export default function Footer() {
  return (
    <footer className="bg-ink overflow-hidden" style={{ borderTop: '1px solid rgba(244,240,232,0.08)' }}>

      <div
        className="text-center"
        style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          paddingLeft: '48px',
          paddingRight: '48px',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
        }}
      >
        <p className="font-mono uppercase text-gold" style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '20px' }}>
          Manifesto
        </p>
        <div className="bg-gold mx-auto" style={{ width: '60px', height: '1px', marginBottom: '40px' }} />
        <p
          className="font-display text-cream mx-auto"
          style={{
            fontSize: 'clamp(22px, 2.5vw, 30px)',
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: '-0.005em',
            maxWidth: '780px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <span className="text-gold" style={{ fontStyle: 'italic' }}>Kovandan laboratuvara </span>
          uzanan bilimsel yolculuk. 1985'ten bu yana Saitabat Köyü'nde, doğanın en saf hali üzerine titiz bir araştırma.
        </p>
      </div>

      <div
        style={{
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '48px',
          paddingRight: '48px',
          borderBottom: '1px solid rgba(244,240,232,0.08)',
        }}
      >
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"
          style={{
            maxWidth: '1200px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            gap: '64px',
          }}
        >

          <div>
            <p lang="en" className="font-mono uppercase text-gold" style={{ fontSize: '9px', letterSpacing: '0.4em', marginBottom: '12px' }}>
              The Honey Scientist
            </p>
            <p className="font-display text-cream" style={{ fontSize: '36px', fontWeight: 500, lineHeight: 1, letterSpacing: '0.005em', marginBottom: '24px', margin: 0 }}>
              Dr. Şenol
            </p>
            <p className="text-cream-muted" style={{ fontSize: '13px', lineHeight: 1.8, marginTop: '24px', marginBottom: '32px', maxWidth: '260px' }}>
              Aile mirasıyla bilimsel hassasiyeti birleştiren premium arı ürünleri.
            </p>
            <div>
              <p className="font-mono uppercase text-cream-faint" style={{ fontSize: '10px', letterSpacing: '0.22em', marginBottom: '8px' }}>
                İletişim
              </p>
              <a href="tel:+902241234567" className="text-cream block hover:text-gold transition-colors" style={{ fontSize: '13px', marginBottom: '4px' }}>
                +90 224 123 45 67
              </a>
              <a href="mailto:bilgi@drsenol.shop" className="text-cream block hover:text-gold transition-colors" style={{ fontSize: '13px' }}>
                bilgi@drsenol.shop
              </a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-mono uppercase text-gold" style={{ fontSize: '10px', letterSpacing: '0.25em', marginBottom: '24px' }}>
                {col.title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: '12px' }}>
                    <Link
                      href={link.href}
                      className="text-cream-muted hover:text-cream transition-colors duration-200"
                      style={{ fontSize: '13px' }}
                      {...(link.label === 'Signature Series' ? { lang: 'en' } : {})}
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

      <div style={{ paddingTop: '32px', paddingBottom: '32px', paddingLeft: '48px', paddingRight: '48px' }}>
        <div
          className="mx-auto flex flex-col items-center"
          style={{
            maxWidth: '1200px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            gap: '24px',
          }}
        >

          <div className="flex items-center justify-center flex-wrap" style={{ gap: '8px' }}>
            {CERTS.map((cert) => (
              <span
                key={cert}
                className="font-mono uppercase text-cream-faint"
                style={{ fontSize: '10px', letterSpacing: '0.2em', padding: '8px 14px', border: '1px solid rgba(244,240,232,0.08)' }}
                {...(cert === 'ISO 22000' ? { lang: 'en' } : {})}
              >
                {cert}
              </span>
            ))}
          </div>

          <div style={{ width: '60px', height: '1px', backgroundColor: 'rgba(244,240,232,0.08)' }} />

          <p className="font-mono uppercase text-cream-faint text-center" style={{ fontSize: '10px', letterSpacing: '0.22em', margin: 0 }}>
            © 2026 Dr. Şenol Shop · Tüm hakları saklıdır
          </p>
        </div>
      </div>

    </footer>
  );
}
