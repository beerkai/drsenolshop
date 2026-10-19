import { NextResponse } from 'next/server'
import { requireSupabaseServer } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await requireSupabaseServer()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('[admin/logout]', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, message: 'Oturum kapatılamadı.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
