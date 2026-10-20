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
 * Eski servis çalışanı /admin belgesini yarıda keser. Alt menü belgenin
 * sonunda olduğu için "sekme var" sayfayı tamam sanmak yetmez: başlık ve
 * kart boyanmıyorsa ya da çalışan ?sw=5 değilse kapsam DIŞI /sw-reset.
 */
const ADMIN_SW_RECOVER = `
(function () {
  var KEY = 'sw-reset-n';
  var WANT = 'sw=5';
  function budget() {
    try { return Number(sessionStorage.getItem(KEY) || '0'); } catch (e) { return 99; }
  }
  function bump() {
    try { sessionStorage.setItem(KEY, String(budget() + 1)); } catch (e) {}
  }
  function clearBudget() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }
  function showNote() {
    if (document.getElementById('sw-reset-note')) return;
    var note = document.createElement('a');
    note.id = 'sw-reset-note';
    note.href = '/sw-reset?next=' + encodeURIComponent(location.pathname + location.search);
    note.textContent = 'Sayfa yarım kaldı. Paneli onarmak için dokunun.';
    note.setAttribute('style', 'display:block;margin:12px;padding:14px 16px;background:#1A1916;color:#F7F7F5;font:600 16px/1.4 system-ui,sans-serif;text-align:center;text-decoration:none;border-radius:10px;position:relative;z-index:80;');
    var shell = document.querySelector('.admin-shell') || document.body;
    shell.insertBefore(note, shell.firstChild);
  }
  function repair() {
    if (budget() >= 2) { showNote(); return; }
    bump();
    location.replace('/sw-reset?next=' + encodeURIComponent(location.pathname + location.search));
  }
  function painted(el) {
    if (!el) return false;
    if (el.offsetHeight >= 8 && el.offsetWidth >= 8) return true;
    if (!el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    return r.height >= 8 && r.width >= 8;
  }
  function contentOk() {
    if (location.pathname === '/admin/giris') return !!document.querySelector('form');
    var main = document.querySelector('.ad-shell-main');
    if (!main) return !document.querySelector('.admin-shell');
    var h1 = main.querySelector('h1');
    var nodes = main.querySelectorAll('.ad-card, .ad-card-sm, .ad-card-elevated, .ad-metric, .ad-empty, .ad-door, form, table');
    var block = false;
    for (var i = 0; i < nodes.length; i++) {
      if (painted(nodes[i])) { block = true; break; }
    }
    return painted(h1) && block;
  }
  function controllerStale() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
    var url = navigator.serviceWorker.controller.scriptURL || '';
    return url.indexOf(WANT) === -1;
  }
  if (controllerStale()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', repair);
    else repair();
    return;
  }
  function finish() {
    if (contentOk()) {
      clearBudget();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/admin-sw.js?sw=5', { scope: '/admin' }).catch(function () {});
      }
      return;
    }
    if (!document.querySelector('.admin-shell')) return;
    repair();
  }
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
})();
`

/** iOS, iç içe flex + overflow-x:hidden ile başlığı ve kartı boyamaz. */
const ADMIN_IOS_SHELL = `
html, body {
  overflow: visible !important;
  position: static !important;
  height: auto !important;
  max-width: 100% !important;
}
@media (max-width: 1024px) {
  .ad-shell-col,
  .ad-shell-row,
  .ad-shell-main {
    display: block !important;
    flex: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .ad-shell-col { min-height: 100vh !important; }
  .ad-sidebar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    min-height: 0 !important;
    position: absolute !important;
    overflow: hidden !important;
  }
  .ad-shell-main h1 {
    display: block !important;
    font-size: 26px !important;
    line-height: 1.25 !important;
    min-height: 1.25em !important;
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
    min-height: 0 !important;
    position: relative !important;
    clear: both;
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
    height: auto !important;
    position: relative !important;
    overflow: visible !important;
    opacity: 1 !important;
    visibility: visible !important;
    background-color: #FFFFFF !important;
  }
  .admin-shell .ad-btn {
    min-width: 0 !important;
    white-space: normal;
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
