// ═══════════════════════════════════════════════════════════════
// CDN görsel URL'leri — DB'de path, vitrinde cdn.drsenol.shop
// Path: bucket "products/" SONRASI (ör. kekik-bali/850/x.webp)
// ═══════════════════════════════════════════════════════════════

import { legacyStitchGoogleUrl } from '@/lib/cms/editorial-google-images'

const DEFAULT_CDN = 'https://cdn.drsenol.shop'

/** Eski CMS: /design-preview/stitch-NN.jpg → Stitch Google (aida-public) URL */
export function resolveLegacyDesignPreviewSrc(src: string): string {
  const v = src.trim()
  if (!v.includes('/design-preview/stitch-')) return v
  const m = v.match(/stitch-(\d+)\.jpg/i)
  const n = m ? Math.max(1, parseInt(m[1], 10)) : 1
  return legacyStitchGoogleUrl(n)
}

/**
 * DB path veya geçiş dönemi tam URL → müşteri/SEO URL.
 * - http(s): olduğu gibi
 * - `/…` (public/): site kökü — CDN'e çevrilmez
 * - `slug/n.webp`: CDN path
 */
function resolveImageUrlInternal(value: string | null | undefined): string {
  if (value == null) return ''
  let v = String(value).trim()
  if (!v) return ''
  v = resolveLegacyDesignPreviewSrc(v)
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  if (v.startsWith('/')) return v
  return `${getCdnBaseUrl()}/${v.replace(/^\/+/, '')}`
}

export function getImageUrl(value: string | null | undefined): string {
  return resolveImageUrlInternal(value)
}

/** Anasayfa / editoryal görselleri (stitch → Google; ayrı hook noktası) */
export function getEditorialImageUrl(value: string | null | undefined): string {
  return resolveImageUrlInternal(value)
}

export function getCdnBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_CDN_URL || DEFAULT_CDN).replace(/\/$/, '')
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
