import { formatPrice } from '@/types'

interface ProductPriceRowProps {
  price: {
    current: number
    original: number | null
    discount: number
  } | null
  placeholder?: string
  /** Kart alt satırı için kompakt görünüm */
  size?: 'card' | 'inline'
  /** -%15 rozeti */
  showDiscountBadge?: boolean
}

export default function ProductPriceRow({
  price,
  placeholder,
  size = 'card',
  showDiscountBadge = true,
}: ProductPriceRowProps) {
  if (!price || price.current <= 0) {
    if (!placeholder) return null
    return (
      <span className="font-label-spec text-label-spec uppercase text-on-surface-variant">{placeholder}</span>
    )
  }

  const currentClass =
    size === 'card'
      ? 'font-price-tag text-price-tag font-medium text-honey-amber'
      : 'font-price-tag text-sm font-medium text-honey-amber'
  const originalClass =
    size === 'card'
      ? 'font-price-tag text-price-tag text-on-surface-variant line-through'
      : 'font-price-tag text-sm text-on-surface-variant line-through'
  const badgeClass =
    size === 'card'
      ? 'font-label-spec text-[10px] uppercase tracking-wider text-charcoal-pure'
      : 'font-label-spec text-[9px] uppercase tracking-wider text-charcoal-pure'

  const hasDiscount = price.original !== null && price.original > price.current && price.discount > 0

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
      {price.original && price.original > price.current ? (
        <span className={originalClass}>{formatPrice(price.original)}</span>
      ) : null}
      <span className={currentClass}>{formatPrice(price.current)}</span>
      {showDiscountBadge && hasDiscount ? (
        <span className={`${badgeClass} bg-honey-amber/25 px-1.5 py-0.5`} lang="en">
          -%{price.discount}
        </span>
      ) : null}
    </div>
  )
}
