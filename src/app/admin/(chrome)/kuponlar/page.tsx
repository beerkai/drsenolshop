import { requireAdmin } from '@/lib/admin-auth'
import CouponsPageClient from './CouponsPageClient'

export default async function AdminCouponsPage() {
  await requireAdmin()
  return <CouponsPageClient />
}
