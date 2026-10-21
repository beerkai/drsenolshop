// ═══════════════════════════════════════════════════════════════
// Canlı ziyaretçi nabzı — sunucu tarafı
// Sayfası açık olan tarayıcı 25 sn'de bir rastgele kimlik bırakır.
// Aynı tarayıcıdaki sekmeler tek kişi sayılır. IP, çerez ve hesap
// bilgisi yazılmaz. 90 sn sessiz kalan düşer. Admin paneli sayılmaz.
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from '@/lib/supabase'

export const PULSE_WINDOW_MS = 90_000
export const PULSE_WINDOW_SEC = PULSE_WINDOW_MS / 1000
const STALE_MS = 10 * 60_000
const MAX_RECENT = 500

export interface PresencePage {
  label: string
  count: number
}

export interface PresenceSnapshot {
  ready: boolean
  count: number
  pages: PresencePage[]
  windowSec: number
}

const EMPTY: PresenceSnapshot = {
  ready: false,
  count: 0,
  pages: [],
  windowSec: PULSE_WINDOW_SEC,
}

let logged = false
function logOnce(message: string): void {
  if (logged) return
  logged = true
  console.error('[site-pulse] hata:', message)
}

function tableMissing(error: { code?: string; message?: string }): boolean {
  const message = error.message ?? ''
  return error.code === '42P01'
    || error.code === 'PGRST205'
    || /does not exist|schema cache|relation/i.test(message)
}

export function normalizePulsePath(input: string): string | null {
  if (typeof input !== 'string') return null
  const noQuery = input.trim().split('?')[0].split('#')[0]
  if (!noQuery.startsWith('/') || noQuery.startsWith('//')) return null
  if (noQuery.includes('..') || noQuery.includes('\\') || /\s/.test(noQuery)) return null
  const path = noQuery.slice(0, 80)
  if (path.startsWith('/admin') || path.startsWith('/api')) return null
  return path
}

export function isPulseSessionId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

/** /en önekini atar, bilinen sayfaları Türkçe gruplar */
export function presencePageLabel(path: string): string {
  const stripped = path.replace(/^\/en(?=\/|$)/, '') || '/'
  const rules: [string, string][] = [
    ['/urun', 'Ürün sayfası'],
    ['/kategori', 'Kategori'],
    ['/koleksiyon', 'Koleksiyon'],
    ['/goldylium', 'Goldylium'],
    ['/hikaye', 'Hikâyemiz'],
    ['/blog', 'Hasat günlüğü'],
    ['/odeme', 'Ödeme'],
    ['/sepet', 'Sepet'],
    ['/favoriler', 'Favoriler'],
    ['/hesabim', 'Hesabım'],
    ['/iletisim', 'İletişim'],
    ['/analizler', 'Analizler'],
    ['/saitabat-koyu', 'Saitabat'],
    ['/siparis-takibi', 'Sipariş takibi'],
  ]
  if (stripped === '/') return 'Ana sayfa'
  for (const [prefix, label] of rules) {
    if (stripped === prefix || stripped.startsWith(`${prefix}/`)) return label
  }
  return 'Diğer sayfalar'
}

function configured(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  )
}

/** Görünen sekme nabzı. Tablo yoksa veya kota doluysa sessizce çıkar. */
export async function touchPresence(sessionId: string, path: string): Promise<void> {
  if (!configured() || !isPulseSessionId(sessionId)) return
  const clean = normalizePulsePath(path)
  if (!clean) return

  try {
    const supabase = getSupabaseAdmin()
    const { data: existing, error: lookupError } = await supabase
      .from('site_presence')
      .select('session_id')
      .eq('session_id', sessionId)
      .maybeSingle()
    if (lookupError) {
      if (!tableMissing(lookupError)) logOnce(lookupError.message)
      return
    }

    if (!existing) {
      const since = new Date(Date.now() - PULSE_WINDOW_MS).toISOString()
      const { count, error: countError } = await supabase
        .from('site_presence')
        .select('session_id', { count: 'exact', head: true })
        .gte('last_seen', since)
      if (countError) {
        logOnce(countError.message)
        return
      }
      if ((count ?? 0) >= MAX_RECENT) return
    }

    const { error } = await supabase.from('site_presence').upsert(
      { session_id: sessionId, path: clean, last_seen: new Date().toISOString() },
      { onConflict: 'session_id' },
    )
    if (error) {
      if (!tableMissing(error)) logOnce(error.message)
      return
    }

    if (Math.random() < 0.05) {
      const stale = new Date(Date.now() - STALE_MS).toISOString()
      await supabase.from('site_presence').delete().lt('last_seen', stale)
    }
  } catch (err) {
    logOnce(err instanceof Error ? err.message : 'nabız yazılamadı')
  }
}

/** Son 90 saniyedeki açık sekmeler. Yönetim okuması. */
export async function readPresence(): Promise<PresenceSnapshot> {
  if (!configured()) return EMPTY

  try {
    const supabase = getSupabaseAdmin()
    const stale = new Date(Date.now() - STALE_MS).toISOString()
    const removed = await supabase.from('site_presence').delete().lt('last_seen', stale)
    if (removed.error && tableMissing(removed.error)) return EMPTY

    const since = new Date(Date.now() - PULSE_WINDOW_MS).toISOString()
    const { data, error } = await supabase
      .from('site_presence')
      .select('path')
      .gte('last_seen', since)
      .limit(MAX_RECENT)
    if (error) {
      if (!tableMissing(error)) logOnce(error.message)
      return EMPTY
    }

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const label = presencePageLabel(typeof row.path === 'string' ? row.path : '/')
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    const pages = [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      ready: true,
      count: data?.length ?? 0,
      pages,
      windowSec: PULSE_WINDOW_SEC,
    }
  } catch (err) {
    logOnce(err instanceof Error ? err.message : 'nabız okunamadı')
    return EMPTY
  }
}
