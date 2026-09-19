// ═══════════════════════════════════════════════════════════════
// ikas CSV → product_variants.images (+ weight_grams) backfill
//
// Kullanım (service_role gerekir):
//   tsx scripts/backfill-variant-images-from-ikas-csv.ts --dry-run
//   tsx scripts/backfill-variant-images-from-ikas-csv.ts --confirm
// ═══════════════════════════════════════════════════════════════

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const CSV_PATH = resolve(process.cwd(), 'user-added/ikas-urunler.csv')

const isDryRun = process.argv.includes('--dry-run')
const isConfirm = process.argv.includes('--confirm')

if (!isDryRun && !isConfirm) {
  console.log('Kullanım:')
  console.log('  tsx scripts/backfill-variant-images-from-ikas-csv.ts --dry-run')
  console.log('  tsx scripts/backfill-variant-images-from-ikas-csv.ts --confirm')
  process.exit(0)
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik (.env.local)')
  process.exit(1)
}

/** Basit CSV satır ayrıştırıcı (tırnaklı alanlar) */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const header = parseCsvLine(lines[0]!)
  const rows: Record<string, string>[] = []
  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line)
    const row: Record<string, string> = {}
    header.forEach((h, i) => {
      row[h] = fields[i] ?? ''
    })
    rows.push(row)
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQ = !inQ
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function parseWeightGrams(variantValue: string): number | null {
  const m = variantValue.match(/(\d+)\s*gr/i)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

async function run() {
  const raw = readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '')
  const rows = parseCsv(raw)
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let updated = 0
  for (const row of rows) {
    const ikasVariantId = row['Varyant ID']?.trim()
    const imgs = (row['Resim URL'] ?? '')
      .split(';')
      .map((u) => u.trim())
      .filter(Boolean)
    const sku = row['SKU'] ?? ''
    const vval = row['Varyant Değer 1'] ?? ''
    if (!ikasVariantId || imgs.length === 0) continue
    if (!/355|850/.test(`${sku} ${vval}`)) continue

    const weightGrams = parseWeightGrams(vval)
    const payload: { images: string[]; weight_grams?: number } = { images: imgs }
    if (weightGrams != null) payload.weight_grams = weightGrams

    console.log(
      `[${isDryRun ? 'dry-run' : 'update'}] ${row['Slug']} ${vval} (${ikasVariantId}) → ${imgs.length} görsel`
    )

    if (isDryRun) {
      updated++
      continue
    }

    const { error, count } = await supabase
      .from('product_variants')
      .update(payload)
      .eq('ikas_variant_id', ikasVariantId)

    if (error) {
      console.error('Hata:', ikasVariantId, error.message)
      continue
    }
    if ((count ?? 0) === 0) {
      console.warn('Eşleşen satır yok:', ikasVariantId)
      continue
    }
    updated++
  }

  console.log(`\nTamam: ${updated} varyant işlendi.`)
}

run().catch((err) => {
  console.error('[backfill-variant-images] beklenmedik hata:', err)
  process.exit(1)
})
