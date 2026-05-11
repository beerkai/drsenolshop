// ═══════════════════════════════════════════════════════════════
// Türkiye saat dilimine sabitlenmiş tarih yardımcıları
// ─ Vercel sunucusu UTC çalışıyor; tarihi `Europe/Istanbul` ile
//   hesaplamazsak gece yarısına yakın saatlerde "bugün" dünü gösterir.
// ─ Hem sunucu hem client'tan aynı sonucu döndürür.
// ═══════════════════════════════════════════════════════════════

export const TR_TZ = 'Europe/Istanbul'

const DATE_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TR_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: TR_TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Türkiye'de bugün — YYYY-MM-DD */
export function todayKeyTR(): string {
  return DATE_FMT.format(new Date())
}

/** Türkiye saatiyle verilen Date'i YYYY-MM-DD'ye çevirir */
export function dateKeyTR(d: Date | string): string {
  const dd = typeof d === 'string' ? new Date(d) : d
  return DATE_FMT.format(dd)
}

/** Türkiye saatiyle şu anki saat — HH:MM:SS */
export function nowTimeTR(): string {
  // en-GB 00-23 saat formatı. Bazı runtime'lar 24:00:00 dönebilir.
  const t = TIME_FMT.format(new Date())
  return t.startsWith('24') ? '00' + t.slice(2) : t
}

/** Bir tarihin haftasının pazartesini bul — input YYYY-MM-DD */
export function mondayOf(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00')
  const day = d.getDay() // 0=Pazar, 1=Pzt...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return DATE_FMT.format(d)
}

/** Verilen tarihten N gün önce/sonra — UTC-12:00 sabitiyle tarih atlamasından kaçar */
export function shiftDateKey(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return DATE_FMT.format(d)
}

/** İki tarih arası tüm günleri liste — inclusive */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = []
  let cur = from
  let safety = 400
  while (cur <= to && safety-- > 0) {
    out.push(cur)
    cur = shiftDateKey(cur, 1)
  }
  return out
}
