import type { ReactNode } from 'react'
import {
  IconAnalytics,
  IconCustomers,
  IconDashboard,
  IconJournal,
  IconOrders,
  IconProducts,
  IconSettings,
  IconStock,
} from '../ui/Icon'

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

export function NavIcon({ href }: { href: string }) {
  switch (href) {
    case '/admin':
      return <IconDashboard />
    case '/admin/siparisler':
      return <IconOrders />
    case '/admin/urunler':
      return <IconProducts />
    case '/admin/kategoriler':
      return (
        <Svg>
          <path d="M4 6h16M8 12h12M8 18h12" />
          <path d="M4 6v12" />
        </Svg>
      )
    case '/admin/musteriler':
      return <IconCustomers />
    case '/admin/analitik':
      return <IconAnalytics />
    case '/admin/stok':
      return <IconStock />
    case '/admin/gunluk':
      return <IconJournal />
    case '/admin/defter':
      return (
        <Svg>
          <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" />
          <path d="M5 8h14M9 12h6M9 16h4" />
        </Svg>
      )
    case '/admin/vitrin':
      return (
        <Svg>
          <rect x="3" y="4" width="7" height="7" rx="1" />
          <rect x="14" y="4" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="6" rx="1" />
          <rect x="14" y="14" width="7" height="6" rx="1" />
        </Svg>
      )
    case '/admin/site':
      return (
        <Svg>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </Svg>
      )
    case '/admin/yorumlar':
      return (
        <Svg>
          <path d="M5 6h14v9H8l-3 3V6z" />
        </Svg>
      )
    case '/admin/kuponlar':
      return (
        <Svg>
          <path d="M4 8a2 2 0 0 1 2-2h12v4a2 2 0 0 0 0 4v4H6a2 2 0 0 1-2-2V8z" />
          <path d="M12 6v12" />
        </Svg>
      )
    case '/admin/epostalar':
      return (
        <Svg>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </Svg>
      )
    case '/admin/ayarlar':
      return <IconSettings />
    default:
      return <IconDashboard />
  }
}
