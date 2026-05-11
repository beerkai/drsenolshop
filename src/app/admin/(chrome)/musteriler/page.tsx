import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listCustomers } from '@/lib/admin-data'
import { formatPrice } from '@/types'

type SP = Promise<{ q?: string; page?: string }>

export default async function AdminCustomersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const search = sp.q?.trim() || undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 30
  const offset = (page - 1) * limit

  const { customers, total } = await listCustomers({ search, limit, offset })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>İlişkiler</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Müşteriler{' '}
          <span style={{ color: 'var(--ad-fg-faint)', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '0.55em', letterSpacing: '0.1em', marginLeft: '8px' }}>
            {total}
          </span>
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Sipariş veren e-posta adreslerinden türetilir. Müşteri tekilleştirme email bazında.
        </p>
      </div>

      <form method="get" style={{ marginBottom: '20px', maxWidth: '420px' }}>
        <input
          type="search"
          name="q"
          defaultValue={search ?? ''}
          placeholder="İsim veya e-posta ara…"
          className="ad-input"
        />
      </form>

      {customers.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-title">Müşteri bulunamadı.</p>
          {search ? <p className="ad-empty-hint">"{search}" araması için sonuç yok.</p> : <p className="ad-empty-hint">Henüz hiç sipariş gelmemiş.</p>}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>İletişim</th>
                <th className="is-right">Sipariş</th>
                <th className="is-right">Toplam Ciro</th>
                <th className="is-right">İlk Sipariş</th>
                <th className="is-right">Son Sipariş</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email}>
                  <td>
                    <Link
                      href={`/admin/siparisler?q=${encodeURIComponent(c.email)}`}
                      style={{ color: 'var(--ad-fg)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td>
                    <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: 0 }}>{c.email}</p>
                    {c.phone && (
                      <p className="ad-mono" style={{ color: 'var(--ad-fg-faint)', fontSize: '11px', margin: '2px 0 0' }}>
                        {c.phone}
                      </p>
                    )}
                  </td>
                  <td className="is-right ad-mono" style={{ fontSize: '13px' }}>
                    {c.total_orders}
                  </td>
                  <td className="is-right">
                    <span className="ad-display" style={{ fontSize: '16px', fontWeight: 500 }}>
                      {formatPrice(c.total_revenue)}
                    </span>
                  </td>
                  <td className="is-right ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                    {new Date(c.first_order_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="is-right ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                    {new Date(c.last_order_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
