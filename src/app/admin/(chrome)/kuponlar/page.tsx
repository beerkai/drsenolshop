import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import CouponsPanel, { type CouponRow } from './CouponsPanel'

export default async function AdminCouponsPage() {
  await requireAdmin()

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const coupons = (data ?? []) as CouponRow[]
  const active = coupons.filter((c) => c.is_active).length

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Pazarlama</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Kuponlar
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          {active} aktif · {coupons.length} toplam
        </p>
      </div>

      <CouponsPanel initial={coupons} />
    </div>
  )
}
