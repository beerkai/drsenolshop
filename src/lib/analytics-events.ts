// ═══════════════════════════════════════════════════════════════
// Plausible özel olayları — yalnızca tarayıcıda, domain varsa
// ═══════════════════════════════════════════════════════════════

export type AnalyticsEventProps = Record<string, string | number | boolean>

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsEventProps }) => void
  }
}

export function trackEvent(name: string, props?: AnalyticsEventProps): void {
  if (typeof window === 'undefined') return
  try {
    window.plausible?.(name, props ? { props } : undefined)
  } catch {
    // Analytics asla UX'i kırmamalı
  }
}
