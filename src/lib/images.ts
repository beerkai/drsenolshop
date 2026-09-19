// ═══════════════════════════════════════════════════════════════
// CDN görsel URL'leri — DB'de path, vitrinde cdn.drsenol.shop
// Path: bucket "products/" SONRASI (ör. kekik-bali/850/x.webp)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CDN = 'https://cdn.drsenol.shop'

export function getCdnBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_CDN_URL || DEFAULT_CDN).replace(/\/$/, '')
}

/**
 * DB path veya geçiş dönemi tam URL → müşteri/SEO URL.
 * Geçiş: http(s) ile başlayan değerler olduğu gibi döner (migration sonrası kaldırılacak).
 */
export function getImageUrl(value: string | null | undefined): string {
  if (value == null) return ''
  const v = String(value).trim()
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  return `${getCdnBaseUrl()}/${v.replace(/^\/+/, '')}`
}

const SUPABASE_PRODUCTS_MARKER = '/storage/v1/object/public/products/'

/** Karşılaştırma / silme için bucket sonrası path */
export function resolveImageStoragePath(value: string): string {
  const v = String(value).trim()
  if (!v) return v

  const cdn = getCdnBaseUrl()
  if (v.startsWith(`${cdn}/`)) {
    return decodeURIComponent(v.slice(cdn.length + 1).split('?')[0] ?? '')
  }

  const idx = v.indexOf(SUPABASE_PRODUCTS_MARKER)
  if (idx !== -1) {
    return decodeURIComponent(v.slice(idx + SUPABASE_PRODUCTS_MARKER.length).split('?')[0] ?? '')
  }

  return v.replace(/^\/+/, '')
}
