// ═══════════════════════════════════════════════════════════════
// Site geneli iletişim & sosyal sabitleri — tek kaynak
// ═══════════════════════════════════════════════════════════════

export const INSTAGRAM_HANDLE = '@drsenol.shop'
export const INSTAGRAM_URL = 'https://instagram.com/drsenol.shop'

export const SITE_EMAILS = {
  hello: 'hello@drsenol.shop',
  destek: 'destek@drsenol.shop',
  siparis: 'siparis@drsenol.shop',
} as const

/** Vitrin açık adresi — iletişim sayfası */
export const SITE_ADDRESS_LINE = 'Derekızık Mah. Köy İçi Eski Saitabat Şelalesi'
export const SITE_ADDRESS_LOCALITY = 'Kestel/Bursa 16450'
export const SITE_OPEN_ADDRESS = `${SITE_ADDRESS_LINE}, ${SITE_ADDRESS_LOCALITY}`

/** Tıklanınca WhatsApp sohbeti açılır */
export const SITE_WHATSAPP_DISPLAY = '+90 536 379 42 99'
export const SITE_WHATSAPP_URL = 'https://wa.me/905363794299'

export function mailto(email: string): string {
  return `mailto:${email}`
}
