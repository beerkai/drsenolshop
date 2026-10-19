// ═══════════════════════════════════════════════════════════════
// KDV + kargo politikası
// ─ Gıda (bal, arı ürünleri, signature karışımlar): %1
// ─ Kozmetik (kozmetik kategorisi veya parfüm): %20
// ─ Kargo: 2000 TL altı 250 TL, 2000 TL ve üzeri ücretsiz
// ─ Üst şeritte eski “ücretsiz özel teslimat” metni duruyorsa değiştirir
//
// Kullanım:
//   npx tsx scripts/apply-tax-shipping.ts           # sınıflandırma (DB yok)
//   npx tsx scripts/apply-tax-shipping.ts --apply   # canlı güncelle
// ═══════════════════════════════════════════════════════════════

import {
  HEADER_ANNOUNCEMENT_TR,
  LEGACY_HEADER_ACCENT,
  LEGACY_HEADER_ANNOUNCEMENT,
  SHIPPING_FLAT_FEE,
  SHIPPING_FREE_THRESHOLD,
} from '../src/lib/shipping-policy'

interface CategoryRow {
  id: string
  slug: string | null
  name: string | null
  parent_id: string | null
}

interface ProductRow {
  id: string
  slug: string | null
  name: string | null
  tax_rate: number | string | null
  category_id: string | null
}

function fold(value: string | null | undefined): string {
  return (value ?? '').toLocaleLowerCase('tr-TR')
}

function isCosmeticCategory(category: CategoryRow): boolean {
  const slug = fold(category.slug)
  const name = fold(category.name)
  return slug.startsWith('kozmetik')
    || name.includes('kozmetik')
    || name.includes('parfüm')
    || name.includes('parfum')
}

function categoryChain(categoryId: string | null, byId: Map<string, CategoryRow>): CategoryRow[] {
  const chain: CategoryRow[] = []
  const seen = new Set<string>()
  let current = categoryId
  while (current && !seen.has(current)) {
    seen.add(current)
    const row = byId.get(current)
    if (!row) break
    chain.push(row)
    current = row.parent_id
  }
  return chain
}

export function isCosmeticProduct(product: ProductRow, chain: CategoryRow[]): boolean {
  if (chain.some(isCosmeticCategory)) return true
  const blob = `${fold(product.slug)} ${fold(product.name)}`
  return blob.includes('parfüm') || blob.includes('parfum')
}

function rateOf(value: number | string | null): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

async function loadEnv(): Promise<void> {
  const { config } = await import('dotenv')
  const path = await import('path')
  config({ path: path.resolve(process.cwd(), '.env.local') })
}

async function apply(): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    if (process.env.VERCEL) {
      throw new Error('Vercel build: SUPABASE_SERVICE_ROLE_KEY yok, KDV ve kargo uygulanamadı.')
    }
    console.log('SUPABASE_SERVICE_ROLE_KEY yok — canlı yazım atlandı.')
    return
  }

  const { getSupabaseAdmin } = await import('../src/lib/supabase')
  const supabase = getSupabaseAdmin()

  const [{ data: categories, error: catErr }, { data: products, error: prodErr }] = await Promise.all([
    supabase.from('categories').select('id, slug, name, parent_id'),
    supabase.from('products').select('id, slug, name, tax_rate, category_id'),
  ])
  if (catErr) throw new Error(`kategoriler okunamadı: ${catErr.message}`)
  if (prodErr) throw new Error(`ürünler okunamadı: ${prodErr.message}`)

  const byId = new Map<string, CategoryRow>((categories ?? []).map((row) => [row.id, row as CategoryRow]))
  const food: ProductRow[] = []
  const cosmetic: ProductRow[] = []
  for (const product of (products ?? []) as ProductRow[]) {
    const chain = categoryChain(product.category_id, byId)
    if (isCosmeticProduct(product, chain)) cosmetic.push(product)
    else food.push(product)
  }

  if (cosmetic.length === 0) {
    throw new Error('Kozmetik ürün bulunamadı; KDV yazılmadı.')
  }

  const foodIds = food.filter((p) => rateOf(p.tax_rate) !== 1).map((p) => p.id)
  const cosmeticIds = cosmetic.filter((p) => rateOf(p.tax_rate) !== 20).map((p) => p.id)

  await writeTax(supabase, foodIds, 1)
  await writeTax(supabase, cosmeticIds, 20)
  await writeShipping(supabase)
  await writeAnnouncement(supabase)

  const quiet = process.argv.includes('--quiet')
  if (!quiet) {
    for (const product of food) console.log(`%1  ${product.name}`)
    for (const product of cosmetic) console.log(`%20 ${product.name}`)
  }
  console.log(
    `KDV: gıda ${food.length} (%1, yazılan ${foodIds.length}), kozmetik ${cosmetic.length} (%20, yazılan ${cosmeticIds.length}). Kargo: ${SHIPPING_FLAT_FEE} TL / ${SHIPPING_FREE_THRESHOLD} TL.`,
  )
}

async function writeTax(
  supabase: { from: (table: string) => any },
  ids: string[],
  taxRate: number,
): Promise<void> {
  for (let i = 0; i < ids.length; i += 80) {
    const chunk = ids.slice(i, i + 80)
    const { error } = await supabase.from('products').update({ tax_rate: taxRate }).in('id', chunk)
    if (error) throw new Error(`tax_rate ${taxRate} yazılamadı: ${error.message}`)
  }
}

async function writeShipping(supabase: { from: (table: string) => any }): Promise<void> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'shipping_config')
    .maybeSingle()
  if (error) throw new Error(`kargo ayarı okunamadı: ${error.message}`)

  const prev = (data?.value && typeof data.value === 'object' ? data.value : {}) as Record<string, unknown>
  const next = {
    ...prev,
    flat_fee: SHIPPING_FLAT_FEE,
    free_threshold: SHIPPING_FREE_THRESHOLD,
  }
  const { error: writeErr } = await supabase
    .from('site_settings')
    .upsert({ key: 'shipping_config', value: next }, { onConflict: 'key' })
  if (writeErr) throw new Error(`kargo ayarı yazılamadı: ${writeErr.message}`)
}

async function writeAnnouncement(supabase: { from: (table: string) => any }): Promise<void> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'home_content')
    .maybeSingle()
  if (error) throw new Error(`anasayfa içeriği okunamadı: ${error.message}`)
  if (!data?.value || typeof data.value !== 'object') return

  const value = data.value as {
    editorial?: { header?: { announcement?: string; announcementAccent?: string } }
  }
  const header = value.editorial?.header
  if (!header) return

  const announcement = header.announcement?.trim()
  const accent = header.announcementAccent?.trim()
  const staleAnnouncement = !announcement || announcement === LEGACY_HEADER_ANNOUNCEMENT
  const staleAccent = !accent || accent === LEGACY_HEADER_ACCENT
  if (!staleAnnouncement && !staleAccent) return

  if (staleAnnouncement) header.announcement = HEADER_ANNOUNCEMENT_TR
  if (staleAccent || header.announcement === HEADER_ANNOUNCEMENT_TR) {
    header.announcementAccent = ''
  }

  const { error: writeErr } = await supabase
    .from('site_settings')
    .upsert({ key: 'home_content', value }, { onConflict: 'key' })
  if (writeErr) throw new Error(`duyuru yazılamadı: ${writeErr.message}`)
}

async function main(): Promise<void> {
  const applyFlag = process.argv.includes('--apply')
  if (!applyFlag) {
    console.log('Gıda %1, kozmetik %20.')
    console.log(`Kargo: ${SHIPPING_FLAT_FEE} TL, ${SHIPPING_FREE_THRESHOLD} TL ve üzeri ücretsiz.`)
    console.log('Canlıya yazmak için: npx tsx scripts/apply-tax-shipping.ts --apply')
    return
  }
  await loadEnv()
  await apply()
}

const invoked = process.argv[1]?.includes('apply-tax-shipping')
if (invoked) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
