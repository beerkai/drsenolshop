import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0908',
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
  metadataBase: new URL('https://drsenol.shop'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Dr. Şenol',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
    >
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
