import Link from 'next/link'
import type { Category } from '@/types'

type CategoryWithCount = Category & {
  product_count?: number
  children?: Array<Category & { product_count?: number }>
}

interface CatalogFilterPanelProps {
  categories: CategoryWithCount[]
  activeCategorySlug: string | null
  totalProducts: number
  allHref?: string
  allSelected?: boolean
}

export default function CatalogFilterPanel({
  categories,
  activeCategorySlug,
  totalProducts,
  allHref = '/koleksiyon',
  allSelected = false,
}: CatalogFilterPanelProps) {
  const chip =
    'inline-block whitespace-nowrap px-3 py-1 font-nav-caps text-[10px] uppercase tracking-[0.12em] transition-colors'

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <p className="mb-space-sm font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-on-surface">
          Kategoriler
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={allHref}
            className={`${chip} ${activeCategorySlug === null || allSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
          >
            Tümü ({totalProducts})
          </Link>
          {categories.map((c) => {
            const childActive = (c.children ?? []).some((ch) => ch.slug === activeCategorySlug)
            const active = activeCategorySlug === c.slug || childActive
            return (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className={`${chip} ${active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
              >
                {c.name}
                {typeof c.product_count === 'number' ? ` (${c.product_count})` : ''}
              </Link>
            )
          })}
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Stok ve sıralama için üstteki <strong className="font-normal text-on-surface">Filtre</strong> ve{' '}
        <strong className="font-normal text-on-surface">Sırala</strong> kontrollerini kullanın.
      </p>
    </div>
  )
}
