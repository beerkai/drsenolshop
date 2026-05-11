// short_desc kolonunu description'dan veya ürün isminden doldur

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik (.env.local)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ─── Metin işleme ────────────────────────────────────────────────────────────

const JUNK_PATTERNS = [
  /^(urun|ürün|product|kategori|category)\s*\d*/i,
  /^-+$/,
  /^\.+$/,
]

/** HTML tag'leri, emoji prefix'i ve fazladan boşlukları temizle */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')          // HTML tag'leri boşlukla değiştir
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/📌\s*/g, '')              // 📌 emoji prefix temizle
    .replace(/\s+/g, ' ')
    .trim()
}

function isJunk(text: string): boolean {
  const t = text.trim()
  return t.length < 10 || JUNK_PATTERNS.some((p) => p.test(t))
}

/**
 * Metinden 80-120 karakter arasında anlamlı bir kısa açıklama çıkarır.
 * HTML varsa önce strip eder; sonra ilk noktalı cümleyi alır.
 */
function extractShortDesc(text: string): string | null {
  const cleaned = stripHtml(text)
  if (isJunk(cleaned)) return null

  // İlk noktalı cümle
  const sentenceEnd = cleaned.search(/[.!?]/)
  if (sentenceEnd !== -1 && sentenceEnd >= 20) {
    const sentence = cleaned.slice(0, sentenceEnd + 1).trim()
    if (sentence.length <= 180) return sentence
  }

  // 120 karakterde kelime sınırında kes
  if (cleaned.length <= 120) return cleaned
  const cut = cleaned.slice(0, 110)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '…'
}

/**
 * "Superblend 5 | Arı Ekmeği, Propolis, Arı Sütü..." → "Arı ekmeği, propolis, arı sütü..."
 * Sadece "|" içeren isimlerde sağ tarafı kısa açıklama olarak kullanır.
 */
function shortDescFromName(name: string): string | null {
  const pipeIdx = name.indexOf('|')
  if (pipeIdx === -1) return null
  const right = name.slice(pipeIdx + 1).trim()
  if (right.length < 15) return null
  const desc = right.charAt(0).toUpperCase() + right.slice(1).toLowerCase()
  return desc.endsWith('.') ? desc : desc + '.'
}

// ─── Ana Akış ────────────────────────────────────────────────────────────────

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, description, long_desc, short_desc')

  if (error) {
    console.error('Ürünler çekilemedi:', error.message)
    process.exit(1)
  }

  if (!products || products.length === 0) {
    console.log('Ürün bulunamadı.')
    return
  }

  console.log(`${products.length} ürün işlenecek.\n`)

  let created = 0
  let noDesc = 0
  let skipped = 0

  for (const p of products) {
    const source = p.long_desc || p.description
    let shortDesc: string | null = null

    if (source && source.trim().length > 0) {
      shortDesc = extractShortDesc(source)
    }

    if (!shortDesc) {
      shortDesc = shortDescFromName(p.name)
    }

    if (!shortDesc) {
      if (!source || source.trim().length === 0) {
        noDesc++
      } else {
        skipped++
      }
      continue
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ short_desc: shortDesc })
      .eq('id', p.id)

    if (updateErr) {
      console.error(`  [${p.slug}] güncelleme hatası: ${updateErr.message}`)
      skipped++
    } else {
      console.log(`  ✓ ${p.slug}`)
      console.log(`    → "${shortDesc}"`)
      created++
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`Oluşturuldu        : ${created} üründe short_desc`)
  console.log(`Description boştu  : ${noDesc} ürün`)
  console.log(`Atlandı            : ${skipped} ürün`)
}

run().catch((err) => {
  console.error('Beklenmedik hata:', err)
  process.exit(1)
})
