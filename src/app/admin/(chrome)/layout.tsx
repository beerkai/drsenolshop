import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TopBar } from '@/components/admin/shell/TopBar'
import { Sidebar } from '@/components/admin/shell/Sidebar'
import { CommandProvider } from '@/components/admin/command/CommandProvider'
import { Toaster } from '@/components/admin/toast/Toaster'
import { AdminPwa } from '@/components/admin/shell/AdminPwa'
import { MobileBottomNav } from '@/components/admin/shell/MobileBottomNav'

// Cookie auth — build sırasında statik üretim yapma (env/cookie yokken patlar)
export const dynamic = 'force-dynamic'

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

export default async function AdminChromeLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentAdmin()
  const pendingCount = await getPendingOrderCount()

  return (
    <CommandProvider>
      <Toaster />
      <div className="ad-shell-col" style={{ display: 'block', minHeight: '100vh', width: '100%' }}>
        <TopBar
          email={ctx?.admin.email ?? ''}
          fullName={ctx?.admin.full_name ?? null}
          role={ctx?.admin.role ?? 'staff'}
          pendingOrders={pendingCount}
        />
        <div className="ad-shell-row" style={{ display: 'block', width: '100%' }}>
          <Sidebar pendingOrders={pendingCount} />
          <main
            className="ad-shell-main"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              overflow: 'visible',
              padding: '20px 16px 96px',
            }}
          >
            {children}
          </main>
        </div>
        <AdminPwa />
        <MobileBottomNav pendingOrders={pendingCount} />
      </div>
    </CommandProvider>
  )
}
