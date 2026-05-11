// ═══════════════════════════════════════════════════════════════
// Günlük not + custom metric DB helper'ları
// ─ Sunucu-only. getSupabaseAdmin ile RLS bypass.
// ─ Sayfa adı: /admin/gunluk
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export interface DailyLog {
  id: string
  log_date: string        // YYYY-MM-DD
  author_email: string
  notes: string | null
  metrics: Record<string, string>
  created_at: string
  updated_at: string | null
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Belli bir gün için log getir; yoksa null. */
export async function getDailyLog(authorEmail: string, dateKey?: string): Promise<DailyLog | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const date = dateKey ?? todayKey()

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('author_email', authorEmail)
    .eq('log_date', date)
    .maybeSingle()

  if (error) {
    console.error('[getDailyLog]', error.message)
    return null
  }
  if (!data) return null
  return normalize(data)
}

/** Bugünün log'unu upsert et (yoksa ekle, varsa güncelle). */
export async function upsertDailyLog(
  authorEmail: string,
  input: { notes?: string | null; metrics?: Record<string, string>; dateKey?: string }
): Promise<DailyLog | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const date = input.dateKey ?? todayKey()

  const row = {
    author_email: authorEmail,
    log_date: date,
    notes: input.notes ?? null,
    metrics: input.metrics ?? {},
  }

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(row, { onConflict: 'author_email,log_date' })
    .select()
    .single()

  if (error || !data) {
    console.error('[upsertDailyLog]', error?.message)
    return null
  }
  return normalize(data)
}

/** Son N günün loglarını getir (en yeni önce). */
export async function listRecentDailyLogs(authorEmail: string, limit = 14): Promise<DailyLog[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('author_email', authorEmail)
    .order('log_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[listRecentDailyLogs]', error.message)
    return []
  }
  return (data ?? []).map(normalize)
}

function normalize(row: unknown): DailyLog {
  const r = row as Record<string, unknown>
  return {
    id: String(r.id),
    log_date: String(r.log_date),
    author_email: String(r.author_email),
    notes: r.notes != null ? String(r.notes) : null,
    metrics: (r.metrics as Record<string, string>) ?? {},
    created_at: String(r.created_at),
    updated_at: r.updated_at != null ? String(r.updated_at) : null,
  }
}
