import { requireAdmin } from '@/lib/admin-auth'
import SettingsPageClient from './SettingsPageClient'

export default async function AdminSettingsPage() {
  await requireAdmin()
  return <SettingsPageClient />
}
