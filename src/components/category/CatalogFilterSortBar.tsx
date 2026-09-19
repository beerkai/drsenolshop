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
    <div className="catalog-toolbar w-full min-w-0">
      <style>{`
        .catalog-toolbar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .catalog-toolbar__sort {
          width: 100%;
          border: 1px solid var(--color-hairline-light);
          background: var(--color-surface-container-low);
          padding: 0.5rem 0.75rem;
        }
        .catalog-toolbar__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          width: 100%;
        }
        .catalog-toolbar__btn {
          display: inline-flex;
          min-height: 2.5rem;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-family: var(--font-nav-caps);
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .catalog-toolbar__btn--filter {
          border: 1px solid var(--color-hairline-light);
          background: var(--color-surface-container-low);
          color: var(--color-on-surface-variant);
        }
        .catalog-toolbar__btn--filter.is-open,
        .catalog-toolbar__btn--filter:hover {
          color: var(--color-on-surface);
        }
        .catalog-toolbar__btn--filter.is-open {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-on-primary);
        }
        .catalog-toolbar__btn--stock {
          border: 1px solid var(--color-hairline-light);
          background: var(--color-surface-container-low);
          color: var(--color-on-surface-variant);
        }
        .catalog-toolbar__btn--stock.is-on {
          background: var(--color-charcoal-pure);
          border-color: var(--color-charcoal-pure);
          color: var(--color-surface-container-lowest);
        }
        .catalog-toolbar__btn--stock:not(.is-on):hover {
          color: var(--color-on-surface);
        }
        .catalog-toolbar__panel {
          border: 1px solid var(--color-hairline-light);
          background: var(--color-surface-container-lowest);
          padding: var(--spacing-space-md);
        }
        @media (min-width: 40rem) {
          .catalog-toolbar {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: stretch;
            justify-content: flex-end;
          }
          .catalog-toolbar__sort {
            width: auto;
            flex: 1 1 14rem;
            max-width: 22rem;
            order: 3;
          }
          .catalog-toolbar__actions {
            display: flex;
            width: auto;
            flex: 0 0 auto;
            order: 1;
          }
          .catalog-toolbar__btn {
            width: auto;
            min-width: 5.5rem;
          }
          .catalog-toolbar__panel {
            order: 4;
            flex: 1 1 100%;
          }
        }
      `}</style>

      <div className="catalog-toolbar__actions">
        <button
          type="button"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((o) => !o)}
          className={`catalog-toolbar__btn catalog-toolbar__btn--filter ${filterOpen ? 'is-open' : ''}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          Filtre
        </button>

        <button
          type="button"
          aria-pressed={filters.inStockOnly}
          onClick={() => onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={`catalog-toolbar__btn catalog-toolbar__btn--stock ${filters.inStockOnly ? 'is-on' : ''}`}
        >
          {filters.inStockOnly ? 'Stokta ✓' : 'Stokta'}
        </button>
      </div>

      <div className="catalog-toolbar__sort">
        <SortDropdown value={sortBy} onChange={onSortChange} label="Sırala" layout="toolbar" />
      </div>

      {filterOpen ? <div className="catalog-toolbar__panel">{filterPanel}</div> : null}
    </div>
  )
}
