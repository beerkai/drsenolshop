// ═══════════════════════════════════════════════════════════════
// Canlı orders şeması kodun beklediği kolonun gerisinde kalırsa
// (PostgREST: Could not find the '…' column … schema cache)
// o kolonu payload'dan çıkarıp yazmayı bir kez daha dener.
// Çekirdek alanlar (tutar, durum, adres) durur; eksik olan yalnız
// sonradan eklenen metadata kolonlarıdır.
// ═══════════════════════════════════════════════════════════════

export function missingColumnFromPostgrest(message: string | undefined): string | null {
  if (!message) return null
  const match = message.match(/Could not find the '([^']+)' column/)
  return match ? match[1] : null
}

type WriteError = { message: string } | null

export async function retryWithoutMissingColumns<T>(
  payload: Record<string, unknown>,
  run: (payload: Record<string, unknown>) => PromiseLike<{ data: T | null; error: WriteError }>,
): Promise<{ data: T | null; error: WriteError; dropped: string[] }> {
  const current: Record<string, unknown> = { ...payload }
  const dropped: string[] = []
  let last: { data: T | null; error: WriteError } = { data: null, error: null }

  for (let attempt = 0; attempt < 6; attempt++) {
    last = await run(current)
    if (!last.error) return { data: last.data, error: null, dropped }
    const column = missingColumnFromPostgrest(last.error.message)
    if (!column || !(column in current)) {
      return { data: last.data, error: last.error, dropped }
    }
    delete current[column]
    dropped.push(column)
  }

  return { data: last.data, error: last.error, dropped }
}
