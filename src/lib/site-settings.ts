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

// ─── Kargo Yapılandırması ────────────────────────────────────────
export interface ShippingConfig {
  flat_fee: number          // Sabit kargo ücreti (TL, KDV dahil)
  free_threshold: number    // Bu tutar ve üzeri sipariş → ücretsiz (TL, 0 = devre dışı)
  courier_name: string      // Anlaşmalı kargo şirketi (info amaçlı)
}

const DEFAULT_SHIPPING: ShippingConfig = {
  flat_fee: 0,
  free_threshold: 0,
  courier_name: '',
}

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

// ─── Kargo ───────────────────────────────────────────────────────

function toFiniteNumber(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? n : fallback
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const v = await getSiteSetting<Partial<ShippingConfig>>('shipping_config')
  return {
    flat_fee: Math.max(0, toFiniteNumber(v?.flat_fee, DEFAULT_SHIPPING.flat_fee)),
    free_threshold: Math.max(0, toFiniteNumber(v?.free_threshold, DEFAULT_SHIPPING.free_threshold)),
    courier_name: (v?.courier_name ?? DEFAULT_SHIPPING.courier_name).toString().trim(),
  }
}

export async function setShippingConfig(input: ShippingConfig): Promise<boolean> {
  return setSiteSetting('shipping_config', {
    flat_fee: Math.max(0, toFiniteNumber(input.flat_fee)),
    free_threshold: Math.max(0, toFiniteNumber(input.free_threshold)),
    courier_name: input.courier_name.trim(),
  })
}

/**
 * Subtotal'a göre kargo ücretini hesaplar.
 * - free_threshold > 0 ve subtotal >= eşik → 0
 * - aksi halde flat_fee
 */
export function calculateShipping(subtotal: number, config: ShippingConfig): number {
  if (config.flat_fee <= 0) return 0
  if (config.free_threshold > 0 && subtotal >= config.free_threshold) return 0
  return config.flat_fee
}
