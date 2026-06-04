// ═══════════════════════════════════════════════════════════════
// POST /api/admin/coupons — yeni kupon oluştur
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface CreateBody {
  code?: string
  description?: string | null
  discount_type?: 'percent' | 'fixed'
  discount_value?: number
  min_subtotal?: number
  max_uses?: number
  valid_from?: string | null
  valid_until?: string | null
  is_active?: boolean
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: CreateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const code = body.code?.trim().toUpperCase()
  if (!code) return NextResponse.json({ ok: false, message: 'Kod gerekli.' }, { status: 400 })
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
    return NextResponse.json({ ok: false, message: 'Kod 3-40 karakter, harf/rakam/_/- içerebilir.' }, { status: 400 })
  }
  if (body.discount_type !== 'percent' && body.discount_type !== 'fixed') {
    return NextResponse.json({ ok: false, message: 'discount_type "percent" veya "fixed" olmalı.' }, { status: 400 })
  }
  const value = Number(body.discount_value ?? 0)
  if (!Number.isFinite(value) || value < 0) {
    return NextResponse.json({ ok: false, message: 'Geçersiz indirim değeri.' }, { status: 400 })
  }
  if (body.discount_type === 'percent' && value > 100) {
    return NextResponse.json({ ok: false, message: 'Yüzde indirim 100\'ü geçemez.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code,
      description: body.description?.trim() || null,
      discount_type: body.discount_type,
      discount_value: value,
      min_subtotal: Math.max(0, Number(body.min_subtotal ?? 0)),
      max_uses: Math.max(0, Math.floor(Number(body.max_uses ?? 0))),
      valid_from: body.valid_from || null,
      valid_until: body.valid_until || null,
      is_active: body.is_active !== false,
    })
    .select()
    .single()

  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return NextResponse.json({ ok: false, message: 'Bu kod zaten kullanımda.' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, coupon: data })
}
