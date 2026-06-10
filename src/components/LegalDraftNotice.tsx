import { isLegalInfoIncomplete } from '@/lib/legal-info'

/**
 * Yasal sayfalarda gösterilen uyarı şeridi.
 * NEXT_PUBLIC_LEGAL_* env'leri doldurulmadığında otomatik görünür,
 * doldurulduğunda kaybolur. Manuel kapatma yok.
 */
export default function LegalDraftNotice() {
  if (!isLegalInfoIncomplete()) return null

  return (
    <div
      role="note"
      style={{
        backgroundColor: 'rgba(209, 123, 106, 0.08)',
        borderTop: '1px solid rgba(209, 123, 106, 0.35)',
        borderBottom: '1px solid rgba(209, 123, 106, 0.35)',
        padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 4vw, 48px)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--color-alert-soft)',
            padding: '4px 10px',
            border: '1px solid rgba(209, 123, 106, 0.5)',
            flexShrink: 0,
          }}
        >
          Taslak
        </span>
        <p style={{ margin: 0, color: '#E5DDC8', fontSize: '13px', lineHeight: 1.6, flex: 1 }}>
          Bu sayfadaki <strong style={{ color: 'var(--color-cream)' }}>şirket bilgileri</strong> henüz tamamlanmamıştır.
          Resmi başvurular ve işlemler için lütfen{' '}
          <a href="/iletisim" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>iletişim sayfası</a>
          {' '}üzerinden bize ulaşın.
        </p>
      </div>
    </div>
  )
}
