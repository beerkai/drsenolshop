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
 * Eski servis çalışanı (v2) gezinmeyi yarıda keser; React hidrasyonu
 * o sayfada çalışmayabilir. Bu betik <head> akışının hemen ardından
 * çalışır, sürümü sorar, eski kaydı siler ve en fazla iki kez yeniler.
 * SW_VERSION public/admin-sw.js ile aynı kalmalı.
 */
const ADMIN_SW_RECOVER = `
(function () {
  try {
    if (!('serviceWorker' in navigator)) return;
    var KEY = 'admin-sw-reset';
    var WANT = 4;
    var reloading = false;
    var hadController = !!navigator.serviceWorker.controller;
    function reads() {
      try { return Number(sessionStorage.getItem(KEY) || '0'); } catch (e) { return 0; }
    }
    function writes(n) {
      try { sessionStorage.setItem(KEY, String(n)); } catch (e) {}
    }
    function clears() {
      try { sessionStorage.removeItem(KEY); } catch (e) {}
    }
    function reloadOnce() {
      if (reloading) return;
      if (reads() >= 2) return;
      reloading = true;
      writes(reads() + 1);
      location.reload();
    }
    // İlk kurulumda sayfa zaten ağdan geldi; claim yüzünden yenileme.
    // Eski çalışan varken yeni dosya devralırsa bir kez yenile.
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (hadController) reloadOnce();
    });
    navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' }).then(function (reg) {
      var sw = navigator.serviceWorker.controller;
      if (!sw) { clears(); return; }
      var done = false;
      var channel = new MessageChannel();
      var timer = setTimeout(function () { finish(null); }, 900);
      function finish(version) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (version === WANT) { clears(); return; }
        var incoming = reg.waiting || reg.installing;
        if (incoming) {
          try { incoming.postMessage({ type: 'skip-waiting' }); } catch (e) {}
        }
        setTimeout(function () {
          if (reloading) return;
          caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (k) { return k.indexOf('drsenol-admin') === 0; }).map(function (k) { return caches.delete(k); }));
          }).then(function () { return reg.unregister(); }).then(reloadOnce).catch(reloadOnce);
        }, 700);
      }
      channel.port1.onmessage = function (event) {
        var version = event.data && event.data.version;
        finish(typeof version === 'number' ? version : null);
      };
      try { sw.postMessage({ type: 'version' }, [channel.port2]); }
      catch (e) { finish(null); }
    }).catch(function () {});
  } catch (e) {}
})();
`

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script id="admin-sw-recover" dangerouslySetInnerHTML={{ __html: ADMIN_SW_RECOVER }} />
        <div className="admin-shell">{children}</div>
      </body>
    </html>
  )
}
