// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/logout — müşteri çıkışı
// ─ Aynı zamanda admin'in de oturumunu sonlandırır (tek Supabase session)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { requireSupabaseServer } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await requireSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
