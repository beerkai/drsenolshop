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
}

export default function ProductPriceRow({ price, placeholder, size = 'card' }: ProductPriceRowProps) {
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

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
      {price.original && price.original > price.current ? (
        <span className={originalClass}>{formatPrice(price.original)}</span>
      ) : null}
      <span className={currentClass}>{formatPrice(price.current)}</span>
    </div>
  )
}
