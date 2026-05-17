// ═══════════════════════════════════════════════════════════════
// Tüzel kişi & iletişim bilgileri — yasal sayfalar için tek kaynak
// ─ Env'den okunur (NEXT_PUBLIC_* prefix ile build-time inline)
// ─ Yoksa development placeholder döner; yasal metinde "[doldurulacak]"
//   olarak görünür
// ─ Üretime alırken bu env'leri Vercel'de set et
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

function val(envKey: string, fallback: string): string {
  return (process.env[envKey] || '').trim() || fallback
}

export function getLegalCompany(): LegalCompanyInfo {
  return {
    legal_name: val('NEXT_PUBLIC_LEGAL_NAME', '[Şirket ticari unvanı doldurulacak]'),
    trade_name: val('NEXT_PUBLIC_BRAND_NAME', 'Dr. Şenol Shop'),
    tax_office: val('NEXT_PUBLIC_TAX_OFFICE', '[Vergi dairesi]'),
    tax_number: val('NEXT_PUBLIC_TAX_NUMBER', '[VKN]'),
    mersis: val('NEXT_PUBLIC_MERSIS_NO', '[MERSIS no]'),
    address: val('NEXT_PUBLIC_COMPANY_ADDRESS', 'Saitabat Köyü, Kestel / Bursa'),
    city_country: val('NEXT_PUBLIC_COMPANY_CITY', 'Bursa, Türkiye'),
    email: val('NEXT_PUBLIC_CONTACT_EMAIL', 'bilgi@drsenol.shop'),
    phone: val('NEXT_PUBLIC_CONTACT_PHONE', '+90 224 123 45 67'),
    kep: val('NEXT_PUBLIC_KEP_ADDRESS', '[KEP adresi — varsa]'),
    website: val('NEXT_PUBLIC_SITE_URL', 'https://drsenol.shop'),
  }
}

// Yasal sayfa son güncelleme tarihi — değiştiğinde elle güncelle.
export const LEGAL_LAST_UPDATED = '17 Mayıs 2026'
