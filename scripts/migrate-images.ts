// ─────────────────────────────────────────────────────────────────────────────
// cdn.myikas.com görsellerini Supabase Storage'a migrate et
//
// Kullanım:
//   npm run migrate:images -- --dry-run     → sadece kaç görsel var gösterir
//   npm run migrate:images -- --confirm     → gerçekten migrate eder
// ─────────────────────────────────────────────────────────────────────────────

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const BUCKET       = 'products'
const MAX_BYTES    = 5 * 1024 * 1024  // 5 MB
const MAX_RETRIES  = 3
const RETRY_DELAY  = 1500             // ms

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik (.env.local)')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const isDryRun = process.argv.includes('--dry-run')
const isConfirm = process.argv.includes('--confirm')

if (!isDryRun && !isConfirm) {
  console.log('Kullanım:')
  console.log('  npm run migrate:images -- --dry-run    (önizleme)')
  console.log('  npm run migrate:images -- --confirm    (gerçek migration)')
  process.exit(0)
}

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err
    await sleep(RETRY_DELAY * attempt)
    return fetchWithRetry(url, attempt + 1)
  }
}

function isIkasUrl(url: string): boolean {
  return url.includes('cdn.myikas.com')
}

function storagePath(productSlug: string, index: number): string {
  return `${productSlug}/${index}.webp`
}

// ─── Ana Akış ────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string
  slug: string
  images: string[] | null
}

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, images')
    .not('images', 'is', null)

  if (error) {
    console.error('Ürünler çekilemedi:', error.message)
    process.exit(1)
  }

  const rows = (products as ProductRow[]).filter(
    (p) => p.images && p.images.some(isIkasUrl)
  )

  if (rows.length === 0) {
    console.log('Migrate edilecek ikas görseli bulunamadı. Tüm görseller zaten Supabase\'de olabilir.')
    return
  }

  const totalImages = rows.reduce(
    (acc, p) => acc + (p.images?.filter(isIkasUrl).length ?? 0),
    0
  )

  console.log(`\n${rows.length} üründe ${totalImages} ikas görseli bulundu.\n`)

  if (isDryRun) {
    for (const p of rows) {
      const ikas = p.images!.filter(isIkasUrl)
      console.log(`  ${p.slug}: ${ikas.length} görsel`)
    }
    console.log('\n--dry-run: gerçek işlem yapılmadı. --confirm ile çalıştır.')
    return
  }

  // ── Gerçek Migration ──
  const failed: Array<{ slug: string; url: string; reason: string }> = []
  let successCount = 0

  for (const product of rows) {
    const ikasUrls = product.images!.filter(isIkasUrl)
    const newUrls: string[] = [...product.images!]  // tümünü kopyala

    process.stdout.write(`İşleniyor: ${product.slug} `)

    for (let i = 0; i < ikasUrls.length; i++) {
      const originalUrl = ikasUrls[i]
      const originalIndex = product.images!.indexOf(originalUrl)
      const path = storagePath(product.slug, originalIndex)
      process.stdout.write(`[${i + 1}/${ikasUrls.length}] `)

      try {
        // İndir
        const res = await fetchWithRetry(originalUrl)
        const buffer = await res.arrayBuffer()

        if (buffer.byteLength > MAX_BYTES) {
          throw new Error(`Dosya çok büyük: ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB (max 5 MB)`)
        }

        // Yükle
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, buffer, {
            contentType: 'image/webp',
            upsert: true,
          })

        if (uploadErr) throw new Error(uploadErr.message)

        // Public URL al
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        newUrls[originalIndex] = urlData.publicUrl
        successCount++
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        failed.push({ slug: product.slug, url: originalUrl, reason })
        // Orijinal URL'yi koruyoruz (değiştirmiyoruz)
      }
    }

    // Değişen URL varsa güncelle
    const hasChange = newUrls.some((u, idx) => u !== product.images![idx])
    if (hasChange) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ images: newUrls })
        .eq('id', product.id)

      if (updateErr) {
        console.error(`\n  ${product.slug} güncelleme hatası: ${updateErr.message}`)
      }
    }

    console.log('✓')
  }

  // ── Rapor ──
  console.log('\n─────────────────────────────────')
  console.log(`Başarılı : ${successCount} görsel`)
  console.log(`Hatalı   : ${failed.length} görsel`)

  if (failed.length > 0) {
    console.log('\nBaşarısız görseller:')
    for (const f of failed) {
      console.log(`  [${f.slug}] ${f.url}`)
      console.log(`    → ${f.reason}`)
    }
  }
}

run().catch((err) => {
  console.error('Beklenmedik hata:', err)
  process.exit(1)
})
