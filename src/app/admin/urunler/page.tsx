import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listProducts } from '@/lib/admin-data'
import { formatPrice } from '@/types'

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
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Katalog
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '32px', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
          Ürünler <span style={{ color: '#6E665A', fontSize: '20px' }}>({total})</span>
        </h1>
      </div>

      <form method="get" style={{ marginBottom: '20px', maxWidth: '420px' }}>
        <input
          type="search"
          name="q"
          defaultValue={search ?? ''}
          placeholder="Ürün ara (isim)…"
          style={{
            width: '100%',
            padding: '12px 14px',
            backgroundColor: 'rgba(244,240,232,0.04)',
            border: '1px solid rgba(244,240,232,0.12)',
            color: '#F4F0E8',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
      </form>

      {products.length === 0 ? (
        <p style={{ color: '#6E665A', fontSize: '14px', padding: '40px', textAlign: 'center', border: '1px dashed rgba(244,240,232,0.08)' }}>
          Ürün bulunamadı.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', backgroundColor: '#141210' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(244,240,232,0.1)' }}>
                <Th>Ürün</Th>
                <Th>Kategori</Th>
                <Th align="right">Fiyat</Th>
                <Th align="right">KDV</Th>
                <Th align="right">Stok</Th>
                <Th>Durum</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = (p.stock_quantity ?? 0) <= 5 && (p.stock_quantity ?? 0) > 0
                const isOut = (p.stock_quantity ?? 0) <= 0 && p.variants_count === 0
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(244,240,232,0.04)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ color: '#F4F0E8', fontSize: '14px', margin: 0 }}>{p.name}</p>
                      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#6E665A', margin: '2px 0 0' }}>{p.slug}</p>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#B8B0A0', fontSize: '13px' }}>
                      {p.category_name ?? '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#F4F0E8', fontFamily: 'var(--font-cormorant)', fontSize: '16px', fontWeight: 500 }}>
                      {p.base_price !== null ? formatPrice(p.base_price) : (p.variants_count > 0 ? <span style={{ fontSize: '11px', color: '#6E665A', fontFamily: 'var(--font-jetbrains)' }}>varyantta</span> : '—')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#B8B0A0', fontFamily: 'var(--font-jetbrains)', fontSize: '12px' }}>
                      %{p.tax_rate ?? 0}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-jetbrains)', fontSize: '13px',
                      color: isOut ? '#C8472D' : isLow ? '#D4715A' : '#F4F0E8' }}>
                      {p.variants_count > 0
                        ? <span style={{ color: '#6E665A', fontSize: '11px' }}>{p.variants_count} varyant</span>
                        : (p.stock_quantity ?? 0)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-jetbrains)',
                        fontSize: '9px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        backgroundColor: p.is_active ? 'rgba(92,122,63,0.15)' : 'rgba(244,240,232,0.06)',
                        color: p.is_active ? '#8AA868' : '#6E665A',
                      }}>
                        {p.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      {p.is_featured && (
                        <span style={{
                          display: 'inline-block',
                          marginLeft: '6px',
                          fontFamily: 'var(--font-jetbrains)',
                          fontSize: '9px',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          backgroundColor: 'rgba(201,169,97,0.12)',
                          color: '#C9A961',
                        }}>
                          ★
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Link href={`/admin/urunler/${p.id}`}
                        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.18em', color: '#C9A961', textTransform: 'uppercase', textDecoration: 'none' }}>
                        Düzenle →
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

function Th({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      padding: '14px 16px',
      textAlign: align ?? 'left',
      fontFamily: 'var(--font-jetbrains)',
      fontSize: '9px',
      letterSpacing: '0.22em',
      color: '#6E665A',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>
      {children}
    </th>
  )
}
