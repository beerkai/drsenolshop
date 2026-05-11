// ═══════════════════════════════════════════════════════════════
// /api/admin/employees — çalışan listele + yeni ekle
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { createEmployee, listEmployees } from '@/lib/ledger'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const employees = await listEmployees({ activeOnly: true })
  return NextResponse.json({ ok: true, employees })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: { name?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ ok: false, message: 'İsim gerekli.' }, { status: 400 })
  }

  const employee = await createEmployee(name, body.role ?? 'satış')
  if (!employee) {
    return NextResponse.json({ ok: false, message: 'Çalışan eklenemedi.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, employee })
}
