// Görsel durumunu raporla: kaçı Supabase'de, kaçı hala ikas'ta, disk kullanımı

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

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, images')

  if (error) {
    console.error('Ürünler çekilemedi:', error.message)
    process.exit(1)
  }

  let totalImages = 0
  let supabaseImages = 0
  let ikasImages = 0
  let noImages = 0

  for (const p of products ?? []) {
    const imgs: string[] = p.images ?? []
    if (imgs.length === 0) { noImages++; continue }
    totalImages += imgs.length
    for (const url of imgs) {
      if (url.includes('supabase.co')) supabaseImages++
      else if (url.includes('cdn.myikas.com')) ikasImages++
    }
  }

  // Storage disk kullanımı
  const { data: storageFiles } = await supabase.storage.from('products').list('', {
    limit: 1000,
    offset: 0,
  })
  let totalBytes = 0
  for (const file of storageFiles ?? []) {
    if (file.metadata?.size) totalBytes += file.metadata.size
  }

  console.log('\n──── Görsel Durum Raporu ────')
  console.log(`Ürün sayısı        : ${(products ?? []).length}`)
  console.log(`Görselsiz ürün     : ${noImages}`)
  console.log(`Toplam görsel URL  : ${totalImages}`)
  console.log(`  → Supabase'de    : ${supabaseImages}`)
  console.log(`  → ikas CDN'de    : ${ikasImages}`)
  if (ikasImages > 0) {
    console.log('\n  ⚠️  ikas CDN görselleri var! npm run migrate:images -- --confirm ile migrate et.')
  } else {
    console.log('\n  ✓ Tüm görseller Supabase\'de.')
  }
  if (totalBytes > 0) {
    console.log(`\nStorage disk kullanımı: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
  }
}

run().catch((err) => {
  console.error('Beklenmedik hata:', err)
  process.exit(1)
})
