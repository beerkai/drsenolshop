import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TopBar } from '@/components/admin/shell/TopBar'
import { Sidebar } from '@/components/admin/shell/Sidebar'
import './admin.css'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

async function getPendingOrderCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    return count ?? 0
  } catch {
    return 0
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''
  const isLogin = pathname === '/admin/giris'

  if (isLogin) {
    return (
      <div className="admin-shell ad-grid-bg">
        {children}
      </div>
    )
  }

  const ctx = await getCurrentAdmin()
  const pendingCount = await getPendingOrderCount()

  return (
    <div className="admin-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar
        email={ctx?.admin.email ?? ''}
        fullName={ctx?.admin.full_name ?? null}
        role={ctx?.admin.role ?? 'staff'}
      />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar pendingOrders={pendingCount} />
        <main
          className="ad-shell-main"
          style={{
            flex: 1,
            minWidth: 0,
            padding: 'clamp(20px, 3vw, 32px) clamp(20px, 3vw, 40px)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
