// ─────────────────────────────────────────────────────────────────────────────
// Ürün + varyant görselleri → Supabase Storage (canonical path) + DB relative path
//
// Kullanım:
//   npm run migrate:images -- --dry-run
//   npm run migrate:images -- --confirm   (önce backups/*.json yedekler)
//
// Path şeması (bucket "products" — path'e products/ ekleme):
//   Ürün:     {slug}/{index}.webp
//   Varyant:  {slug}/{850|355|…}/{index}.webp
// ─────────────────────────────────────────────────────────────────────────────

import { config } from 'dotenv'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolveImageStoragePath } from '../src/lib/images'
import { variantImageStorageSegment } from '../src/lib/variant-storage-path'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const BUCKET = 'products'
const MAX_BYTES = 8 * 1024 * 1024
const MAX_RETRIES = 3
const RETRY_DELAY = 1500

const isDryRun = process.argv.includes('--dry-run')
const isConfirm = process.argv.includes('--confirm')

if (!isDryRun && !isConfirm) {
  console.log('Kullanım:')
  console.log('  npm run migrate:images -- --dry-run')
  console.log('  npm run migrate:images -- --confirm')
  process.exit(0)
}

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL eksik (.env.local)')
  process.exit(1)
}

if (isConfirm && !SERVICE_KEY) {
  console.error('--confirm için SUPABASE_SERVICE_ROLE_KEY gerekli (.env.local)')
  process.exit(1)
}

const readKey = SERVICE_KEY ?? ANON_KEY
if (!readKey) {
  console.error('Okuma için SUPABASE_SERVICE_ROLE_KEY veya NEXT_PUBLIC_SUPABASE_ANON_KEY gerekli')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, readKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

type MigrateKind = 'product' | 'variant'

interface MigrateTask {
  kind: MigrateKind
  entityId: string
  slug: string
  variantLabel?: string
  arrayIndex: number
  sourceUrl: string
  targetPath: string
}

interface ProductRow {
  id: string
  slug: string
  images: string[] | null
  image_url: string | null
}

interface VariantRow {
  id: string
  product_id: string
  label: string | null
  variant_value: string | null
  weight_grams: number | null
  volume_ml: number | null
  sku: string | null
  images: string[] | null
  product: { slug: string } | null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function isRemoteUrl(value: string): boolean {
  const v = value.trim()
  return v.startsWith('http://') || v.startsWith('https://')
}

function isAlreadyRelativePath(value: string): boolean {
  const v = value.trim()
  return v.length > 0 && !isRemoteUrl(v)
}

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err
    await sleep(RETRY_DELAY * attempt)
    return fetchWithRetry(url, attempt + 1)
  }
}

function productTargetPath(slug: string, index: number): string {
  return `${slug}/${index}.webp`
}

function variantTargetPath(slug: string, segment: string, index: number): string {
  return `${slug}/${segment}/${index}.webp`
}

/** Kaynak URL zaten hedef path'e işaret ediyorsa indirmeye gerek yok (yalnızca DB güncelle) */
function sourceMatchesTarget(sourceUrl: string, targetPath: string): boolean {
  return resolveImageStoragePath(sourceUrl) === targetPath
}

async function storageObjectExists(path: string): Promise<boolean> {
  const parts = path.split('/')
  const fileName = parts.pop()!
  const folder = parts.join('/')
  const { data, error } = await supabase.storage.from(BUCKET).list(folder || '', {
    limit: 100,
    search: fileName,
  })
  if (error) return false
  return (data ?? []).some((f) => f.name === fileName)
}

function buildTasks(products: ProductRow[], variants: VariantRow[]): MigrateTask[] {
  const tasks: MigrateTask[] = []

  for (const p of products) {
    const imgs = p.images ?? []
    imgs.forEach((raw, index) => {
      const sourceUrl = String(raw ?? '').trim()
      if (!sourceUrl || isAlreadyRelativePath(sourceUrl)) return
      tasks.push({
        kind: 'product',
        entityId: p.id,
        slug: p.slug,
        arrayIndex: index,
        sourceUrl,
        targetPath: productTargetPath(p.slug, index),
      })
    })
  }

  for (const v of variants) {
    const slug = v.product?.slug
    if (!slug) continue
    const segment = variantImageStorageSegment(v)
    const imgs = v.images ?? []
    imgs.forEach((raw, index) => {
      const sourceUrl = String(raw ?? '').trim()
      if (!sourceUrl || isAlreadyRelativePath(sourceUrl)) return
      tasks.push({
        kind: 'variant',
        entityId: v.id,
        slug,
        variantLabel: v.label ?? v.variant_value ?? undefined,
        arrayIndex: index,
        sourceUrl,
        targetPath: variantTargetPath(slug, segment, index),
      })
    })
  }

  return tasks
}

function writeBackup(products: ProductRow[], variants: VariantRow[]) {
  const dir = resolve(process.cwd(), 'backups')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const file = resolve(dir, `pre-image-migration-${stamp}.json`)
  const payload = {
    exportedAt: new Date().toISOString(),
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      images: p.images,
      image_url: p.image_url,
    })),
    variants: variants.map((v) => ({
      id: v.id,
      product_id: v.product_id,
      label: v.label,
      variant_value: v.variant_value,
      images: v.images,
    })),
  }
  writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`\nYedek yazıldı: ${file}\n`)
  return file
}

async function applyTask(task: MigrateTask): Promise<{ skippedUpload: boolean }> {
  let skippedUpload = false

  const needsUpload = !(sourceMatchesTarget(task.sourceUrl, task.targetPath) ||
    (await storageObjectExists(task.targetPath)))

  if (needsUpload) {
    const res = await fetchWithRetry(task.sourceUrl)
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) {
      throw new Error(`Dosya çok büyük: ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB`)
    }
    const contentType = res.headers.get('content-type') || 'image/webp'
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(task.targetPath, buffer, { contentType, upsert: true })
    if (uploadErr) throw new Error(uploadErr.message)
  } else {
    skippedUpload = true
  }

  return { skippedUpload }
}

async function run() {
  const { data: productsRaw, error: pErr } = await supabase
    .from('products')
    .select('id, slug, images, image_url')

  if (pErr) {
    console.error('products okunamadı:', pErr.message)
    process.exit(1)
  }

  const { data: variantsRaw, error: vErr } = await supabase
    .from('product_variants')
    .select(
      'id, product_id, label, variant_value, weight_grams, volume_ml, sku, images, product:products(slug)'
    )

  if (vErr) {
    console.error('product_variants okunamadı:', vErr.message)
    process.exit(1)
  }

  const products = (productsRaw ?? []) as ProductRow[]
  const variants = (variantsRaw ?? []) as unknown as VariantRow[]
  const tasks = buildTasks(products, variants)

  const productTasks = tasks.filter((t) => t.kind === 'product')
  const variantTasks = tasks.filter((t) => t.kind === 'variant')
  const productSlugs = new Set(productTasks.map((t) => t.slug))
  const variantEntities = new Set(variantTasks.map((t) => t.entityId))

  let skippedRelativeProduct = 0
  let skippedRelativeVariant = 0
  for (const p of products) {
    for (const u of p.images ?? []) {
      if (isAlreadyRelativePath(String(u))) skippedRelativeProduct++
    }
  }
  for (const v of variants) {
    for (const u of v.images ?? []) {
      if (isAlreadyRelativePath(String(u))) skippedRelativeVariant++
    }
  }

  console.log('\n──── Görsel migration planı ────')
  console.log(`Taşınacak görsel (http URL): ${tasks.length}`)
  console.log(`  Ürün galerisi   : ${productTasks.length} görsel, ${productSlugs.size} ürün`)
  console.log(`  Varyant galerisi: ${variantTasks.length} görsel, ${variantEntities.size} varyant`)
  console.log(`Zaten relative path (atlanacak): ürün ${skippedRelativeProduct}, varyant ${skippedRelativeVariant}`)

  if (tasks.length === 0) {
    console.log('\nTaşınacak http URL yok.')
    return
  }

  console.log('\nDetay:')
  for (const t of tasks) {
    const who =
      t.kind === 'product'
        ? `ürün ${t.slug}`
        : `varyant ${t.slug} / ${t.variantLabel ?? t.entityId.slice(0, 8)}`
    console.log(`  [${t.kind}] ${who}  [#${t.arrayIndex}]  →  ${t.targetPath}`)
    console.log(`       kaynak: ${t.sourceUrl.slice(0, 96)}${t.sourceUrl.length > 96 ? '…' : ''}`)
  }

  if (isDryRun) {
    console.log('\n--dry-run: indirme / yükleme / DB yazımı yapılmadı.')
    return
  }

  if (!SERVICE_KEY) {
    console.error('Yükleme için service role gerekli')
    process.exit(1)
  }

  writeBackup(products, variants)

  const failed: Array<{ task: MigrateTask; reason: string }> = []
  let uploadCount = 0
  let skipUploadCount = 0
  let dbProductUpdates = 0
  let dbVariantUpdates = 0

  // Güncel diziler — başarılı task'lar path yazar
  const productImages = new Map<string, string[]>()
  const variantImages = new Map<string, string[]>()
  for (const p of products) {
    productImages.set(p.id, [...(p.images ?? [])])
  }
  for (const v of variants) {
    variantImages.set(v.id, [...(v.images ?? [])])
  }

  for (const task of tasks) {
    const label =
      task.kind === 'product'
        ? task.slug
        : `${task.slug}/${task.variantLabel ?? 'varyant'}`
    process.stdout.write(`→ ${label} [${task.arrayIndex}] ${task.targetPath} … `)

    try {
      const { skippedUpload } = await applyTask(task)
      if (skippedUpload) skipUploadCount++
      else uploadCount++

      if (task.kind === 'product') {
        const arr = productImages.get(task.entityId)!
        arr[task.arrayIndex] = task.targetPath
      } else {
        const arr = variantImages.get(task.entityId)!
        arr[task.arrayIndex] = task.targetPath
      }
      console.log(skippedUpload ? 'DB path (dosya vardı)' : 'yüklendi')
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      failed.push({ task, reason })
      console.log(`HATA: ${reason}`)
    }
  }

  // DB batch — yalnızca değişen entity'ler
  // image_url: vitrin getProductImage() önce bu kolona bakar; images[0] ile aynı path tutulur
  for (const p of products) {
    const next = productImages.get(p.id)!
    const prev = p.images ?? []
    const changed = next.some((u, i) => u !== (prev[i] ?? ''))
    if (!changed) continue
    const coverPath = next[0] ?? null
    const { error } = await supabase
      .from('products')
      .update({ images: next, image_url: coverPath })
      .eq('id', p.id)
    if (error) {
      failed.push({
        task: {
          kind: 'product',
          entityId: p.id,
          slug: p.slug,
          arrayIndex: -1,
          sourceUrl: '',
          targetPath: '',
        },
        reason: `products update: ${error.message}`,
      })
    } else {
      dbProductUpdates++
    }
  }

  for (const v of variants) {
    const next = variantImages.get(v.id)!
    const prev = v.images ?? []
    const changed = next.some((u, i) => u !== (prev[i] ?? ''))
    if (!changed) continue
    const { error } = await supabase
      .from('product_variants')
      .update({ images: next })
      .eq('id', v.id)
    if (error) {
      failed.push({
        task: {
          kind: 'variant',
          entityId: v.id,
          slug: v.product?.slug ?? '?',
          arrayIndex: -1,
          sourceUrl: '',
          targetPath: '',
        },
        reason: `variant update: ${error.message}`,
      })
    } else {
      dbVariantUpdates++
    }
  }

  console.log('\n──── Özet ────')
  console.log(`Yüklenen dosya     : ${uploadCount}`)
  console.log(`Atlanan upload     : ${skipUploadCount} (storage’da zaten vardı veya path eşleşti)`)
  console.log(`Güncellenen ürün   : ${dbProductUpdates}`)
  console.log(`Güncellenen varyant: ${dbVariantUpdates}`)
  console.log(`Hata               : ${failed.length}`)

  if (failed.length > 0) {
    console.log('\nHatalar:')
    for (const f of failed) {
      const t = f.task
      console.log(`  ${t.kind} ${t.slug} #${t.arrayIndex}: ${f.reason}`)
      if (t.sourceUrl) console.log(`    ${t.sourceUrl}`)
    }
  }
}

run().catch((err) => {
  console.error('[migrate-images] beklenmedik hata:', err)
  process.exit(1)
})
