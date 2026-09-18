// ═══════════════════════════════════════════════════════════════
// /admin/kategoriler — kategori ağacı yönetimi
// ═══════════════════════════════════════════════════════════════

import { requireAdmin } from '@/lib/admin-auth'
import { listCategoriesAdmin } from '@/lib/admin-data'
import CategoryManagerClient from './CategoryManagerClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await listCategoriesAdmin()
  return <CategoryManagerClient categories={categories} />
}
