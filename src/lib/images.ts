// ═══════════════════════════════════════════════════════════════
// CDN görsel URL'leri — DB'de path, vitrinde cdn.drsenol.shop
// Path: bucket "products/" SONRASI (ör. kekik-bali/850/x.webp)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CDN = 'https://cdn.drsenol.shop'

/** Eski CMS: /design-preview/stitch-NN.jpg — repoda yok, CDN ürün görsellerine map */
const LEGACY_STITCH_CDN_POOL = [
  'kestane-bali/850/0.webp',
  'kestane-bali/355/0.webp',
  'kekik-bali/0.webp',
  'sedir-bali/0.webp',
  'cam-bali/0.webp',
  'cicek-bali/0.webp',
  'lavanta-bali/355/0.webp',
  'polen/0.webp',
  'ari-ekmegi/0.webp',
  'kestane-bali/0.webp',
  'kekik-bali/850/0.webp',
  'sedir-bali/850/0.webp',
  'cam-bali/850/0.webp',
  'cicek-bali/850/0.webp',
  'lavanta-bali/850/0.webp',
  'polen/0.webp',
  'ari-ekmegi/0.webp',
  'kestane-bali/355/0.webp',
  'kekik-bali/355/0.webp',
  'sedir-bali/355/0.webp',
  'cam-bali/355/0.webp',
] as const

export function getCdnBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_CDN_URL || DEFAULT_CDN).replace(/\/$/, '')
}

/** site_settings / eski CMS kayıtlarındaki stitch placeholder → CDN path */
export function resolveLegacyDesignPreviewSrc(src: string): string {
  const v = src.trim()
  if (!v.includes('/design-preview/stitch-')) return v
  const m = v.match(/stitch-(\d+)\.jpg/i)
  const n = m ? Math.max(1, parseInt(m[1], 10)) : 1
  return LEGACY_STITCH_CDN_POOL[(n - 1) % LEGACY_STITCH_CDN_POOL.length] ?? 'kestane-bali/0.webp'
}

/**
 * DB path veya geçiş dönemi tam URL → müşteri/SEO URL.
 * - http(s): olduğu gibi
 * - `/…` (public/): site kökü — CDN'e çevrilmez
 * - `slug/n.webp`: CDN path
 */
export function getImageUrl(value: string | null | undefined): string {
  if (value == null) return ''
  let v = String(value).trim()
  if (!v) return ''
  v = resolveLegacyDesignPreviewSrc(v)
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  if (v.startsWith('/')) return v
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
