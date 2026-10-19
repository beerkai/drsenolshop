// Şema kontrolü. Eksik kolon varsa 0016/0017 SQL'ini bir kez dener.
// Müşteri verisi dönmez.

import { NextResponse } from 'next/server'
import { applyOrderSchema } from '../../../../../scripts/apply-order-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const report = await applyOrderSchema()
  return NextResponse.json(report)
}
