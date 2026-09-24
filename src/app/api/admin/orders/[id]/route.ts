// ═══════════════════════════════════════════════════════════════
// PATCH /api/admin/orders/[id] — sipariş alanları güncelleme
// Ortak mantık: src/lib/order-updates.ts (Telegram da kullanır)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { applyOrderPatch, type OrderPatch } from '@/lib/order-updates'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params

  let body: OrderPatch
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const result = await applyOrderPatch(id, body)
  if (!result.ok) {
    const status = result.message === 'Güncellenecek alan yok.' || result.message.startsWith('Geçersiz') ? 400 : 500
    return NextResponse.json({ ok: false, message: result.message }, { status })
  }

  return NextResponse.json({ ok: true, order: result.order })
}
