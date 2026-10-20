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
 * Eski servis çalışanı /admin belgesini yarıda keser. Aynı pencerede
 * unregister iOS'ta işlemez. Belge bitmemişse kapsam DIŞI /sw-reset
 * sayfasına gidilir; kayıt orada silinir.
 */
const ADMIN_SW_RECOVER = `
(function () {
  var KEY = 'sw-reset-n';
  function budget() {
    try { return Number(sessionStorage.getItem(KEY) || '0'); } catch (e) { return 99; }
  }
  function bump() {
    try { sessionStorage.setItem(KEY, String(budget() + 1)); } catch (e) {}
  }
  function clearBudget() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    var path = location.pathname;
    var login = path === '/admin/giris';
    var complete = login ? !!document.querySelector('form') : !!document.querySelector('.ad-mobile-tabbar');
    if (complete) {
      clearBudget();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' }).catch(function () {});
      }
      return;
    }
    var started = !!document.querySelector('.admin-shell');
    if (!started) return;
    if (budget() >= 2) {
      var note = document.createElement('a');
      note.href = '/sw-reset?next=' + encodeURIComponent(path + location.search);
      note.textContent = 'Sayfa yarım kaldı. Paneli onarmak için dokunun.';
      note.setAttribute('style', 'display:block;margin:12px;padding:14px 16px;background:#1A1916;color:#F7F7F5;font:600 16px/1.4 system-ui,sans-serif;text-align:center;text-decoration:none;border-radius:10px;position:relative;z-index:80;');
      var shell = document.querySelector('.admin-shell') || document.body;
      shell.insertBefore(note, shell.firstChild);
      return;
    }
    bump();
    location.replace('/sw-reset?next=' + encodeURIComponent(path + location.search));
  });
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
