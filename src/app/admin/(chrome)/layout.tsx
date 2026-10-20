import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { AdminChromeFrame } from '@/components/admin/shell/AdminChromeFrame'

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
    <AdminChromeFrame
      email={ctx?.admin.email ?? ''}
      fullName={ctx?.admin.full_name ?? null}
      role={ctx?.admin.role ?? 'staff'}
      pendingOrders={pendingCount}
    >
      {children}
    </AdminChromeFrame>
  )
}
