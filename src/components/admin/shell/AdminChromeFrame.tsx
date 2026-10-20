'use client'

import { CommandProvider } from '@/components/admin/command/CommandProvider'
import { Toaster } from '@/components/admin/toast/Toaster'
import { TopBar } from '@/components/admin/shell/TopBar'
import { Sidebar } from '@/components/admin/shell/Sidebar'
import { AdminPwa } from '@/components/admin/shell/AdminPwa'
import { MobileBottomNav } from '@/components/admin/shell/MobileBottomNav'

interface AdminChromeFrameProps {
  children: React.ReactNode
  email: string
  fullName: string | null
  role: 'owner' | 'staff'
  pendingOrders: number
}

/** Komut paleti yalnızca üst çubukta; sayfa gövdesi istemci sarmalayıcısının dışında kalır. */
export function AdminChromeFrame({
  children,
  email,
  fullName,
  role,
  pendingOrders,
}: AdminChromeFrameProps) {
  return (
    <>
      <Toaster />
      <div className="pn-shell-col" style={{ display: 'block', minHeight: '100vh', width: '100%' }}>
        <CommandProvider>
          <TopBar
            email={email}
            fullName={fullName}
            role={role}
            pendingOrders={pendingOrders}
          />
        </CommandProvider>
        <div className="pn-shell-row" style={{ display: 'block', width: '100%' }}>
          <Sidebar pendingOrders={pendingOrders} />
          <main
            className="pn-shell-main"
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
        <MobileBottomNav pendingOrders={pendingOrders} />
      </div>
    </>
  )
}
