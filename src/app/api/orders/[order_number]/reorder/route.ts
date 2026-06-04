// ═══════════════════════════════════════════════════════════════
// POST /api/orders/[order_number]/reorder
// ─ Logged-in müşterinin kendi siparişinin kalemlerini "yeniden sipariş ver"
//   verisi olarak döner (cart payload). Client bunu cart-context'e ekler.
// ─ Stokta olmayan / pasif ürünleri filtreler, kullanıcıyı uyarır.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getProductsByIds } from '@/lib/products'
import {
  findDefaultVariant,
  getVariantPrice,
  getVariantStock,
  getVariantLabel,
  getProductImage,
  type Order,
  type OrderItem,
} from '@/types'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ order_number: string }> }
) {
  const me = await getCurrentCustomer()
  if (!me) return NextResponse.json({ ok: false, message: 'Giriş yapın.' }, { status: 401 })

  const { order_number } = await params
  const supabase = getSupabaseAdmin()

  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', order_number)
    .maybeSingle()
  if (!orderRow) return NextResponse.json({ ok: false, message: 'Sipariş bulunamadı.' }, { status: 404 })

  const order = orderRow as Order
  // Yetki: email VEYA user_id eşleşmeli
  if (order.customer_email.toLowerCase() !== me.email.toLowerCase() && order.user_id !== me.user.id) {
    return NextResponse.json({ ok: false, message: 'Bu sipariş size ait değil.' }, { status: 403 })
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
  const orderItems = (items ?? []) as OrderItem[]
  if (orderItems.length === 0) {
    return NextResponse.json({ ok: false, message: 'Sipariş kalemi yok.' }, { status: 400 })
  }

  const productIds = Array.from(new Set(orderItems.map((i) => i.product_id).filter(Boolean) as string[]))
  const products = await getProductsByIds(productIds)
  const productMap = new Map(products.map((p) => [p.id, p]))

  const cartLines: Array<{
    productId: string
    variantId: string | null
    name: string
    slug: string
    image: string | null
    price: number
    variantLabel: string | null
    quantity: number
  }> = []
  const skipped: Array<{ name: string; reason: string }> = []

  for (const it of orderItems) {
    if (!it.product_id) {
      skipped.push({ name: it.product_name, reason: 'Ürün bilgisi yok' })
      continue
    }
    const product = productMap.get(it.product_id)
    if (!product || product.is_active === false) {
      skipped.push({ name: it.product_name, reason: 'Artık satışta değil' })
      continue
    }

    const variant = it.variant_id
      ? (product.variants ?? []).find((v) => v.id === it.variant_id)
      : findDefaultVariant(product.variants ?? [])

    let price: number
    let stock: number
    let label: string | null = null

    if (variant) {
      const p = getVariantPrice(variant)
      price = p?.current ?? 0
      stock = getVariantStock(variant)
      label = getVariantLabel(variant)
    } else {
      price = product.base_price ?? 0
      stock = product.stock_quantity ?? 0
    }

    if (stock <= 0) {
      skipped.push({ name: it.product_name, reason: 'Stokta yok' })
      continue
    }

    const quantity = Math.min(it.quantity, stock)
    cartLines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      slug: product.slug,
      image: getProductImage(product),
      price,
      variantLabel: label,
      quantity,
    })
  }

  return NextResponse.json({ ok: true, items: cartLines, skipped })
}
