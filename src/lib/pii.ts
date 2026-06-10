// ═══════════════════════════════════════════════════════════════
// PII maskeleme yardımcıları
// ─ /siparis/[order_number] gibi sipariş no ile erişilen sayfalarda
//   sahip olmayan ziyaretçiye kişisel veriyi maskeli göster.
// ─ Server-safe (window/document referansı yok).
// ═══════════════════════════════════════════════════════════════

/** "ahmet@example.com" → "ah***@e******.com" */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  const trimmed = email.trim()
  const at = trimmed.indexOf('@')
  if (at < 1) return '***'

  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const dot = domain.lastIndexOf('.')

  // Local kısmı: ilk 2 karakter + ***
  const localMasked = local.length <= 2
    ? local.charAt(0) + '*'.repeat(Math.max(1, local.length))
    : local.slice(0, 2) + '*'.repeat(Math.max(3, local.length - 2))

  // Domain: ilk harf + *** + TLD
  if (dot < 1) {
    return `${localMasked}@${domain.charAt(0)}***`
  }
  const domainName = domain.slice(0, dot)
  const tld = domain.slice(dot)
  const domainMasked = domainName.length <= 1
    ? domainName + '***'
    : domainName.charAt(0) + '*'.repeat(Math.max(3, domainName.length - 1))
  return `${localMasked}@${domainMasked}${tld}`
}

/** "05321234567" → "0532 *** ** 67" — son 2 hane görünür */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '***'

  const last2 = digits.slice(-2)
  const head = digits.slice(0, Math.min(4, digits.length - 2))
  const middleCount = Math.max(0, digits.length - head.length - 2)
  const middle = '*'.repeat(middleCount).replace(/(.{3})/g, '$1 ').trim()
  return `${head} ${middle} ${last2}`.replace(/\s+/g, ' ').trim()
}

/** "Ahmet Yılmaz" → "Ahmet Y." */
export function maskFullName(name: string | null | undefined): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  const first = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0)
  return `${first} ${lastInitial}.`
}

/** Adres satırı: "Atatürk Cad. No:42 D:5" → "Atatürk Cad. ***" */
export function maskAddressLine(line: string | null | undefined): string {
  if (!line) return ''
  const trimmed = line.trim()
  if (trimmed.length <= 14) return '***'
  return trimmed.slice(0, 14) + ' ***'
}
