'use client'

import { useState, type ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import SortDropdown, { type SortOption } from './SortDropdown'
import type { FilterState } from './CategoryFilters'

interface CatalogFilterSortBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  filterPanel: ReactNode
}

export default function CatalogFilterSortBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  filterPanel,
}: CatalogFilterSortBarProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-space-sm">
        <button
          type="button"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((o) => !o)}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 font-nav-caps text-nav-caps uppercase tracking-[0.14em] transition-colors ${
            filterOpen
              ? 'bg-primary text-on-primary'
              : 'border border-hairline-light bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          Filtre
        </button>

        <button
          type="button"
          aria-pressed={filters.inStockOnly}
          onClick={() => onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={`whitespace-nowrap px-3.5 py-1.5 font-nav-caps text-nav-caps uppercase tracking-[0.14em] transition-colors ${
            filters.inStockOnly
              ? 'bg-charcoal-pure text-surface-container-lowest'
              : 'border border-hairline-light bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Stokta
        </button>

        <div className="border border-hairline-light bg-surface-container-low px-3 py-1">
          <SortDropdown value={sortBy} onChange={onSortChange} label="Sırala:" />
        </div>
      </div>

      {filterOpen ? (
        <div className="border border-hairline-light bg-surface-container-lowest p-space-md">{filterPanel}</div>
      ) : null}
    </>
  )
}
