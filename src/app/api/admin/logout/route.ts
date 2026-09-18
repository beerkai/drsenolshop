import { NextResponse } from 'next/server'
import { requireSupabaseServer } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await requireSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
