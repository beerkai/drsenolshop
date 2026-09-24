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
  themeColor: '#F4F0E8',
}

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s · DRŞ Admin',
  },
  description: 'Dr. Şenol Shop yönetim paneli — sipariş, stok, defter.',
  robots: { index: false, follow: false },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'DRŞ Admin',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
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
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div className="admin-shell">{children}</div>
      </body>
    </html>
  )
}
