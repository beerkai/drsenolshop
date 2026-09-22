// ═══════════════════════════════════════════════════════════════
// Anasayfa HTML şeritleri — istemci ve sunucu için saf yardımcılar
// Kayıt: site_settings.home_html_blocks (home-html-blocks.ts)
// ═══════════════════════════════════════════════════════════════

export const HOME_HTML_BLOCKS_KEY = 'home_html_blocks'
export const MAX_HOME_HTML_BLOCKS = 12
export const MAX_HOME_HTML_LENGTH = 20_000

export interface HomeHtmlBlock {
  id: string
  name: string
  enabled: boolean
  /** Yönetici HTML'i. Kaydetmeden önce sanitizeHomeHtml uygulanır. */
  html: string
}

/** Parfüm seçkisinin altına yakın, sade bir şerit başlangıcı */
export const HOME_HTML_STRIP_TEMPLATE = `<section style="background:#F4F0E8;border-top:1px solid #e6e1d6;border-bottom:1px solid #e6e1d6;padding:18px 24px;">
  <div style="max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center;justify-content:space-between;">
    <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">
      <strong>Duyuru</strong>
      <span style="margin-left:12px;letter-spacing:0;text-transform:none;font-size:15px;">Buraya şerit metnini yazın.</span>
    </p>
    <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.72;">İsteğe bağlı not</p>
  </div>
</section>`

const PAIRED_FORBIDDEN =
  /<\s*(script|iframe|object|embed|form|svg|math|textarea|select|frameset|applet|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi

const LONE_FORBIDDEN =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|textarea|select|option|meta|base|link|svg|math|frame|frameset|applet|noscript)\b[^>]*>/gi

function cleanStyleBody(body: string): string {
  return body
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/@import/gi, '')
    .replace(/<\/style/gi, '')
}

/** Script, olay dinleyicisi ve javascript: adreslerini ayıklar. Stil ve düzen HTML'i kalır. */
export function sanitizeHomeHtml(raw: string): string {
  if (typeof raw !== 'string') return ''
  let html = raw.replace(/^\uFEFF/, '').slice(0, MAX_HOME_HTML_LENGTH)
  html = html.replace(/<!--[\s\S]*?-->/g, '')

  for (let i = 0; i < 8; i++) {
    const next = html.replace(PAIRED_FORBIDDEN, '')
    if (next === html) break
    html = next
  }

  html = html.replace(LONE_FORBIDDEN, '')
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  html = html.replace(/\s+(?:srcdoc|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  html = html.replace(
    /(\s(?:href|src|action|xlink:href)\s*=\s*)(['"])\s*(?:javascript|vbscript):[^'"]*\2/gi,
    '$1$2#$2',
  )
  html = html.replace(
    /(\ssrc\s*=\s*)(['"])\s*data:(?!image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);)[^'"]*\2/gi,
    '$1$2#$2',
  )
  html = html.replace(/style\s*=\s*(['"])([\s\S]*?)\1/gi, (_match, quote, body) => {
    return `style=${quote}${cleanStyleBody(String(body))}${quote}`
  })
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, body) => {
    return `<style>${cleanStyleBody(String(body))}</style>`
  })

  return html.trim()
}

export function normalizeHomeHtmlBlocks(input: unknown): HomeHtmlBlock[] {
  if (!Array.isArray(input)) return []
  const out: HomeHtmlBlock[] = []

  for (const item of input.slice(0, MAX_HOME_HTML_BLOCKS)) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const id = typeof row.id === 'string' ? row.id.trim().slice(0, 80) : ''
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) continue
    const nameRaw = typeof row.name === 'string' ? row.name.trim().slice(0, 80) : ''
    out.push({
      id,
      name: nameRaw || 'Şerit',
      enabled: row.enabled === true,
      html: sanitizeHomeHtml(typeof row.html === 'string' ? row.html : ''),
    })
  }

  return out
}

export function newHomeHtmlBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `blok-${Date.now().toString(36)}`
}
