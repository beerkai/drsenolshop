import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { getProductDetailById } from '@/lib/admin-data'
import ProductEditForm from './ProductEditForm'

type Props = { params: Promise<{ id: string }> }

export default async function AdminProductEditPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const product = await getProductDetailById(id)
  if (!product) notFound()

  return (
    <div>
      <Link href="/admin/urunler"
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
        ← Ürünler
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 10px' }}>
          {product.category?.name ?? 'Ürün'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '28px', fontWeight: 500, lineHeight: 1.1, margin: '0 0 6px' }}>
          {product.name}
        </h1>
        <Link href={`/urun/${product.slug}`} target="_blank"
          style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#C9A961', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Siteyi görüntüle ↗
        </Link>
      </div>

      <ProductEditForm product={product} />
    </div>
  )
}
