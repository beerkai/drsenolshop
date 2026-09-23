// ═══════════════════════════════════════════════════════════════
// @drsenol.shop public profil — son gönderiler
// Profil HTML'i artık giriş duvarına düşüyor; web profil API'si
// herkese açık timeline'ı döndürür. Görseller imzalı CDN
// adresleriyle gelir ve mobilde (Safari, uygulama içi tarayıcı)
// doğrudan açılmayabilir. Bu yüzden sayfa aynı origin'deki
// /api/instagram/media/[code] yolunu kullanır.
// Başarısız olursa anasayfa CMS karolarına düşer.
// ═══════════════════════════════════════════════════════════════

import type { IncomingHttpHeaders } from 'node:http'
import http2 from 'node:http2'
import https from 'node:https'
import { unstable_cache } from 'next/cache'

export interface InstagramFeedPost {
  id: string
  href: string
  imageUrl: string
  alt: string
}

const USERNAME = 'drsenol.shop'
const PROFILE_PAGE_URL = `https://www.instagram.com/${USERNAME}/`
const PROFILE_API_URL = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(USERNAME)}`
/** instagram.com web istemcisinin herkese açık uygulama kimliği */
const WEB_APP_ID = '936619743392459'
const HTML_MARKER = 'polaris_ordered_timeline_connection":'
const POST_LIMIT = 6
const ALT_MAX = 140
const CODE_RE = /^[A-Za-z0-9_-]{5,32}$/
const MAX_IMAGE_BYTES = 3_000_000
const FEED_REVALIDATE_SECONDS = 60 * 10

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

interface TimelineNode {
  code?: string
  shortcode?: string
  display_uri?: string
  display_url?: string
  thumbnail_src?: string
  thumbnail_resources?: { src?: string; config_width?: number }[]
  product_type?: string
  __typename?: string
  is_video?: boolean
  accessibility_caption?: string | null
  caption?: { text?: string | null } | null
  edge_media_to_caption?: { edges?: { node?: { text?: string | null } }[] }
}

interface WebProfilePayload {
  data?: {
    user?: {
      edge_owner_to_timeline_media?: {
        edges?: { node?: TimelineNode }[]
      }
    }
  }
}

export function isInstagramCdnUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.cdninstagram.com')
  } catch {
    return false
  }
}

export function instagramMediaPath(code: string): string {
  return `/api/instagram/media/${encodeURIComponent(code)}`
}

function cleanAlt(value: string): string {
  const flat = value.replace(/\s+/g, ' ').trim()
  if (!flat) return 'Instagram gönderisi'
  if (flat.length <= ALT_MAX) return flat
  return `${flat.slice(0, ALT_MAX - 1).trimEnd()}…`
}

function isVideoNode(node: TimelineNode): boolean {
  return (
    node.is_video === true ||
    node.product_type === 'clips' ||
    node.__typename === 'GraphVideo' ||
    node.__typename === 'XIGPolarisVideoMedia'
  )
}

function permalinkFor(node: TimelineNode, code: string): string {
  const kind = isVideoNode(node) ? 'reel' : 'p'
  return `https://www.instagram.com/${kind}/${code}/`
}

function captionFor(node: TimelineNode): string {
  const fromEdge = node.edge_media_to_caption?.edges?.[0]?.node?.text
  return (fromEdge || node.caption?.text || node.accessibility_caption || '').trim()
}

/** Kare ızgara için ~640px kırpılmış kare; yoksa tam görsel. */
function pickGridImage(node: TimelineNode): string | null {
  const resources = (node.thumbnail_resources ?? [])
    .filter(
      (item): item is { src: string; config_width: number } =>
        typeof item.src === 'string' &&
        typeof item.config_width === 'number' &&
        isInstagramCdnUrl(item.src.trim()),
    )
    .sort((a, b) => a.config_width - b.config_width)

  const preferred = resources.find((item) => item.config_width >= 640) ?? resources.at(-1)
  const candidates = [preferred?.src, node.thumbnail_src, node.display_url, node.display_uri]
  for (const candidate of candidates) {
    const trimmed = candidate?.trim() ?? ''
    if (trimmed && isInstagramCdnUrl(trimmed)) return trimmed
  }
  return null
}

function pushPosts(nodes: TimelineNode[], codeKey: 'code' | 'shortcode'): InstagramFeedPost[] {
  const posts: InstagramFeedPost[] = []
  for (const node of nodes) {
    const code = node[codeKey]?.trim() ?? ''
    const imageUrl = pickGridImage(node)
    if (!code || !CODE_RE.test(code) || !imageUrl) continue
    posts.push({
      id: code,
      href: permalinkFor(node, code),
      imageUrl,
      alt: cleanAlt(captionFor(node)),
    })
    if (posts.length >= POST_LIMIT) break
  }
  return posts
}

export function parseInstagramWebProfile(payload: unknown): InstagramFeedPost[] {
  const edges = (payload as WebProfilePayload | null)?.data?.user?.edge_owner_to_timeline_media?.edges
  if (!Array.isArray(edges)) return []
  const nodes = edges.map((edge) => edge?.node).filter((node): node is TimelineNode => Boolean(node))
  return pushPosts(nodes, 'shortcode')
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
  const markerAt = html.indexOf(HTML_MARKER)
  if (markerAt < 0) return []

  const raw = sliceJsonObject(html, markerAt + HTML_MARKER.length)
  if (!raw) return []

  let parsed: { edges?: { node?: TimelineNode }[] }
  try {
    parsed = JSON.parse(raw) as { edges?: { node?: TimelineNode }[] }
  } catch {
    return []
  }

  const nodes = (parsed.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is TimelineNode => Boolean(node))
  return pushPosts(nodes, 'code')
}

function closeHttp2(client: http2.ClientHttp2Session) {
  try {
    if (!client.closed && !client.destroyed) client.close()
  } catch {
    client.destroy()
  }
}

/** Instagram profil API'si HTTP/1.1 isteklerini 429 ile keser; HTTP/2 gerekir. */
function http2Get(
  urlString: string,
  headers: Record<string, string>,
): Promise<{ status: number; body: Buffer }> {
  const url = new URL(urlString)
  return new Promise((resolve, reject) => {
    const client = http2.connect(url.origin)
    let settled = false
    const timer = setTimeout(() => {
      client.destroy()
      finish(new Error('instagram zaman aşımı'))
    }, 12_000)
    const finish = (err?: Error, result?: { status: number; body: Buffer }) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      closeHttp2(client)
      if (err) reject(err)
      else resolve(result as { status: number; body: Buffer })
    }

    client.on('error', (err) => finish(err))
    const req = client.request({
      ':method': 'GET',
      ':path': `${url.pathname}${url.search}`,
      ...headers,
    })
    const chunks: Buffer[] = []
    req.on('response', (responseHeaders) => {
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      req.on('end', () => {
        finish(undefined, {
          status: Number(responseHeaders[':status'] ?? 0),
          body: Buffer.concat(chunks),
        })
      })
    })
    req.on('error', (err) => finish(err))
    req.end()
  })
}

function httpsGet(
  urlString: string,
  headers: Record<string, string>,
): Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = https.get(urlString, { headers }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks),
        })
      })
    })
    req.setTimeout(12_000, () => {
      req.destroy()
      reject(new Error('instagram görsel zaman aşımı'))
    })
    req.on('error', reject)
  })
}

async function fetchWebProfilePosts(): Promise<InstagramFeedPost[]> {
  const res = await http2Get(PROFILE_API_URL, {
    'user-agent': BROWSER_UA,
    accept: '*/*',
    'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'x-ig-app-id': WEB_APP_ID,
    'x-requested-with': 'XMLHttpRequest',
    referer: PROFILE_PAGE_URL,
  })
  if (res.status !== 200) {
    throw new Error(`instagram profil api ${res.status}`)
  }

  let payload: unknown
  try {
    payload = JSON.parse(res.body.toString('utf8')) as unknown
  } catch {
    throw new Error('instagram profil api json')
  }

  const posts = parseInstagramWebProfile(payload)
  if (posts.length === 0) {
    throw new Error('instagram feed boş')
  }
  return posts
}

async function loadInstagramFeedPosts(): Promise<InstagramFeedPost[]> {
  return fetchWebProfilePosts()
}

const cachedInstagramFeed = unstable_cache(loadInstagramFeedPosts, ['instagram-feed-drsenol-shop-v3'], {
  revalidate: FEED_REVALIDATE_SECONDS,
})

function toPublicPost(post: InstagramFeedPost): InstagramFeedPost {
  return { ...post, imageUrl: instagramMediaPath(post.id) }
}

/** Son 6 gönderi. Instagram engellerse boş dizi — çağıran CMS karolarını gösterir. */
export async function getInstagramFeedPosts(): Promise<InstagramFeedPost[]> {
  try {
    const posts = await cachedInstagramFeed()
    return posts.map(toPublicPost)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'bilinmeyen hata'
    console.error('[getInstagramFeedPosts] hata:', message)
    return []
  }
}

async function fetchInstagramCdnImage(startUrl: string): Promise<{ body: Uint8Array; contentType: string }> {
  let current = startUrl

  for (let hop = 0; hop < 3; hop++) {
    if (!isInstagramCdnUrl(current)) {
      throw new Error('instagram cdn adresi değil')
    }

    const res = await httpsGet(current, {
      'User-Agent': BROWSER_UA,
      Accept: 'image/avif,image/webp,image/jpeg,image/*;q=0.8',
      Referer: 'https://www.instagram.com/',
    })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.location
      const next = Array.isArray(location) ? location[0] : location
      if (!next) throw new Error('instagram görsel yönlendirmesi boş')
      current = new URL(next, current).toString()
      continue
    }

    if (res.status !== 200) {
      throw new Error(`instagram görsel ${res.status}`)
    }

    const rawType = res.headers['content-type']
    const contentType = (Array.isArray(rawType) ? rawType[0] : rawType || '').split(';')[0].trim().toLowerCase()
    if (!contentType.startsWith('image/')) {
      throw new Error('instagram görsel tipi geçersiz')
    }

    const lengthHeader = res.headers['content-length']
    const declared = Number(Array.isArray(lengthHeader) ? lengthHeader[0] : lengthHeader || '0')
    if (declared > MAX_IMAGE_BYTES) {
      throw new Error('instagram görsel çok büyük')
    }

    const body = new Uint8Array(res.body)
    if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) {
      throw new Error('instagram görsel boyutu geçersiz')
    }

    return { body, contentType }
  }

  throw new Error('instagram görsel yönlendirmesi fazla')
}

/** Aynı origin görsel yolu. Kod akışta yoksa null. */
export async function readInstagramMedia(
  code: string,
): Promise<{ body: Uint8Array; contentType: string } | null> {
  if (!CODE_RE.test(code)) return null

  let cdnUrl: string | null = null
  try {
    const posts = await cachedInstagramFeed()
    const match = posts.find((post) => post.id === code)
    cdnUrl = match && isInstagramCdnUrl(match.imageUrl) ? match.imageUrl : null
  } catch (err) {
    const message = err instanceof Error ? err.message : 'bilinmeyen hata'
    console.error('[readInstagramMedia] akış:', message)
    return null
  }

  if (!cdnUrl) return null

  try {
    return await fetchInstagramCdnImage(cdnUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'bilinmeyen hata'
    console.error('[readInstagramMedia] görsel:', message)
    return null
  }
}
