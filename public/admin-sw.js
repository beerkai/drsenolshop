/* Dr. Şenol Admin PWA — scope /admin
 * Yalnızca ikon ve manifest önbelleği.
 *
 * HTML gezinmesi ve RSC (Flight) istekleri kasıtlı olarak ele alınmaz.
 * App Router yanıtı akışlıdır; service worker içinde clone + cache.put
 * gövdeyi keser, yönlendirmeyi (redirect: manual) opaqueredirect'e
 * çevirir. Sonuç: bazı yönetim sayfaları beyaz/boş kalır.
 */
const CACHE = 'drsenol-admin-v5'
const SW_VERSION = 5
const ASSETS = [
  '/admin/manifest.webmanifest',
  '/admin/icon-192.png',
  '/admin/icon-512.png',
  '/admin/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(ASSETS.map((url) => cache.add(url).catch(() => undefined))),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

function isAsset(pathname) {
  return (
    pathname.startsWith('/admin/icon-') ||
    pathname.endsWith('apple-touch-icon.png') ||
    pathname.endsWith('.webmanifest')
  )
}

/** Belge, RSC ve yönlendirme — tarayıcıya bırak. */
function isPassThrough(request, url) {
  if (request.mode === 'navigate') return true
  if (request.headers.has('RSC')) return true
  if (request.headers.has('Next-Router-Prefetch')) return true
  if (request.headers.has('Next-Router-State-Tree')) return true
  if (url.searchParams.has('_rsc')) return true
  const accept = request.headers.get('accept') || ''
  if (accept.includes('text/html') || accept.includes('text/x-component')) return true
  return false
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data) return
  if (data.type === 'version') {
    const port = event.ports && event.ports[0]
    if (port) port.postMessage({ version: SW_VERSION })
  }
  if (data.type === 'skip-waiting') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isPassThrough(request, url)) return
  if (url.pathname.startsWith('/api/')) return
  if (!isAsset(url.pathname)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || fetched
    }),
  )
})
