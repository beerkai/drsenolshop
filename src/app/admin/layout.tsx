import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

/**
 * Tüm /admin/* için minimal root layout. Sadece CSS + tema sınıfı.
 * Chrome (TopBar + Sidebar) `(chrome)/layout.tsx`'te — login sayfası
 * o route group'a dahil olmadığı için chrome görmüyor.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>
}
