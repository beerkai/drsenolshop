import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listProducts } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { Badge } from '@/components/admin/ui/Badge'
import { IconStar, IconArrowRight } from '@/components/admin/ui/Icon'

type SP = Promise<{ q?: string; page?: string }>

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const search = sp.q?.trim() || undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 50
  const offset = (page - 1) * limit

  const { products, total } = await listProducts({ search, limit, offset })

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
          {search && <p className="ad-empty-hint">"{search}" araması için sonuç yok.</p>}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th className="is-right">Fiyat</th>
                <th className="is-right">KDV</th>
                <th className="is-right">Stok</th>
                <th>Durum</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = (p.stock_quantity ?? 0) <= 5 && (p.stock_quantity ?? 0) > 0
                const isOut = (p.stock_quantity ?? 0) <= 0 && p.variants_count === 0
                return (
                  <tr key={p.id}>
                    <td>
                      <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: 0, fontWeight: 500 }}>{p.name}</p>
                      <p className="ad-mono" style={{ fontSize: '10.5px', color: 'var(--ad-fg-faint)', margin: '2px 0 0', letterSpacing: '0.05em' }}>
                        {p.slug}
                      </p>
                    </td>
                    <td style={{ color: 'var(--ad-fg-muted)' }}>{p.category_name ?? '—'}</td>
                    <td className="is-right">
                      {p.base_price !== null
                        ? <span className="ad-display" style={{ fontSize: '16px', fontWeight: 500 }}>{formatPrice(p.base_price)}</span>
                        : p.variants_count > 0
                          ? <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>varyantta</span>
                          : <span style={{ color: 'var(--ad-fg-faint)' }}>—</span>
                      }
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)' }}>
                      %{p.tax_rate ?? 0}
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: isOut ? 'var(--ad-danger)' : isLow ? 'var(--ad-warning)' : 'var(--ad-fg)' }}>
                      {p.variants_count > 0
                        ? <span style={{ color: 'var(--ad-fg-faint)', fontSize: '10.5px', letterSpacing: '0.05em' }}>{p.variants_count} varyant</span>
                        : (p.stock_quantity ?? 0)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <Badge tone={p.is_active ? 'success' : 'neutral'}>
                          {p.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                        {p.is_featured && (
                          <Badge tone="gold"><IconStar size={10} /></Badge>
                        )}
                      </div>
                    </td>
                    <td className="is-right">
                      <Link href={`/admin/urunler/${p.id}`} className="ad-btn ad-btn-secondary ad-btn-sm">
                        Düzenle <IconArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
