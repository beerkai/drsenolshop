interface CategoryHeroProps {
  title: string
  titleAccent?: string
  /** ASCII-only Türkçe kelimeler (örn. Koleksiyon) için açıkça verin */
  titleAccentLang?: 'tr' | 'en'
  description?: string
  totalProducts: number
  eyebrow?: string
  titleLang?: 'tr' | 'en'
}

function isLikelyEnglish(text: string): boolean {
  return !/[ğüşıöçĞÜŞİÖÇ]/.test(text)
}

export default function CategoryHero({
  title,
  titleAccent,
  titleAccentLang,
  description,
  totalProducts,
  eyebrow = 'Koleksiyon',
  titleLang,
}: CategoryHeroProps) {
  const titleLangResolved = titleLang ?? (isLikelyEnglish(title) ? 'en' : 'tr')

  return (
    <section
      lang="tr"
      style={{
        backgroundColor: '#0A0908',
        padding: 'clamp(36px, 8vw, 64px) clamp(18px, 5vw, 24px) clamp(28px, 7vw, 48px)',
        borderBottom: '1px solid rgba(244,240,232,0.08)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-jetbrains)',
          color: '#C9A961',
          fontSize: 'clamp(9px, 2vw, 11px)',
          letterSpacing: 'clamp(0.22em, 0.55vw, 0.3em)',
          textTransform: 'uppercase',
          margin: '0 0 16px',
        }}
      >
        {eyebrow} · {totalProducts} Ürün
      </p>
      <div
        style={{
          width: '48px',
          height: '1px',
          background: '#C9A961',
          margin: '0 auto 24px',
        }}
      />
      <h1
        lang={titleLangResolved}
        style={{
          fontFamily: 'var(--font-cormorant)',
          color: '#F4F0E8',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 500,
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          margin: '0 0 18px',
        }}
      >
        {title}
        {titleAccent && (
          <>
            {' '}
            <span
              style={{
                color: '#C9A961',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
              lang={titleAccentLang ?? (isLikelyEnglish(titleAccent) ? 'en' : 'tr')}
            >
              {titleAccent}
            </span>
          </>
        )}
      </h1>
      {description && (
        <p
          style={{
            color: '#B8B0A0',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            lineHeight: 1.65,
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          {description}
        </p>
      )}
    </section>
  )
}
