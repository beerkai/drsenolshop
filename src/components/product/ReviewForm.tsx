'use client'

// ═══════════════════════════════════════════════════════════════
// Değerlendirme formu — Editorial Minimal
// ─ Alt çizgili input'lar, kare alanlar, sıfır gölge
// ─ API sözleşmesi DEĞİŞMEDİ: POST /api/reviews
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (rating < 1) {
      setError('Lütfen bir puan seçin.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, title, body }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message ?? 'Değerlendirme gönderilemedi.')
        return
      }

      setSent(true)
      router.refresh()
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <p className="font-body-sm text-body-sm text-on-surface">
        Değerlendirmeniz alındı. Onaylandıktan sonra yayımlanacak.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
      <span className="font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface">
        Değerlendirme Yaz
      </span>

      {/* Puan */}
      <div className="flex items-center gap-space-sm">
        <span className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
          Puan
        </span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => {
            const filled = i <= (hover || rating)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                aria-label={`${i} yıldız`}
                aria-pressed={rating === i}
                className="p-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-4 w-4"
                  fill={filled ? 'var(--color-honey-amber)' : 'none'}
                  stroke="var(--color-honey-amber)"
                  strokeWidth="1.2"
                >
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      <label className="flex flex-col gap-space-xs">
        <span className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
          Başlık
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="border-b border-hairline-light bg-transparent pb-1 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-on-surface focus:outline-none"
          placeholder="Kısa bir başlık"
        />
      </label>

      <label className="flex flex-col gap-space-xs">
        <span className="font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] text-on-surface-variant">
          Yorumunuz
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          className="resize-y border border-hairline-light bg-transparent p-space-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-on-surface focus:outline-none"
          placeholder="Ürünle ilgili deneyiminiz…"
        />
      </label>

      {error ? (
        <p className="font-body-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-12 bg-charcoal-pure px-space-lg font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-surface-container-lowest transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? 'Gönderiliyor…' : 'Gönder'}
      </button>
    </form>
  )
}
