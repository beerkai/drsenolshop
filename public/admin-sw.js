/* Yönetim servis çalışanı — kapatma sürümü.
 * Eski sürüm /admin belgesini akışın ortasında kesiyordu ve iOS
 * aynı sekmede unregister ile düşmüyordu. Bu dosya hiçbir isteği
 * yakalamaz: kurulunca önbelleği siler, kaydı kaldırır, sayfayı yeniler.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    } catch {
      /* önbellek yoksa da kayıt kalksın */
    }
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      await Promise.all(clients.map((client) => client.postMessage({ type: 'reloaded' })))
    } catch {
      /* pencere yok */
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
    try {
      await self.registration.unregister()
    } catch {
      /* kayıt zaten yok */
    }
  })())
})
