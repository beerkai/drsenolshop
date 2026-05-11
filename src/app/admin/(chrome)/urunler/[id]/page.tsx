import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getProductDetailById } from '@/lib/admin-data'
import { IconExternal } from '@/components/admin/ui/Icon'
import ProductEditForm from './ProductEditForm'

type Props = { params: Promise<{ id: string }> }

export default async function AdminProductEditPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const product = await getProductDetailById(id)
  if (!product) notFound()

  return (
    <div>
      <Link
        href="/admin/urunler"
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: 'var(--ad-fg-muted)',
          textTransform: 'uppercase',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '20px',
        }}
      >
        ← Ürünler
      </Link>

      <div style={{ marginBottom: '28px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '10px' }}>
          {product.category?.name ?? 'Ürün'}
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, color: 'var(--ad-fg)', lineHeight: 1.1, margin: '0 0 8px' }}
        >
          {product.name}
        </h1>
        <Link
          href={`/urun/${product.slug}`}
          target="_blank"
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            color: 'var(--ad-gold-deep)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          Siteyi görüntüle <IconExternal size={10} />
        </Link>
      </div>

      <ProductEditForm product={product} />
    </div>
  )
}
