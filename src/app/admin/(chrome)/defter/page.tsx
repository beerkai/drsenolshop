import { requireAdmin } from '@/lib/admin-auth'
import { getLedgerSummary, listLedgerEntries, listEmployees } from '@/lib/ledger'
import { todayKeyTR } from '@/lib/datetime'
import { DefterClient } from './DefterClient'

type SP = Promise<{ date?: string; q?: string; filter?: 'all' | 'unpaid-customer' | 'unpaid-guide' | 'cash' | 'card' }>

export default async function DefterPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const date = sp.date ?? todayKeyTR()
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
