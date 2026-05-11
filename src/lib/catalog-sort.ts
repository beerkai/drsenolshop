/** Grid + API ile paylaşılan sıralama (SortDropdown ile aynı küme) */
export type GridSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name' | 'popular'

const GRID_SORTS: readonly GridSortOption[] = [
  'newest',
  'popular',
  'price_asc',
  'price_desc',
  'name',
]

export function parseGridSort(value: string | null | undefined): GridSortOption {
  if (value && (GRID_SORTS as readonly string[]).includes(value)) {
    return value as GridSortOption
  }
  return 'newest'
}
