import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { getHomeContent } from '@/lib/cms/home-content';
import CookieConsent from '@/components/editorial/EditorialCookieConsent';
import Analytics from '@/components/Analytics';
import { organizationLd, websiteLd, toJsonLdScript } from '@/lib/jsonld';
import { getSiteUrl } from '@/lib/site-url';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: 'var(--color-surface)',
};

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'Dr. Şenol — The Honey Scientist',
    template: '%s · Dr. Şenol',
  },
  description:
    '1985\'ten beri Saitabat Köyü\'nden, laboratuvar onaylı premium arı ürünleri. Kovandan laboratuvara uzanan bilimsel bir yolculuk.',
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Dr. Şenol',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Katalog etiketleri tema editöründen gelir; istek başına tek okuma (cache)
  const { productLabels } = await getHomeContent();

  return (
    <html
      lang="tr"
      className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers productLabels={productLabels}>{children}</Providers>
        <CookieConsent />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript([organizationLd(), websiteLd()]) }}
        />
      </body>
    </html>
  );
}
