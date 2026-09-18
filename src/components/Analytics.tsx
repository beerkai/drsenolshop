// ═══════════════════════════════════════════════════════════════
// Analytics — Plausible (privacy-friendly, çerez gerektirmez)
// ─ NEXT_PUBLIC_PLAUSIBLE_DOMAIN env'i set ise snippet yüklenir
// ─ Yoksa hiçbir şey render edilmez (build/preview ortamlarında sessizlik)
// ─ Plausible cookie kullanmadığı için KVKK/GDPR açısından rıza gerekmez
// ═══════════════════════════════════════════════════════════════

import Script from 'next/script'

export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim()
  if (!domain) return null

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  )
}
