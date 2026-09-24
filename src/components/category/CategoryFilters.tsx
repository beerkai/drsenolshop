'use client'

// ═══════════════════════════════════════════════════════════════
// Kategori filtreleri — Editorial Minimal (Stitch koleksiyon)
// ─ Yatay kaydırılabilir çip şeridi; kare, sıfır radius
// ─ Seçili: bg-primary / text-on-primary. Seçilmemiş: container-low
// ─ Stok filtresi aynı şeritte ayrı bir çip grubu olarak durur
//
// Referans: dr._enol_koleksiyon_hasatlar/code.html "Filter Pills"
// ═══════════════════════════════════════════════════════════════

import { Link } from '@/i18n/navigation'
import type { Category } from '@/types'

export interface FilterState {
  inStockOnly: boolean
}

type CategoryWithCount = Category & {
  product_count?: number
  children?: Array<Category & { product_count?: number }>
}

interface CategoryFiltersProps {
  categories: CategoryWithCount[]
  activeCategorySlug: string | null
  totalProducts: number
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  /** Sonuç sayısı — mobil panelde gösterilir */
  resultCount?: number
  /** "Tümü" çipinin gideceği katalog kökü */
  allHref?: string
  /** Kök vitrin (ör. /goldylium) "Tümü" olarak seçili sayılır */
  allSelected?: boolean
}

const CHIP_BASE =
  'whitespace-nowrap px-3.5 py-1.5 font-nav-caps text-nav-caps uppercase tracking-[0.14em] transition-colors duration-200'
const CHIP_ON = 'bg-primary text-on-primary'
const CHIP_OFF = 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'

export default function CategoryFilters({
  categories,
  activeCategorySlug,
  totalProducts,
  filters,
  onFiltersChange,
  allHref = '/koleksiyon',
  allSelected = false,
}: CategoryFiltersProps) {
  /*
   * Stitch şerit yoğunluğu: yalnızca ana kategoriler (≈5 çip).
   * Alt kategoriler düz listeye karıştırılmaz — aktif ana kategorinin
   * altında ikinci, daha ince bir şeritte gösterilir. Böylece şerit
   * sıralama kontrolünün altına taşmaz ve alt kategoriler erişilebilir
   * kalır.
   */
  const activeParent = categories.find(
    (c) => c.slug === activeCategorySlug || (c.children ?? []).some((ch) => ch.slug === activeCategorySlug)
  )
  const subChips = activeParent?.children ?? []

  // NOT: Yatay padding/max-width ÜST bileşenden gelir (ed-section-inner).
  // Burada tekrar sarmalanırsa çift padding oluşup şerit taşar.
  return (
    <div className="min-w-0">
      <div className="scrollbar-none flex items-center gap-3 overflow-x-auto pb-2">
        <Link
          href={allHref}
          className={`${CHIP_BASE} ${activeCategorySlug === null || allSelected ? CHIP_ON : CHIP_OFF}`}
        >
          Tümü ({totalProducts})
        </Link>

        {categories.map((c) => {
          const active = activeCategorySlug === c.slug
          const childActive = (c.children ?? []).some((ch) => ch.slug === activeCategorySlug)
          return (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className={`${CHIP_BASE} ${active || childActive ? CHIP_ON : CHIP_OFF}`}
            >
              {c.name}
              {typeof c.product_count === 'number' ? ` (${c.product_count})` : ''}
            </Link>
          )
        })}

      </div>

      {/* Alt kategoriler — yalnızca aktif ana kategorinin altında */}
      {subChips.length > 0 ? (
        <div className="scrollbar-none flex items-center gap-space-md overflow-x-auto pb-1">
          {subChips.map((ch) => (
            <Link
              key={ch.slug}
              href={`/kategori/${ch.slug}`}
              className={`whitespace-nowrap font-editorial-caption text-editorial-caption uppercase tracking-[0.12em] transition-colors ${
                activeCategorySlug === ch.slug
                  ? 'text-on-surface underline decoration-honey-amber decoration-1 underline-offset-4'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {ch.name}
              {typeof ch.product_count === 'number' ? ` (${ch.product_count})` : ''}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
