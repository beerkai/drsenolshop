// ═══════════════════════════════════════════════════════════════
// 0016 + 0017 — orders metadata kolonları ve stok iade fonksiyonları
// Vercel build sırasında çalışır (SUPABASE_SERVICE_ROLE_KEY orada).
// DDL için postgres bağlantı dizesi veya Supabase SQL ucu gerekir.
// Sonuç site_settings.schema_apply_report içine yazılır.
// ═══════════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PROJECT_REF = 'afjjdslllhmoalyufabj'

const URL_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL',
  'SUPABASE_DB_URL',
  'DIRECT_URL',
]

function safe(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgres://***').slice(0, 500)
}

function sqlText(): string {
  const root = process.cwd()
  const paytr = readFileSync(resolve(root, 'supabase/migrations/0016_paytr_order_metadata.sql'), 'utf8')
  const stock = readFileSync(resolve(root, 'supabase/migrations/0017_stock_movement.sql'), 'utf8')
  return `${paytr}\n${stock}\nNOTIFY pgrst, 'reload schema';\n`
}

function connectionString(): { key: string; url: string } | null {
  for (const key of URL_KEYS) {
    const url = process.env[key]?.trim()
    if (url && /^postgres(ql)?:\/\//i.test(url)) return { key, url }
  }
  return null
}

async function runWithPg(url: string, sql: string): Promise<void> {
  const { Client } = await import('pg')
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
}

async function runWithHttp(sql: string, token: string): Promise<string> {
  const targets = [
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    `https://${PROJECT_REF}.supabase.co/pg/query`,
  ]
  const errors: string[] = []
  for (const endpoint of targets) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    const body = (await res.text()).slice(0, 300)
    if (res.ok) return endpoint
    errors.push(`${new URL(endpoint).host} ${res.status} ${body}`)
  }
  throw new Error(errors.join(' | '))
}

async function columnProbe(): Promise<Record<string, boolean>> {
  const { getSupabaseAdmin } = await import('../src/lib/supabase')
  const supabase = getSupabaseAdmin()
  const columns = ['coupon_code', 'coupon_consumed_at', 'stock_decremented_at', 'paid_at', 'paytr_response']
  const present: Record<string, boolean> = {}
  for (const column of columns) {
    const { error } = await supabase.from('orders').select(column).limit(1)
    present[column] = !error
  }
  return present
}

async function writeReport(value: Record<string, unknown>): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return
  const { getSupabaseAdmin } = await import('../src/lib/supabase')
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'schema_apply_report', value }, { onConflict: 'key' })
  if (error) console.error('[schema] rapor yazılamadı:', safe(error.message))
}

export async function applyOrderSchema(): Promise<Record<string, unknown>> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, method: 'none', error: 'SUPABASE_SERVICE_ROLE_KEY yok' }
  }

  const sql = sqlText()
  const foundUrl = connectionString()
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim() || ''
  let method = 'none'
  let applyError: string | null = null

  try {
    if (foundUrl) {
      method = foundUrl.key
      await runWithPg(foundUrl.url, sql)
    } else if (token) {
      method = 'supabase-api'
      await runWithHttp(sql, token)
    } else {
      method = 'service-role-http'
      await runWithHttp(sql, process.env.SUPABASE_SERVICE_ROLE_KEY.trim())
    }
  } catch (err) {
    applyError = safe(err)
    console.error('[schema] DDL uygulanamadı:', applyError)
  }

  let columns: Record<string, boolean> = {}
  try {
    columns = await columnProbe()
  } catch (err) {
    applyError = applyError ?? safe(err)
  }

  const ok = Object.values(columns).every(Boolean)
  const envNames = Object.keys(process.env).filter((key) =>
    /postgres|database_url|supabase|direct_url/i.test(key),
  )
  const report = {
    ok,
    method,
    error: applyError,
    columns,
    env_names: envNames,
    at: new Date().toISOString(),
  }
  await writeReport(report)
  console.log(`[schema] ok=${ok} method=${method} columns=${JSON.stringify(columns)}`)
  return report
}

const isCli = process.argv[1]?.includes('apply-order-schema')
if (isCli) {
  applyOrderSchema().catch(async (err) => {
    const message = safe(err)
    console.error('[schema] beklenmeyen hata:', message)
    await writeReport({ ok: false, method: 'crash', error: message, at: new Date().toISOString() }).catch(() => {})
    process.exit(0)
  })
}
