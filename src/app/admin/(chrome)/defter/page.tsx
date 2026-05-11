import { requireAdmin } from '@/lib/admin-auth'
import { getLedgerSummary, listLedgerEntries, listEmployees } from '@/lib/ledger'
import { DefterClient } from './DefterClient'

type SP = Promise<{ date?: string; q?: string; filter?: 'all' | 'unpaid-customer' | 'unpaid-guide' | 'cash' | 'card' }>

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DefterPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const date = sp.date ?? todayKey()
  const filter = sp.filter ?? 'all'
  const search = sp.q?.trim() || undefined

  const [summary, listing, employees] = await Promise.all([
    getLedgerSummary(date),
    listLedgerEntries({
      date,
      search,
      paymentMethod: filter === 'cash' || filter === 'card' ? filter : undefined,
      unpaidCustomerOnly: filter === 'unpaid-customer' || undefined,
      unpaidGuideOnly: filter === 'unpaid-guide' || undefined,
    }),
    listEmployees({ activeOnly: true }),
  ])

  return (
    <DefterClient
      date={date}
      filter={filter}
      search={search ?? ''}
      summary={summary}
      entries={listing.entries}
      total={listing.total}
      employees={employees}
    />
  )
}
