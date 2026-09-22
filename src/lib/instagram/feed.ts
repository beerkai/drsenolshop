// ═══════════════════════════════════════════════════════════════
// @drsenol.shop public profil — son gönderiler
// Profil herkese açık sayfanın içindeki timeline verisini okur.
// Resmi Graph API anahtarı gerekmez. Başarısız olursa anasayfa
// CMS karolarına düşer.
// ═══════════════════════════════════════════════════════════════

import { unstable_cache } from 'next/cache'

export interface InstagramFeedPost {
  id: string
  href: string
  imageUrl: string
  alt: string
}

const PROFILE_URL = 'https://www.instagram.com/drsenol.shop/'
const MARKER = 'polaris_ordered_timeline_connection":'
const POST_LIMIT = 6
const ALT_MAX = 140

const PROFILE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

interface TimelineNode {
  code?: string
  display_uri?: string
  product_type?: string
  __typename?: string
  accessibility_caption?: string | null
  caption?: { text?: string | null } | null
}

function isInstagramCdnUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.cdninstagram.com')
  } catch {
    return false
  }
}

function cleanAlt(value: string): string {
  const flat = value.replace(/\s+/g, ' ').trim()
  if (!flat) return 'Instagram gönderisi'
  if (flat.length <= ALT_MAX) return flat
  return `${flat.slice(0, ALT_MAX - 1).trimEnd()}…`
}

function permalinkFor(node: TimelineNode, code: string): string {
  const isClip = node.product_type === 'clips' || node.__typename === 'XIGPolarisVideoMedia'
  const kind = isClip ? 'reel' : 'p'
  return `https://www.instagram.com/${kind}/${code}/`
}

/** Timeline JSON nesnesini, string içindeki süslü parantez derinliğiyle keser. */
function sliceJsonObject(html: string, from: number): string | null {
  const start = html.indexOf('{', from)
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < html.length; i++) {
    const ch = html[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return html.slice(start, i + 1)
    }
  }

  return null
}

export function parseInstagramProfileHtml(html: string): InstagramFeedPost[] {
  const markerAt = html.indexOf(MARKER)
  if (markerAt < 0) return []

  const raw = sliceJsonObject(html, markerAt + MARKER.length)
  if (!raw) return []

  let parsed: { edges?: { node?: TimelineNode }[] }
  try {
    parsed = JSON.parse(raw) as { edges?: { node?: TimelineNode }[] }
  } catch {
    return []
  }

  const posts: InstagramFeedPost[] = []
  for (const edge of parsed.edges ?? []) {
    const node = edge.node
    const code = node?.code?.trim()
    const imageUrl = node?.display_uri?.trim()
    if (!node || !code || !imageUrl || !isInstagramCdnUrl(imageUrl)) continue
    if (!/^[A-Za-z0-9_-]+$/.test(code)) continue

    const caption = node.caption?.text?.trim() || node.accessibility_caption?.trim() || ''
    posts.push({
      id: code,
      href: permalinkFor(node, code),
      imageUrl,
      alt: cleanAlt(caption),
    })
    if (posts.length >= POST_LIMIT) break
  }

  return posts
}

async function loadInstagramFeedPosts(): Promise<InstagramFeedPost[]> {
  const res = await fetch(PROFILE_URL, {
    headers: PROFILE_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) {
    throw new Error(`instagram profil ${res.status}`)
  }

  const posts = parseInstagramProfileHtml(await res.text())
  if (posts.length === 0) {
    throw new Error('instagram feed boş')
  }
  return posts
}

const cachedInstagramFeed = unstable_cache(loadInstagramFeedPosts, ['instagram-feed-drsenol-shop'], {
  revalidate: 60 * 30,
})

/** Son 6 gönderi. Instagram engellerse boş dizi — çağıran CMS karolarını gösterir. */
export async function getInstagramFeedPosts(): Promise<InstagramFeedPost[]> {
  try {
    return await cachedInstagramFeed()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'bilinmeyen hata'
    console.error('[getInstagramFeedPosts] hata:', message)
    return []
  }
}
