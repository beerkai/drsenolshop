// ═══════════════════════════════════════════════════════════════
// Analiz rapor slotları — site_settings.analysis_reports
// PDF'ler products bucket `analizler/` altında; vitrin cdn.drsenol.shop
// ═══════════════════════════════════════════════════════════════

import { getImageUrl } from '@/lib/images'
import { getSiteSetting, setSiteSetting } from '@/lib/site-settings'

export const ANALYSIS_REPORTS_KEY = 'analysis_reports'
export const ANALYSIS_PDF_BUCKET = 'products'
export const ANALYSIS_PDF_PREFIX = 'analizler/'
export const ANALYSIS_PDF_MAX_BYTES = 20 * 1024 * 1024
export const ANALYSIS_SLOT_LIMIT = 40

const SLOT_ID_RE = /^[a-zA-Z0-9_-]{1,80}$/
const PDF_PATH_RE = /^analizler\/[a-zA-Z0-9_-]+\.pdf$/

export interface AnalysisSlot {
  id: string
  title: string
  note: string
  /** Bucket sonrası path, örn. analizler/slot-1-171000.pdf */
  pdfPath: string | null
  published: boolean
}

export const defaultAnalysisSlots: AnalysisSlot[] = [
  { id: 'slot-1', title: '', note: '', pdfPath: null, published: true },
  { id: 'slot-2', title: '', note: '', pdfPath: null, published: true },
  { id: 'slot-3', title: '', note: '', pdfPath: null, published: true },
  { id: 'slot-4', title: '', note: '', pdfPath: null, published: true },
]

export function isAnalysisSlotId(id: string): boolean {
  return SLOT_ID_RE.test(id)
}

export function isAnalysisPdfPath(path: string): boolean {
  return PDF_PATH_RE.test(path)
}

export function analysisPdfUrl(pdfPath: string | null | undefined): string {
  if (!pdfPath || !isAnalysisPdfPath(pdfPath)) return ''
  return getImageUrl(pdfPath)
}

export function sanitizeAnalysisSlots(input: unknown): AnalysisSlot[] | null {
  if (!Array.isArray(input)) return null
  if (input.length > ANALYSIS_SLOT_LIMIT) return null

  const slots: AnalysisSlot[] = []
  const seen = new Set<string>()

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null
    const row = raw as Record<string, unknown>
    const id = String(row.id ?? '').trim()
    if (!isAnalysisSlotId(id) || seen.has(id)) return null
    seen.add(id)

    let pdfPath: string | null = null
    if (row.pdfPath != null && String(row.pdfPath).trim() !== '') {
      const path = String(row.pdfPath).trim()
      if (!isAnalysisPdfPath(path)) return null
      pdfPath = path
    }

    slots.push({
      id,
      title: String(row.title ?? '').trim().slice(0, 140),
      note: String(row.note ?? '').trim().slice(0, 280),
      pdfPath,
      published: row.published !== false,
    })
  }

  return slots
}

export async function getAnalysisReports(): Promise<AnalysisSlot[]> {
  const stored = await getSiteSetting<{ slots?: unknown }>(ANALYSIS_REPORTS_KEY)
  if (!stored) return defaultAnalysisSlots.map((slot) => ({ ...slot }))
  return sanitizeAnalysisSlots(stored.slots) ?? []
}

export async function setAnalysisReports(slots: AnalysisSlot[]): Promise<boolean> {
  return setSiteSetting(ANALYSIS_REPORTS_KEY, { slots } as unknown as Record<string, unknown>)
}
