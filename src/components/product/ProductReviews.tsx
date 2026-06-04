import type { ProductReview, ReviewStats } from '@/lib/reviews'
import ReviewForm from './ReviewForm'

interface Props {
  productId: string
  reviews: ProductReview[]
  stats: ReviewStats | null
  isLoggedIn: boolean
  userHasReview: boolean
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <span aria-label={`${value.toFixed(1)} / 5`} style={{ display: 'inline-flex', gap: '2px', color: '#C9A961', fontSize: `${size}px`, lineHeight: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden>
          {i < full ? '★' : i === full && half ? '☆' : '☆'}
        </span>
      ))}
    </span>
  )
}

export default function ProductReviews({ productId, reviews, stats, isLoggedIn, userHasReview }: Props) {
  const avg = stats?.avg_rating ?? 0
  const count = stats?.review_count ?? 0

  return (
    <section
      style={{
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 48px)',
        backgroundColor: '#0A0908',
        borderTop: '1px solid rgba(244,240,232,0.06)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Müşteri Yorumları
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '36px', borderBottom: '1px solid rgba(244,240,232,0.08)', paddingBottom: '24px' }}>
          <div>
            <h2 className="font-display" style={{ color: '#F4F0E8', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
              {count > 0 ? `${count} müşteri yorumu` : 'Henüz yorum yok'}
            </h2>
            {count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <Stars value={avg} size={18} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#C9A961' }}>
                  {avg.toFixed(1)} / 5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form veya bilgi */}
        {!isLoggedIn ? (
          <div style={{ padding: '20px 24px', border: '1px solid rgba(244,240,232,0.12)', backgroundColor: 'rgba(244,240,232,0.02)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <p style={{ color: '#B8B0A0', fontSize: '14px', margin: 0 }}>
              Bu ürün hakkında yorum bırakmak için giriş yapın.
            </p>
            <a href={`/giris?next=/urun/${encodeURIComponent(productId)}`} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A961', textDecoration: 'none' }}>
              Giriş Yap →
            </a>
          </div>
        ) : userHasReview ? (
          <div style={{ padding: '20px 24px', border: '1px solid rgba(201,169,97,0.3)', backgroundColor: 'rgba(201,169,97,0.05)', marginBottom: '32px' }}>
            <p style={{ color: '#E5DDC8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: '#C9A961', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', marginRight: '8px' }}>✓ Teşekkürler</span>
              Bu ürün hakkındaki yorumunuz alındı. Moderasyon sonrası yayınlanacaktır.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '40px' }}>
            <ReviewForm productId={productId} />
          </div>
        )}

        {/* Yorum listesi */}
        {reviews.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((r) => (
              <li key={r.id} style={{ padding: '20px 24px', border: '1px solid rgba(244,240,232,0.08)', backgroundColor: 'rgba(244,240,232,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <Stars value={r.rating} />
                    {r.title && (
                      <p className="font-display" style={{ color: '#F4F0E8', fontSize: '18px', fontWeight: 500, margin: '6px 0 0', lineHeight: 1.3 }}>
                        {r.title}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#B8B0A0', margin: 0 }}>
                      {r.customer_name ?? r.customer_email.split('@')[0]}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6E665A', margin: '2px 0 0' }}>
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>

                {r.is_verified_purchase && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', color: '#7AAD8B', textTransform: 'uppercase', margin: '6px 0 10px' }}>
                    ✓ Doğrulanmış Alışveriş
                  </p>
                )}

                {r.body && (
                  <p style={{ color: '#D4CFC2', fontSize: '14px', lineHeight: 1.7, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
                    {r.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#6E665A', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
            İlk yorumu siz bırakın.
          </p>
        )}
      </div>
    </section>
  )
}
