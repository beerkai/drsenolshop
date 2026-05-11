// ═══════════════════════════════════════════════════════════════
// Sipariş işlemleri — sadece SUNUCU TARAFI
// ─ getSupabaseAdmin() ile RLS bypass ederek INSERT/UPDATE yapar
// ─ Bu modülü 'use client' dosyadan import etme
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'
import type { Order, OrderItem } from '@/types'
import type { CheckoutLine } from './cart-totals'
import { calculateTotals } from './cart-totals'
import { getProductsByIds } from './products'
import {
  findDefaultVariant,
  getVariantPrice,
  getVariantStock,
  getProductImage,
  getVariantLabel,
} from '@/types'

export interface ShippingAddress {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  district: string
  postal_code: string
  country: string
}

export interface ClientCartItem {
  productId: string
  variantId: string | null
  quantity: number
}

export interface CreateOrderInput {
  customer_email: string
  customer_phone?: string
  customer_name: string
  shipping_address: ShippingAddress
  billing_address?: ShippingAddress
  payment_method?: 'bank_transfer' | 'iyzico' | 'stripe' | 'cash_on_delivery'
  notes?: string
  items: ClientCartItem[]
}

export type CreateOrderResult =
  | { ok: true; order: Order; items: OrderItem[] }
  | {
      ok: false
      code: 'INVALID_INPUT' | 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND' | 'DB_ERROR' | 'NO_CONFIG'
      message: string
      details?: unknown
    }

// ─── Cart items doğrulama + enrichment ──────────────────────────
// Client'tan gelen productId/variantId/quantity → DB'den taze fiyat,
// stok ve tax_rate ile zenginleştirilir.
export async function validateCartItems(
  items: ClientCartItem[]
): Promise<
  | { ok: true; lines: CheckoutLine[] }
  | { ok: false; code: 'PRODUCT_NOT_FOUND' | 'OUT_OF_STOCK'; message: string }
> {
  if (items.length === 0) {
    return { ok: false, code: 'PRODUCT_NOT_FOUND', message: 'Sepet boş' }
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)))
  const products = await getProductsByIds(productIds)
  const productMap = new Map(products.map((p) => [p.id, p]))

  const lines: CheckoutLine[] = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || product.is_active === false) {
      return {
        ok: false,
        code: 'PRODUCT_NOT_FOUND',
        message: `Ürün bulunamadı veya satıştan kaldırıldı: ${item.productId}`,
      }
    }

    const variants = product.variants ?? []
    const variant = item.variantId
      ? variants.find((v) => v.id === item.variantId)
      : findDefaultVariant(variants)

    // Varyant yoksa product düzeyinde fiyat — base_price kullanılır
    let unitPrice: number
    let stock: number
    let variantLabel: string | null = null

    if (variant) {
      const pd = getVariantPrice(variant)
      unitPrice = pd.current
      stock = getVariantStock(variant)
      variantLabel = getVariantLabel(variant)
    } else {
      unitPrice = product.base_price ?? 0
      stock = product.stock_quantity ?? 0
    }

    if (stock < item.quantity) {
      return {
        ok: false,
        code: 'OUT_OF_STOCK',
        message: `Yetersiz stok: ${product.name}${variantLabel ? ' / ' + variantLabel : ''} (mevcut: ${stock}, istenen: ${item.quantity})`,
      }
    }

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      slug: product.slug,
      image: getProductImage(product),
      variantLabel,
      unitPrice,
      taxRate: Number(product.tax_rate ?? 0),
      quantity: item.quantity,
    })
  }

  return { ok: true, lines }
}

// ─── Sipariş oluştur ────────────────────────────────────────────
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: 'NO_CONFIG', message: 'Supabase yapılandırılmamış' }
  }

  // 1) Input doğrulama (temel)
  const errors: string[] = []
  if (!input.customer_email?.trim() || !input.customer_email.includes('@')) errors.push('Geçerli e-mail gerekli')
  if (!input.customer_name?.trim()) errors.push('Ad/Soyad gerekli')
  if (!input.shipping_address) errors.push('Teslimat adresi gerekli')
  else {
    const a = input.shipping_address
    if (!a.full_name?.trim()) errors.push('Adres: ad/soyad gerekli')
    if (!a.phone?.trim()) errors.push('Adres: telefon gerekli')
    if (!a.address_line1?.trim()) errors.push('Adres: sokak/cadde gerekli')
    if (!a.city?.trim()) errors.push('Adres: şehir gerekli')
    if (!a.district?.trim()) errors.push('Adres: ilçe gerekli')
  }
  if (!input.items || input.items.length === 0) errors.push('Sepet boş')
  if (errors.length > 0) {
    return { ok: false, code: 'INVALID_INPUT', message: errors.join('; ') }
  }

  // 2) Cart doğrula
  const validated = await validateCartItems(input.items)
  if (!validated.ok) {
    return { ok: false, code: validated.code, message: validated.message }
  }

  // 3) Totals hesapla (kargo şimdilik 0)
  const totals = calculateTotals(validated.lines, { shippingCost: 0 })

  // 4) DB insert — orders + order_items
  const supabase = getSupabaseAdmin()

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      // order_number trigger ile otomatik
      status: 'pending',
      customer_email: input.customer_email.trim(),
      customer_phone: input.customer_phone?.trim() || null,
      customer_name: input.customer_name.trim(),
      shipping_address: input.shipping_address,
      billing_address: input.billing_address ?? null,
      shipping_method: 'standard',
      shipping_cost: totals.shippingCost,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountAmount,
      total_amount: totals.total,
      payment_method: input.payment_method ?? 'bank_transfer',
      payment_status: 'pending',
      notes: input.notes?.trim() || null,
    })
    .select()
    .single()

  if (orderErr || !orderRow) {
    return {
      ok: false,
      code: 'DB_ERROR',
      message: 'Sipariş oluşturulamadı',
      details: orderErr?.message,
    }
  }

  // 5) order_items insert (snapshot)
  const itemsToInsert = validated.lines.map((line) => {
    const lineSubtotal = Math.round(line.unitPrice * line.quantity * 100) / 100
    return {
      order_id: orderRow.id,
      product_id: line.productId,
      variant_id: line.variantId,
      product_name: line.name,
      variant_label: line.variantLabel,
      product_slug: line.slug,
      product_image: line.image,
      unit_price: line.unitPrice,
      tax_rate: line.taxRate,
      quantity: line.quantity,
      subtotal: lineSubtotal,
    }
  })

  const { data: itemRows, error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemsToInsert)
    .select()

  if (itemsErr) {
    // Order silinmiyor; admin paneli bunu görür ve manuel düzelt.
    return {
      ok: false,
      code: 'DB_ERROR',
      message: 'Sipariş kalemleri eklenirken hata',
      details: itemsErr.message,
    }
  }

  // 6) Stok düşür (atomic RPC)
  // Not: Şimdilik 'pending' siparişlerde stok bekletmiyoruz; ödeme alınıp
  // 'paid' olunca admin elle düşürür veya bir trigger handle eder.
  // (MVP: havale ödemesi için bu yaklaşım yeterli; iyzico/3DS sonrası
  //  callback'te stok düşürülür.)

  return {
    ok: true,
    order: orderRow as Order,
    items: (itemRows ?? []) as OrderItem[],
  }
}

// ─── Sipariş okuma (public — order_number knowledge gating) ─────
export async function getOrderByNumber(orderNumber: string): Promise<
  | { order: Order; items: OrderItem[] }
  | null
> {
  if (!isSupabaseConfigured()) return null

  const supabase = getSupabaseAdmin()
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (orderErr || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  return { order: order as Order, items: (items ?? []) as OrderItem[] }
}
