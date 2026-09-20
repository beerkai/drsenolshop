import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import ReviewModerationList, { type AdminReviewRow } from './ReviewModerationList'

export default async function AdminReviewsPage() {
  await requireAdmin()

  const supabase = getSupabaseAdmin()
  const [{ data: rows }, { data: productRows }] = await Promise.all([
    supabase
      .from('product_reviews')
      .select(
        'id, product_id, user_id, customer_email, customer_name, rating, title, body, is_approved, is_verified_purchase, created_at, products(name, slug)'
      )
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('products').select('id, name, slug').order('name').limit(500),
  ])

  type ReviewDbRow = {
    id: string
    product_id: string
    user_id: string | null
    customer_email: string
    customer_name: string | null
    rating: number
    title: string | null
    body: string | null
    is_approved: boolean
    is_verified_purchase: boolean
    created_at: string
    products?: { name: string; slug: string } | { name: string; slug: string }[] | null
  }

  const reviews: AdminReviewRow[] = ((rows ?? []) as ReviewDbRow[]).map((r) => {
    const product = Array.isArray(r.products) ? r.products[0] : r.products
    return {
      id: r.id,
      product_id: r.product_id,
      customer_email: r.customer_email,
      customer_name: r.customer_name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      is_approved: r.is_approved,
      is_verified_purchase: r.is_verified_purchase,
      created_at: r.created_at,
      product_name: product?.name ?? null,
      product_slug: product?.slug ?? null,
      is_curated: r.user_id == null,
    }
  })

  const products = (productRows ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
  }))

  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.length - pendingCount

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Moderasyon</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Yorumlar
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          {pendingCount} bekleyen · {approvedCount} onaylı (son 200)
        </p>
      </div>

      <ReviewModerationList initial={reviews} products={products} />
    </div>
  )
}
