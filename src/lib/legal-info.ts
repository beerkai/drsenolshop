// ═══════════════════════════════════════════════════════════════
// Tüzel kişi & iletişim bilgileri — yasal sayfalar için tek kaynak
// ─ Env'den okunur (NEXT_PUBLIC_* prefix ile build-time inline)
// ─ Eksik resmi kimlik alanları boş döner; sayfalar bunları basmaz
// ─ Üretimde Vercel env: NEXT_PUBLIC_LEGAL_NAME, TAX_*, MERSIS, PHONE
// ═══════════════════════════════════════════════════════════════

export interface LegalCompanyInfo {
  legal_name: string         // Resmi ticari unvan
  trade_name: string         // Marka adı (Dr. Şenol Shop)
  tax_office: string         // Vergi dairesi
  tax_number: string         // VKN / TCKN
  mersis: string             // MERSIS no
  address: string            // Tam adres
  city_country: string       // İl / Ülke
  email: string
  phone: string
  kep: string                // KEP adresi (varsa)
  website: string
}

function val(envKey: string, fallback = ''): string {
  return (process.env[envKey] || '').trim() || fallback
}

export function getLegalCompany(): LegalCompanyInfo {
  return {
    legal_name: val('NEXT_PUBLIC_LEGAL_NAME', 'Dr. Şenol'),
    trade_name: val('NEXT_PUBLIC_BRAND_NAME', 'Dr. Şenol Shop'),
    tax_office: val('NEXT_PUBLIC_TAX_OFFICE'),
    tax_number: val('NEXT_PUBLIC_TAX_NUMBER'),
    mersis: val('NEXT_PUBLIC_MERSIS_NO'),
    address: val('NEXT_PUBLIC_COMPANY_ADDRESS', 'Saitabat Köyü, Kestel / Bursa'),
    city_country: val('NEXT_PUBLIC_COMPANY_CITY', 'Bursa, Türkiye'),
    email: val('NEXT_PUBLIC_CONTACT_EMAIL', 'hello@drsenol.shop'),
    phone: val('NEXT_PUBLIC_CONTACT_PHONE'),
    kep: val('NEXT_PUBLIC_KEP_ADDRESS'),
    website: val('NEXT_PUBLIC_SITE_URL', 'https://drsenol.shop'),
  }
}

/** WhatsApp / tel: linkleri için yalnızca rakam */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Yasal sayfa son güncelleme tarihi — değiştiğinde elle güncelle.
export const LEGAL_LAST_UPDATED = '20 Eylül 2026'

/**
 * Resmi unvan veya vergi kimliği env'de yoksa true.
 * Admin / iç kontrol için; vitrin sayfalarında uyarı basılmaz.
 */
export function isLegalInfoIncomplete(): boolean {
  return !val('NEXT_PUBLIC_LEGAL_NAME') || !val('NEXT_PUBLIC_TAX_NUMBER')
}
