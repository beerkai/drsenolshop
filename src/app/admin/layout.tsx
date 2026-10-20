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
/** Panelde servis çalışanı kullanılmıyor; eski kayıtları sessizce sil. */
const ADMIN_SW_PURGE = `
(function () {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
  }).catch(function () {});
  if (window.caches) {
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) { return caches.delete(key); }));
    }).catch(function () {});
  }
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
.pn-shell-col,
.pn-shell-row,
.pn-shell-main {
  display: block !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  width: 100% !important;
  max-width: 100% !important;
}
.pn-shell-main h1,
.pn-shell-main .pn-page-title {
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
.pn-shell-main .pn-card,
.pn-shell-main .pn-card-sm,
.pn-shell-main .pn-card-elevated,
.pn-shell-main .pn-metric,
.pn-shell-main .pn-empty {
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
.pn-shell-main .pn-door {
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
  .pn-sidebar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    min-height: 0 !important;
    position: absolute !important;
    overflow: hidden !important;
  }
  .admin-shell .pn-btn {
    min-width: 0 !important;
    white-space: normal;
  }
}
@media (min-width: 1025px) {
  .pn-shell-row { display: flex !important; align-items: flex-start !important; }
  .pn-shell-main { flex: 1 1 auto !important; width: auto !important; max-width: none !important; }
  .pn-sidebar {
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
        <script id="admin-sw-purge" dangerouslySetInnerHTML={{ __html: ADMIN_SW_PURGE }} />
        <style id="admin-ios-shell" dangerouslySetInnerHTML={{ __html: ADMIN_IOS_SHELL }} />
        <div className="admin-shell">{children}</div>
      </body>
    </html>
  )
}
