// ═══════════════════════════════════════════════════════════════
// Global toast emitter — Provider/Toaster ile dinleniyor
// ─ Her yerden toast.success('...') çağırılabilir
// ─ SSR-safe (window guard)
// ═══════════════════════════════════════════════════════════════

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export interface ToastInput {
  id?: string
  tone: ToastTone
  title?: string
  message: string
  duration?: number // ms, default 4000
}

export interface Toast extends Required<Pick<ToastInput, 'tone' | 'message' | 'duration'>> {
  id: string
  title?: string
}

type Listener = (toast: Toast) => void

const listeners = new Set<Listener>()

export function subscribeToast(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit(input: ToastInput) {
  if (typeof window === 'undefined') return // SSR no-op
  const t: Toast = {
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tone: input.tone,
    title: input.title,
    message: input.message,
    duration: input.duration ?? 4000,
  }
  listeners.forEach((fn) => fn(t))
}

export const toast = {
  success(message: string, title?: string) { emit({ tone: 'success', message, title }) },
  error(message: string, title?: string)   { emit({ tone: 'error',   message, title }) },
  warning(message: string, title?: string) { emit({ tone: 'warning', message, title }) },
  info(message: string, title?: string)    { emit({ tone: 'info',    message, title }) },
  show(input: ToastInput) { emit(input) },
}
