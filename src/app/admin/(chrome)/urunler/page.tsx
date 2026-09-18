import { requireAdmin } from '@/lib/admin-auth'
import { listProducts } from '@/lib/admin-data'
import ProductOrderList from './ProductOrderList'

type SP = Promise<{ q?: string; page?: string }>

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const search = sp.q?.trim() || undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 50
  const offset = (page - 1) * limit

  const { products, total, ordered } = await listProducts({
    search,
    limit,
    offset,
    orderBy: 'display_order',
  })

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Katalog</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Ürünler{' '}
          <span style={{ color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '0.55em', letterSpacing: '0.1em', marginLeft: '6px' }}>
            {total}
          </span>
        </h1>
      </div>

      <form method="get" style={{ marginBottom: '20px', maxWidth: '420px' }}>
        <input
          type="search"
          name="q"
          defaultValue={search ?? ''}
          placeholder="Ürün ara (isim)…"
          className="ad-input"
        />
      </form>

      {products.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-title">Ürün bulunamadı.</p>
          {search && <p className="ad-empty-hint">&quot;{search}&quot; araması için sonuç yok.</p>}
        </div>
      ) : (
        <ProductOrderList products={products} canReorder={ordered} />
      )}
    </div>
  )
}
