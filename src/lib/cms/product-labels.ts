// ═══════════════════════════════════════════════════════════════
// Ürün kartı / buton / etiket metinleri — bağımsız, "server-only"
// importu olmayan bir dosyada tutulur. ProductLabelsProvider gibi
// Client Component'ler defaultProductLabels'ı doğrudan buradan alır;
// home-content.ts (getLocale/next-headers zincirini taşır) client
// bundle'a sızmasın diye home-content.ts'e bağımlı değildir.
// ═══════════════════════════════════════════════════════════════

export interface ProductLabels {
  /** Ürün detay birincil buton */
  addToCart: string
  addedToCart: string
  /** Kart ve detayda stok dışı rozeti */
  outOfStock: string
  /** Fiyat yalnızca varyanttan geliyorsa kartta gösterilen metin */
  variantPricePlaceholder: string
  /** Varyant seçim başlığı ve sağdaki not */
  variantHeading: string
  variantNote: string
  /** Varyant düğmesi durumları */
  variantSelected: string
  variantAvailable: string
  /** Koleksiyon sayfası boş durum */
  emptyTitle: string
  emptyHint: string
}

export const defaultProductLabels: ProductLabels = {
  addToCart: 'Sepete Ekle',
  addedToCart: 'Sepete Eklendi ✓',
  outOfStock: 'Tükendi',
  variantPricePlaceholder: 'Varyantta',
  variantHeading: 'Gramaj / Boyut',
  variantNote: 'Sınırlı Dolum',
  variantSelected: 'Seçili',
  variantAvailable: 'Mevcut',
  emptyTitle: 'Bu filtrelerle ürün bulunamadı.',
  emptyHint: 'Filtreleri temizleyip tekrar deneyin.',
}
