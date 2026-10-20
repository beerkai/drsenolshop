import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google'
import '../globals.css'
import './admin.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#F4F5F2',
}

export const metadata: Metadata = {
  title: {
    default: 'Yönetim',
    template: '%s · Yönetim',
  },
  description: 'Dr. Şenol Shop yönetim paneli — sipariş, stok, defter.',
  robots: { index: false, follow: false },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Yönetim',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/admin/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/admin/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/admin/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
}

/**
 * Tüm /admin/* için bağımsız root layout — /[locale] i18n sisteminin
 * tamamen dışında (her zaman TR), kendi <html>/<body>'sini taşır.
 * Chrome (TopBar + Sidebar) `(chrome)/layout.tsx`'te — login sayfası
 * o route group'a dahil olmadığı için chrome görmüyor.
 */
/**
 * Eski servis çalışanı iOS'ta unregister ile düşmüyor ve belgeyi kesiyor.
 * Varsa yeni dosyayı kurar; o dosya isteği yakalamaz, kaydı kendi siler.
 * Bir kez çalışır — sayfayı onarım bandına hapsedip aynı yere döndürmez.
 */
const ADMIN_SW_RECOVER = `
(function () {
  var KEY = 'sw-killed';
  function killed() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return true; }
  }
  function mark() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }
  if (!('serviceWorker' in navigator) || killed()) return;
  var reloading = false;
  navigator.serviceWorker.addEventListener('message', function (event) {
    if (reloading || !event.data || event.data.type !== 'reloaded') return;
    reloading = true;
    var url = new URL(location.href);
    url.searchParams.set('swgone', String(Date.now()));
    location.replace(url.pathname + url.search);
  });
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    var controlled = !!navigator.serviceWorker.controller;
    if (!controlled && (!regs || !regs.length)) return;
    mark();
    regs.forEach(function (reg) {
      if (reg.update) reg.update().catch(function () {});
    });
    navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin', updateViaCache: 'none' }).catch(function () {});
  }).catch(function () {});
})();
`

/** Medya sorgusuna bağlı değil: iOS gövde style'ında @media'yı yok sayabiliyor. */
const ADMIN_IOS_SHELL = `
html, body {
  overflow: visible !important;
  position: static !important;
  height: auto !important;
  max-width: 100% !important;
}
.ad-shell-col,
.ad-shell-row,
.ad-shell-main {
  display: block !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  width: 100% !important;
  max-width: 100% !important;
}
.ad-shell-main h1,
.ad-shell-main .ad-page-title {
  display: block !important;
  font-size: 28px !important;
  line-height: 34px !important;
  min-height: 34px !important;
  height: auto !important;
  max-height: none !important;
  color: #1A1916 !important;
  opacity: 1 !important;
  visibility: visible !important;
  position: static !important;
  transform: none !important;
  overflow: visible !important;
}
.ad-shell-main .ad-card,
.ad-shell-main .ad-card-sm,
.ad-shell-main .ad-card-elevated,
.ad-shell-main .ad-metric,
.ad-shell-main .ad-empty {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 48px !important;
  position: relative !important;
  overflow: visible !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  background-color: #FFFFFF !important;
}
.ad-shell-main .ad-door {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 48px !important;
  opacity: 1 !important;
  visibility: visible !important;
  background-color: #FFFFFF !important;
}
@media (max-width: 1024px) {
  .ad-sidebar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    min-height: 0 !important;
    position: absolute !important;
    overflow: hidden !important;
  }
  .admin-shell .ad-btn {
    min-width: 0 !important;
    white-space: normal;
  }
}
@media (min-width: 1025px) {
  .ad-shell-row { display: flex !important; align-items: flex-start !important; }
  .ad-shell-main { flex: 1 1 auto !important; width: auto !important; max-width: none !important; }
  .ad-sidebar {
    display: flex !important;
    position: sticky !important;
    width: 232px !important;
    height: calc(100vh - 56px) !important;
    overflow: auto !important;
  }
}
`

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script id="admin-sw-recover" dangerouslySetInnerHTML={{ __html: ADMIN_SW_RECOVER }} />
        <style id="admin-ios-shell" dangerouslySetInnerHTML={{ __html: ADMIN_IOS_SHELL }} />
        <div className="admin-shell">{children}</div>
      </body>
    </html>
  )
}
