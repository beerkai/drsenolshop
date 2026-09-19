// ═══════════════════════════════════════════════════════════════
// Ürün açıklaması — HTML → paragraflar (Dr. Şenol gibi kısaltmalar korunur)
// ═══════════════════════════════════════════════════════════════

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/📌\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** HTML yapısına göre paragraflar; tek blokta nokta ile bölme yapılmaz */
export function productDescriptionParagraphs(htmlOrText: string): string[] {
  const raw = htmlOrText.trim()
  if (!raw) return []

  const hasHtml = /<[a-z][\s\S]*>/i.test(raw)
  if (hasHtml) {
    const blocks = raw
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/<\/p>\s*/i)
      .map((chunk) => chunk.replace(/<p[^>]*>/gi, '').trim())
      .filter(Boolean)
      .map(stripHtml)
      .filter((p) => p.length > 10)

    if (blocks.length > 0) return blocks
  }

  const plain = stripHtml(raw)
  if (plain.length <= 10) return []

  if (plain.includes('\n\n')) {
    return plain
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 10)
  }

  return [plain]
}

/** Kart / detay üstü kısa metin — short_desc bozuksa (Dr. Şenol eksik) long_desc paragrafına düş */
export function productHeroBlurb(product: {
  short_desc: string | null
  description?: string | null
  long_desc?: string | null
}): string | null {
  const paras = productDescriptionParagraphs(
    product.long_desc?.trim() || product.description?.trim() || ''
  )
  const short = product.short_desc?.trim() ?? ''
  const longHasBrand = paras.some((p) => /Dr\.\s*Şenol/i.test(p))

  if (short.length >= 15) {
    if (longHasBrand && !/Dr\.\s*Şenol/i.test(short)) {
      return paras[0] ?? short
    }
    return short
  }

  return paras[0] ?? (short || null)
}
