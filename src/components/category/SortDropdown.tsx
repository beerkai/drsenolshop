'use client'

// ═══════════════════════════════════════════════════════════════
// Sıralama — Editorial Minimal (Stitch koleksiyon)
// ─ Zemin yok, çerçeve yok; sadece nav-caps metin + chevron
// ─ Native <select> (erişilebilir, mobilde sistem picker'ı)
// ═══════════════════════════════════════════════════════════════

import type { GridSortOption } from '@/lib/catalog-sort'

export type SortOption = GridSortOption

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  label?: string
  /** Koleksiyon toolbar: tam genişlik, taşma yok */
  layout?: 'inline' | 'toolbar'
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'En Yeni Hasat' },
  { value: 'popular', label: 'Öne Çıkanlar' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'name', label: 'İsim: A–Z' },
]

export default function SortDropdown({
  value,
  onChange,
  label = 'Sıralama:',
  layout = 'inline',
}: SortDropdownProps) {
  const isToolbar = layout === 'toolbar'

  return (
    <div
      className={
        isToolbar
          ? 'flex w-full min-w-0 items-center justify-between gap-2 text-on-surface'
          : 'flex items-center gap-1.5 text-on-surface'
      }
    >
      <label
        htmlFor="ed-sort-select"
        className="shrink-0 font-editorial-caption text-editorial-caption uppercase tracking-[0.14em] text-on-surface-variant"
      >
        {label}
      </label>

      <div className={`relative flex min-w-0 items-center ${isToolbar ? 'flex-1 justify-end' : ''}`}>
        <select
          id="ed-sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className={`cursor-pointer appearance-none bg-transparent py-1 pr-5 font-nav-caps uppercase tracking-[0.12em] text-on-surface focus:outline-none focus-visible:underline focus-visible:decoration-honey-amber focus-visible:underline-offset-4 ${
            isToolbar
              ? 'max-w-full min-w-0 flex-1 truncate text-right text-[11px] sm:text-nav-caps'
              : 'text-nav-caps'
          }`}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-on-surface-variant"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}
