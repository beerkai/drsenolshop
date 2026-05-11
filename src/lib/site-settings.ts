// ═══════════════════════════════════════════════════════════════
// Site-geneli ayarlar (key/value JSONB)
// ─ Sunucu okuma için isSupabaseConfigured + getSupabase / Admin
// ═══════════════════════════════════════════════════════════════

import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from './supabase'

export interface BankInfo {
  bank_name: string
  account_holder: string
  iban: string
}

const EMPTY_BANK: BankInfo = { bank_name: '', account_holder: '', iban: '' }

/** Public read (anon SELECT açık) */
export async function getSiteSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured()) return null
  const { data } = await getSupabase()
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return (data?.value as T) ?? null
}

/** Admin upsert */
export async function setSiteSetting(key: string, value: Record<string, unknown>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
  return !error
}

export async function getBankInfo(): Promise<BankInfo> {
  const v = await getSiteSetting<Partial<BankInfo>>('bank_info')
  return {
    bank_name: v?.bank_name ?? EMPTY_BANK.bank_name,
    account_holder: v?.account_holder ?? EMPTY_BANK.account_holder,
    iban: v?.iban ?? EMPTY_BANK.iban,
  }
}

export async function setBankInfo(input: BankInfo): Promise<boolean> {
  return setSiteSetting('bank_info', {
    bank_name: input.bank_name.trim(),
    account_holder: input.account_holder.trim(),
    iban: input.iban.replace(/\s+/g, '').toUpperCase(),
  })
}
