import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listAllStockRows } from '@/lib/admin-data'
import { Badge } from '@/components/admin/ui/Badge'
import { IconArrowRight } from '@/components/admin/ui/Icon'

type SP = Promise<{ filter?: 'critical' | 'low' | 'out' | 'all' }>

export default async function AdminStockPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const filter = sp.filter ?? 'low'

  const all = await listAllStockRows()
  const activeOnly = all.filter((r) => r.is_active)

  const filtered = (() => {
    if (filter === 'out')      return activeOnly.filter((r) => r.stock === 0)
    if (filter === 'critical') return activeOnly.filter((r) => r.stock > 0 && r.stock <= 2)
    if (filter === 'low')      return activeOnly.filter((r) => r.stock <= 5)
    return activeOnly
  })()

  const counts = {
    out:      activeOnly.filter((r) => r.stock === 0).length,
    critical: activeOnly.filter((r) => r.stock > 0 && r.stock <= 2).length,
    low:      activeOnly.filter((r) => r.stock <= 5).length,
    all:      activeOnly.length,
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Operasyon</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Stok Takibi
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Sadece aktif varyantlar gösteriliyor. Toplu güncelleme bir sonraki iterasyonda.
        </p>
      </div>

      {/* Filtre çubuğu */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        <FilterChip href="/admin/stok?filter=out"      active={filter === 'out'}      label="Tükendi"  count={counts.out} />
        <FilterChip href="/admin/stok?filter=critical" active={filter === 'critical'} label="Kritik (≤2)" count={counts.critical} />
        <FilterChip href="/admin/stok?filter=low"      active={filter === 'low'}      label="Düşük (≤5)" count={counts.low} />
        <FilterChip href="/admin/stok?filter=all"      active={filter === 'all'}      label="Tümü"     count={counts.all} />
      </div>

      {filtered.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-title">Bu filtreye uyan varyant yok.</p>
          {filter !== 'all' && (
            <p className="ad-empty-hint">
              Stok seviyeleri{' '}
              <strong style={{ color: 'var(--ad-success)' }}>sağlıklı</strong>.
            </p>
          )}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table ad-table-mobile">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Varyant</th>
                <th className="is-right">Stok</th>
                <th className="is-right">Durum</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const tone = r.stock === 0 ? 'danger' : r.stock <= 2 ? 'warning' : 'gold'
                const label = r.stock === 0 ? 'Tükendi' : r.stock <= 2 ? 'Kritik' : 'Düşük'
                return (
                  <tr key={r.variant_id}>
                    <td className="is-row-head">
                      <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: 0, fontWeight: 500 }}>{r.product_name}</p>
                      <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', margin: '2px 0 0', letterSpacing: '0.05em' }}>
                        {r.product_slug}
                      </p>
                    </td>
                    <td data-label="Varyant" style={{ color: 'var(--ad-fg-muted)', fontSize: '13px' }}>
                      {r.variant_label ?? '—'}
                    </td>
                    <td className="is-right" data-label="Stok">
                      <span
                        className="ad-display"
                        style={{
                          fontSize: '20px',
                          fontWeight: 500,
                          color: r.stock === 0 ? 'var(--ad-danger)' : r.stock <= 2 ? 'var(--ad-warning)' : 'var(--ad-fg)',
                        }}
                      >
                        {r.stock}
                      </span>
                    </td>
                    <td className="is-right" data-label="Durum">
                      <Badge tone={tone} bracketed>{label}</Badge>
                    </td>
                    <td className="is-right" data-label="">
                      <Link href={`/admin/urunler/${r.product_id}`} className="ad-btn ad-btn-secondary ad-btn-sm">
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

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link href={href} className={['ad-btn', 'ad-btn-sm', active ? 'ad-btn-primary' : 'ad-btn-secondary'].join(' ')}>
      <span>{label}</span>
      <span style={{ opacity: active ? 0.85 : 0.6, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </Link>
  )
}
