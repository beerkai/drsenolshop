// ═══════════════════════════════════════════════════════════════
// Telegram oturum, update tekilliği, yazma yetkisi
// ─ Sohbet yetkisi okuma içindir
// ─ Yazma (defter, ödeme onayı, kargo, yorum) kullanıcı kimliği ister
// ═══════════════════════════════════════════════════════════════

import { getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export type SessionKind = 'sale' | 'ship'

export interface TelegramSession<T = Record<string, unknown>> {
  chat_id: string
  user_id: string
  kind: SessionKind
  payload: T
  expires_at: string
}

function writerIds(): Set<string> {
  const ids = new Set<string>()
  const raw = process.env.TELEGRAM_WRITER_IDS?.trim()
  if (!raw) return ids
  raw.split(',').forEach((s) => {
    const v = s.trim()
    if (v) ids.add(v)
  })
  return ids
}

export function authorizedChatIds(): Set<string> {
  const ids = new Set<string>()
  const primary = process.env.TELEGRAM_CHAT_ID?.trim()
  if (primary) ids.add(primary)
  const extra = process.env.TELEGRAM_ADMIN_IDS?.trim()
  if (extra) {
    extra.split(',').forEach((s) => {
      const v = s.trim()
      if (v) ids.add(v)
    })
  }
  return ids
}

export function isAuthorizedChat(chatId: number | string): boolean {
  return authorizedChatIds().has(String(chatId))
}

/**
 * Yazma yetkisi.
 * TELEGRAM_WRITER_IDS doluysa yalnızca o kullanıcılar.
 * Boşsa yalnızca yetkili özel sohbet (grupta herkes satış yazamasın).
 */
export function canWrite(input: { chatId: number | string; chatType?: string; userId?: number | string | null }): boolean {
  if (!isAuthorizedChat(input.chatId)) return false
  const userId = input.userId == null ? '' : String(input.userId)
  const writers = writerIds()
  if (writers.size > 0) return writers.has(userId)
  return (input.chatType ?? 'private') === 'private'
}

/** Aynı update ikinci kez işlenmesin. Tablo yoksa işleme devam (best-effort). */
export async function claimTelegramUpdate(updateId: number): Promise<boolean> {
  if (!isSupabaseConfigured()) return true
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('telegram_processed_updates').insert({ update_id: updateId })
  if (!error) {
    if (updateId % 40 === 0) {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      await supabase.from('telegram_processed_updates').delete().lt('processed_at', cutoff)
    }
    return true
  }
  if (error.code === '23505') return false
  console.error('[telegram] update tekilliği yazılamadı:', error.message)
  return true
}

export async function getSession<T>(chatId: string, userId: string, kind: SessionKind): Promise<TelegramSession<T> | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('telegram_sessions')
    .select('chat_id, user_id, kind, payload, expires_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .eq('kind', kind)
    .maybeSingle()
  if (error || !data) return null
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await clearSession(chatId, userId, kind)
    return null
  }
  return data as TelegramSession<T>
}

export async function getLatestSession(chatId: string, userId: string): Promise<TelegramSession | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('telegram_sessions')
    .select('chat_id, user_id, kind, payload, expires_at, updated_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return data as TelegramSession
}

export async function setSession(chatId: string, userId: string, kind: SessionKind, payload: unknown, ttlMs: number): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  const expires_at = new Date(Date.now() + ttlMs).toISOString()
  const { error } = await supabase.from('telegram_sessions').upsert(
    {
      chat_id: chatId,
      user_id: userId,
      kind,
      payload,
      expires_at,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'chat_id,user_id,kind' }
  )
  if (error) {
    console.error('[telegram] oturum yazılamadı:', error.message)
    return false
  }
  return true
}

export async function clearSession(chatId: string, userId: string, kind: SessionKind): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabaseAdmin()
  await supabase.from('telegram_sessions').delete().eq('chat_id', chatId).eq('user_id', userId).eq('kind', kind)
}
