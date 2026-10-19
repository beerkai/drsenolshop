// ═══════════════════════════════════════════════════════════════
// 16 Ekim 2026 satış fiyat listesi + %15 indirim
//
// Kural:
//   price          = listedeki satış fiyatı (üstü çizili liste)
//   discount_price = liste × 0,85 (vitrindeki satış fiyatı)
//   compare_price  = liste (admin/backfill ile uyumlu)
//
// Sitede olmayan kalemler ve Signature Collection dokunulmaz.
//
// Kullanım:
//   npx tsx scripts/oct-2026-price-list.ts           # tablo (DB yok)
//   npx tsx scripts/oct-2026-price-list.ts --apply   # canlı güncelle
// ═══════════════════════════════════════════════════════════════

async function loadEnv(): Promise<void> {
  const { config } = await import('dotenv')
  const path = await import('path')
  config({ path: path.resolve(process.cwd(), '.env.local') })
}

export interface PriceRow {
  product: string
  slug: string
  variantId: string
  productId: string
  size: string
  list: number
  currentPrice: number
  currentDiscount: number | null
}

export const PRICE_ROWS: PriceRow[] = [
  // Bal çeşitleri
  { product: 'Kestane ve Ihlamur Balı', slug: 'kestane-ihlamur-bali', productId: 'dd66dad9-597a-4950-bba4-e30c7aaea7c8', variantId: 'cc550924-e5af-4941-a6eb-e8d2c7543553', size: '355 gr.', list: 1100, currentPrice: 900, currentDiscount: null },
  { product: 'Kestane ve Ihlamur Balı', slug: 'kestane-ihlamur-bali', productId: 'dd66dad9-597a-4950-bba4-e30c7aaea7c8', variantId: '6d41429f-86a6-4568-b6c7-6f4d6bf34c41', size: '850 gr.', list: 2200, currentPrice: 1800, currentDiscount: null },
  { product: 'Çam Balı', slug: 'cam-bali', productId: '137acdea-d39c-4a51-976a-260b4536b78e', variantId: '171196eb-8ab0-4229-a2a5-32af12c825c0', size: '355 gr.', list: 800, currentPrice: 650, currentDiscount: null },
  { product: 'Çam Balı', slug: 'cam-bali', productId: '137acdea-d39c-4a51-976a-260b4536b78e', variantId: '4d75b908-7c9a-4468-8e75-e5b7b9a20e8d', size: '850 gr.', list: 1600, currentPrice: 1300, currentDiscount: null },
  { product: 'Süzme Çiçek Balı', slug: 'cicek-bali', productId: '3a273448-f325-479e-a7b5-6713469a38bf', variantId: '6aac4beb-ad1b-479e-8e6f-9834acaebb1f', size: '355 gr.', list: 800, currentPrice: 650, currentDiscount: null },
  { product: 'Süzme Çiçek Balı', slug: 'cicek-bali', productId: '3a273448-f325-479e-a7b5-6713469a38bf', variantId: '26dd9526-31da-425e-ada8-20cc72179cc0', size: '850 gr.', list: 1600, currentPrice: 1300, currentDiscount: null },
  { product: 'Dağ Balı', slug: 'dag-bali', productId: '1747c4d1-4e07-4245-82c3-98cb026eb572', variantId: 'f51c209a-f455-4963-8dd4-610c2d6b0302', size: '355 gr.', list: 1300, currentPrice: 1050, currentDiscount: null },
  { product: 'Dağ Balı', slug: 'dag-bali', productId: '1747c4d1-4e07-4245-82c3-98cb026eb572', variantId: '766e6551-97e1-4d9e-be93-4ac029d90a95', size: '850 gr.', list: 2600, currentPrice: 2100, currentDiscount: null },
  { product: 'Kestane Balı', slug: 'kestane-bali', productId: '15d8c406-1a2d-4cd3-972c-4401a507a346', variantId: '04afc0d2-3840-41f9-af86-65512b156e83', size: '355 gr.', list: 2000, currentPrice: 1600, currentDiscount: null },
  { product: 'Kestane Balı', slug: 'kestane-bali', productId: '15d8c406-1a2d-4cd3-972c-4401a507a346', variantId: '1be79887-99b8-4698-abfd-e43bbea81920', size: '850 gr.', list: 3900, currentPrice: 3200, currentDiscount: null },
  { product: 'Sedir Balı', slug: 'sedir-bali', productId: '4a4e1dce-ca15-4af8-a79f-9afbdc6897a7', variantId: 'bb5439b3-7f0a-44e1-a7d3-2a8a1073b195', size: '355 gr.', list: 1100, currentPrice: 900, currentDiscount: null },
  { product: 'Sedir Balı', slug: 'sedir-bali', productId: '4a4e1dce-ca15-4af8-a79f-9afbdc6897a7', variantId: '695368ba-341c-40d9-adaa-3640863bcc97', size: '850 gr.', list: 2200, currentPrice: 1800, currentDiscount: null },
  { product: 'Lavanta Balı', slug: 'lavanta-bali', productId: 'c93345ba-92c6-449e-ab10-b3cd7d2a799c', variantId: '854f7d3c-90a0-451f-9c92-195266064406', size: '355 gr.', list: 1800, currentPrice: 1450, currentDiscount: null },
  { product: 'Lavanta Balı', slug: 'lavanta-bali', productId: 'c93345ba-92c6-449e-ab10-b3cd7d2a799c', variantId: '1d3ff5ad-b0ae-4030-8fc2-76b589b5bdce', size: '850 gr.', list: 3500, currentPrice: 2900, currentDiscount: null },
  { product: 'Kekik Balı', slug: 'kekik-bali', productId: 'f2563fff-271b-44ce-a3ea-29281ab3a54b', variantId: '83709702-6faa-416e-a34d-238719191123', size: '355 gr.', list: 1800, currentPrice: 1450, currentDiscount: null },
  { product: 'Kekik Balı', slug: 'kekik-bali', productId: 'f2563fff-271b-44ce-a3ea-29281ab3a54b', variantId: '91501d1e-93fa-43ea-9494-17f9473409a1', size: '850 gr.', list: 3500, currentPrice: 2900, currentDiscount: null },
  { product: 'Beyaz Bal', slug: 'beyaz-bal', productId: '8273b15b-fa74-49dc-bcd0-8ec2ab61378c', variantId: '7956e5f4-b6ef-4e63-ac4c-00763be0ec44', size: '500 gr.', list: 1800, currentPrice: 1600, currentDiscount: null },

  // Arı ürünleri
  { product: 'Arı Ekmeği', slug: 'ari-ekmegi', productId: '2970b837-eabf-4bd8-9170-47579511bb4d', variantId: 'fb3eecc3-02ff-45c7-a7c0-d58737433aa2', size: '175 gr.', list: 2400, currentPrice: 2000, currentDiscount: null },
  { product: 'Polen', slug: 'polen', productId: 'e0450467-dfa9-4b29-bbc3-271dd6b33d8b', variantId: 'bf8018ec-c1b7-4350-ab60-88cf2b9f0c1b', size: '200 gr.', list: 600, currentPrice: 500, currentDiscount: null },
  { product: 'Sıvı Propolis', slug: 'sivi-propolis', productId: '38974108-f53e-4f0d-8a64-0b4f5a39ca29', variantId: '0a59d7fa-4bdc-411c-a0a0-d69a6d7caa1d', size: '20 ml.', list: 800, currentPrice: 600, currentDiscount: null },
  { product: 'Sprey Propolis', slug: 'sprey-propolis', productId: '4411ea3e-3be1-4d03-9a2e-f7e33997d4d5', variantId: 'ea0ead4a-d759-466c-8103-06c18f73b9de', size: '30 ml.', list: 1000, currentPrice: 800, currentDiscount: null },
  { product: 'Toz Propolis', slug: 'toz-propolis', productId: '287c3bce-bd5a-4301-b15a-b9daf6c02981', variantId: 'b186033e-9aa9-446d-98cc-5b9cac5840ee', size: '10 gr.', list: 500, currentPrice: 250, currentDiscount: null },

  // Signature Series (koleksiyon paketi hariç)
  { product: 'Vitalis Chestnut+', slug: 'vitalis-chestnut', productId: 'be76e6e6-9059-4013-85b3-fc3fa8f1e3af', variantId: 'c4665bf2-3fdc-4c7d-8cc9-8c0b63729516', size: 'Standart', list: 3600, currentPrice: 3000, currentDiscount: 2400 },
  { product: 'Wild Saffron Blend', slug: 'wild-saffron-blend', productId: '3f5ccb99-4c72-411a-aca9-7f9955ef5274', variantId: '56d90314-efbc-4a5d-9728-777b560fe3b3', size: 'Standart', list: 3300, currentPrice: 2700, currentDiscount: 2160 },
  { product: 'Superblend 5', slug: 'superblend-5', productId: '3506cae1-21c7-47c3-b0ca-6f2aad9875c9', variantId: '3c1fd13a-2405-4d08-9efc-c9b7cce87c00', size: 'Standart', list: 3200, currentPrice: 2600, currentDiscount: 2080 },
  { product: 'Superblend 3', slug: 'superblend-3', productId: '9f1259bf-6255-4a8d-9561-36a223fafd46', variantId: '492fbb35-aeea-4f7c-95d3-a11bb84369e3', size: 'Standart', list: 2600, currentPrice: 2100, currentDiscount: 1680 },
  { product: 'Highland Propolis', slug: 'highland-propolis', productId: '09866364-fd78-4819-8a39-b7b51b030986', variantId: '4b535ef5-7849-44d4-8691-c30b09586f7b', size: 'Standart', list: 2300, currentPrice: 1900, currentDiscount: 1520 },
  { product: 'Ginger & Flora', slug: 'ginger-flora', productId: 'c56e38d3-5c42-4a80-b623-6b00ee0a4b85', variantId: 'ae0f9d01-959c-4c70-8103-f9fdf71415e0', size: 'Standart', list: 2200, currentPrice: 1800, currentDiscount: 1440 },

  // Goldylium parfüm 50 ml
  { product: 'Sands of Fire', slug: 'sands-of-fire-erkek-parfumu-50-ml', productId: 'af4f1c94-da84-4fd1-9b1b-5b73eea57df8', variantId: 'ed2c6349-d956-403a-926c-d83dd8d7e026', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Jannat Arz', slug: 'jannat-arz-erkek-parfumu-50-ml', productId: 'ff5fee34-e27c-499e-ac42-b5ae903075e8', variantId: '21133331-309a-4696-be49-71c9d491acb1', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Sovereign Veil', slug: 'sovereign-veil-erkek-parfumu-50-ml', productId: '05695512-b3ff-4250-9764-926fc619b138', variantId: 'f87f3425-390e-4936-825d-9fe69f85023a', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Flame Petal', slug: 'flame-petal-kadin-parfumu-50-ml', productId: 'efeef208-3984-4aa6-b751-3678d0531444', variantId: '1d9a9c93-49a7-4ed0-9b54-66400e13a0a8', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Celestial Silk', slug: 'celestial-silk-kadin-parfumu-50-ml', productId: 'fc08a5e4-9f4e-4cd0-bab2-eda1f6e73362', variantId: 'c25dba6e-9251-409e-9a1f-b0410ef4d241', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Layali Zahra', slug: 'layali-zahra-kadin-parfumu-50-ml', productId: 'd95ce091-c2e9-47c9-9be7-0761bc79d2d3', variantId: 'befeec38-3613-46b4-9b54-ade6ac0e6486', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
  { product: 'Saffron No:540', slug: 'saffron-no-540-unisex-parfum-50-ml', productId: '1ddb0b57-33a8-4129-9b34-5d27bb44c622', variantId: '8cffd8a9-643e-4f7a-a40e-d5c9bf2b2c41', size: '50 ml', list: 1700, currentPrice: 1400, currentDiscount: null },
]

export const SKIPPED = [
  { reason: 'Sitede yok', item: 'Akasya Balı 355/850 gr' },
  { reason: 'Sitede yok', item: 'Matcha Blend' },
  { reason: 'Sitede yok', item: 'Royal Ginseng Elixir' },
  { reason: 'Sitede yok (sitede 500 gr var)', item: 'Beyaz Bal 1000 gr' },
  { reason: 'Boyut uyuşmuyor (sitede 40/80/100 gr)', item: 'Arı Sütü 10 gr' },
  { reason: 'Koleksiyon paketi değiştirilmedi', item: 'Signature Collection 8’li / sitedeki 6 kavanoz' },
  { reason: 'Listede yok', item: 'Petek Bal 1500 gr' },
  { reason: 'Listede yok / boyut uyuşmuyor', item: 'Arı Sütü 40/80/100 gr' },
]

export function salePrice(list: number): number {
  return Math.round(list * 0.85)
}

function tl(n: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n) + ' TL'
}

export function printTable(): void {
  console.log('Ürün | Boyut | Eski satış | Liste | %15 satış')
  console.log('-----|-------|------------|-------|----------')
  for (const row of PRICE_ROWS) {
    const oldSale = row.currentDiscount ?? row.currentPrice
    console.log(
      `${row.product} | ${row.size} | ${tl(oldSale)} | ${tl(row.list)} | ${tl(salePrice(row.list))}`
    )
  }
  console.log('\nDokunulmayan:')
  for (const s of SKIPPED) {
    console.log(`- [${s.reason}] ${s.item}`)
  }
  console.log(`\nGüncellenecek kalem: ${PRICE_ROWS.length}`)
}

async function apply(): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    if (process.env.VERCEL) {
      throw new Error('Vercel build: SUPABASE_SERVICE_ROLE_KEY yok, fiyat uygulanamadı.')
    }
    console.log('SUPABASE_SERVICE_ROLE_KEY yok — canlı yazım atlandı.')
    return
  }

  const { getSupabaseAdmin } = await import('../src/lib/supabase')
  const supabase = getSupabaseAdmin()

  const probe = PRICE_ROWS[0]
  const { data: existing } = await supabase
    .from('product_variants')
    .select('price, discount_price')
    .eq('id', probe.variantId)
    .maybeSingle()
  if (
    existing &&
    Number(existing.price) === probe.list &&
    Number(existing.discount_price) === salePrice(probe.list)
  ) {
    console.log('Fiyat listesi zaten uygulanmış, atlanıyor.')
    return
  }

  let ok = 0
  const errors: string[] = []

  for (const row of PRICE_ROWS) {
    const sale = salePrice(row.list)
    const { data: variant, error: readErr } = await supabase
      .from('product_variants')
      .select('id, product_id, label, variant_value, price')
      .eq('id', row.variantId)
      .maybeSingle()

    if (readErr || !variant) {
      errors.push(`${row.slug} ${row.size}: varyant bulunamadı`)
      continue
    }
    if (variant.product_id !== row.productId) {
      errors.push(`${row.slug} ${row.size}: product_id uyuşmuyor`)
      continue
    }

    const { error: updErr } = await supabase
      .from('product_variants')
      .update({
        price: row.list,
        discount_price: sale,
        compare_price: row.list,
      })
      .eq('id', row.variantId)
      .eq('product_id', row.productId)

    if (updErr) {
      errors.push(`${row.slug} ${row.size}: ${updErr.message}`)
      continue
    }
    ok += 1
  }

  // Varsayılan varyantın indirimli fiyatını products.base_price'a yaz
  const byProduct = new Map<string, PriceRow[]>()
  for (const row of PRICE_ROWS) {
    const list = byProduct.get(row.productId) ?? []
    list.push(row)
    byProduct.set(row.productId, list)
  }
  for (const [productId, rows] of byProduct) {
    const { data: def } = await supabase
      .from('product_variants')
      .select('id, is_default, discount_price, price')
      .eq('product_id', productId)
      .eq('is_default', true)
      .maybeSingle()
    const target = def
      ? rows.find((r) => r.variantId === def.id)
      : rows[0]
    if (!target) continue
    await supabase
      .from('products')
      .update({ base_price: salePrice(target.list) })
      .eq('id', productId)
  }

  console.log(`Güncellenen varyant: ${ok}/${PRICE_ROWS.length}`)
  if (errors.length) {
    console.error('Hatalar:')
    for (const e of errors) console.error(' -', e)
    process.exit(1)
  }
}

async function main() {
  const applyFlag = process.argv.includes('--apply')
  const quiet = process.argv.includes('--quiet')
  if (!quiet) printTable()
  if (!applyFlag) {
    console.log('\nCanlıya yazmak için: npx tsx scripts/oct-2026-price-list.ts --apply')
    return
  }
  await loadEnv()
  await apply()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
