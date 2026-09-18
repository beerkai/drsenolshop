// ═══════════════════════════════════════════════════════════════
// Ürün yorumları — Editorial Minimal
// ─ Hairline ayraçlı liste, sıfır radius/gölge
// ─ Puan dağılımı ince çubuklarla; yıldızlar amber
// ─ ReviewForm (veri katmanı) olduğu gibi kullanılır
// ═══════════════════════════════════════════════════════════════

import type { ProductReview, ReviewStats } from '@/lib/reviews'
import ReviewForm from './ReviewForm'

interface Props {
  productId: string
  reviews: ProductReview[]
  stats: ReviewStats | null
  isLoggedIn: boolean
  userHasReview: boolean
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ''}`} aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden
          className="h-3.5 w-3.5"
          fill={i <= Math.round(rating) ? 'var(--color-honey-amber)' : 'none'}
          stroke="var(--color-honey-amber)"
          strokeWidth="1.2"
        >
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(iso)
    )
  } catch {
    return ''
  }
}

export default function ProductReviews({
  productId,
  reviews,
  stats,
  isLoggedIn,
  userHasReview,
}: Props) {
  const count = stats?.review_count ?? reviews.length
  const avg = stats?.avg_rating ?? 0

  const distribution: { star: number; n: number }[] = stats
    ? [
        { star: 5, n: stats.count_5 },
        { star: 4, n: stats.count_4 },
        { star: 3, n: stats.count_3 },
        { star: 2, n: stats.count_2 },
        { star: 1, n: stats.count_1 },
      ]
    : []

  return (
    <section className="w-full border-t border-hairline-light bg-surface ed-section-y">
      <div className="ed-section-inner">
        <div className="ed-section-head">
          <div>
            <span className="mb-1 block font-nav-caps text-nav-caps uppercase tracking-[0.16em] text-honey-amber">
              Müşteri Notları
            </span>
            <h2 className="font-headline-lg text-headline-lg font-light text-on-surface">
              Değerlendirmeler
            </h2>
          </div>

          {count > 0 ? (
            <div className="flex items-center gap-space-sm">
              <Stars rating={avg} />
              <span className="font-price-tag text-price-tag text-on-surface">
                {avg.toFixed(1)}
              </span>
              <span className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
                {count} değerlendirme
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
          {/* Sol: dağılım + form */}
          <div className="flex flex-col gap-space-lg lg:col-span-4">
            {distribution.length > 0 && count > 0 ? (
              <div className="flex flex-col gap-space-xs">
                {distribution.map(({ star, n }) => {
                  const pct = count > 0 ? Math.round((n / count) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-space-sm">
                      <span className="w-8 shrink-0 font-label-spec text-label-spec text-on-surface-variant">
                        {star}★
                      </span>
                      <span className="h-1 flex-1 bg-surface-container">
                        <span
                          className="block h-full bg-honey-amber"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right font-label-spec text-label-spec text-on-surface-variant">
                        {n}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {isLoggedIn && !userHasReview ? (
              <div className="border border-hairline-light bg-surface-container-lowest p-space-lg">
                <ReviewForm productId={productId} />
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {userHasReview
                  ? 'Bu ürün için değerlendirmeniz alındı.'
                  : 'Değerlendirme yazmak için giriş yapın.'}
              </p>
            )}
          </div>

          {/* Sağ: yorum listesi */}
          <div className="lg:col-span-8">
            {reviews.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Bu ürün için henüz değerlendirme yok.
              </p>
            ) : (
              <ul className="flex flex-col">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-hairline-light py-space-md first:pt-0">
                    <div className="mb-space-xs flex flex-wrap items-center gap-space-sm">
                      <Stars rating={r.rating} />
                      <span className="font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface">
                        {r.customer_name ?? 'Müşteri'}
                      </span>
                      {r.is_verified_purchase ? (
                        <span className="font-label-spec text-[10px] uppercase tracking-wider text-honey-amber">
                          Doğrulanmış Alışveriş
                        </span>
                      ) : null}
                      <span className="ml-auto font-editorial-caption text-editorial-caption text-on-surface-variant">
                        {formatDate(r.created_at)}
                      </span>
                    </div>

                    {r.title ? (
                      <p className="mb-1 font-headline-sm text-headline-sm font-normal text-on-surface">
                        {r.title}
                      </p>
                    ) : null}
                    {r.body ? (
                      <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                        {r.body}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
