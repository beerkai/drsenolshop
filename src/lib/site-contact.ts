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

export function mailto(email: string): string {
  return `mailto:${email}`
}
