import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TopBar } from '@/components/admin/shell/TopBar'
import { Sidebar } from '@/components/admin/shell/Sidebar'

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
