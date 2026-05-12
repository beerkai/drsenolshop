import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listArchiveYears, listArchiveMonths, listArchiveDays, type PeriodSummary } from '@/lib/ledger'
import { formatPrice } from '@/types'
import { Badge } from '@/components/admin/ui/Badge'
import { EmptyState } from '@/components/admin/ui/EmptyState'

type SP = Promise<{ year?: string; month?: string }>

export default async function DefterArsivPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const year = sp.year ? Number(sp.year) : null
  const month = sp.month ? Number(sp.month) : null

  // 3 mod
  let mode: 'years' | 'months' | 'days' = 'years'
  let summaries: PeriodSummary[] = []
  let crumb: Array<{ label: string; href?: string }> = [{ label: 'Defter', href: '/admin/defter' }, { label: 'Arşiv' }]

  if (year && month) {
    mode = 'days'
    summaries = await listArchiveDays(year, month)
    crumb = [
      { label: 'Defter', href: '/admin/defter' },
      { label: 'Arşiv', href: '/admin/defter/arsiv' },
      { label: String(year), href: `/admin/defter/arsiv?year=${year}` },
      { label: monthName(month) },
    ]
  } else if (year) {
    mode = 'months'
    summaries = await listArchiveMonths(year)
    crumb = [
      { label: 'Defter', href: '/admin/defter' },
      { label: 'Arşiv', href: '/admin/defter/arsiv' },
      { label: String(year) },
    ]
  } else {
    summaries = await listArchiveYears()
  }

  // Toplam (üst metrik için)
  const totals = summaries.reduce(
    (acc, s) => ({
      entryCount: acc.entryCount + s.entryCount,
      totalSale: acc.totalSale + s.totalSale,
      cashSale: acc.cashSale + s.cashSale,
      cardSale: acc.cardSale + s.cardSale,
      guideTotal: acc.guideTotal + s.guideTotal,
      unpaidCustomers: acc.unpaidCustomers + s.unpaidCustomers,
      unpaidGuides: acc.unpaidGuides + s.unpaidGuides,
    }),
    { entryCount: 0, totalSale: 0, cashSale: 0, cardSale: 0, guideTotal: 0, unpaidCustomers: 0, unpaidGuides: 0 }
  )

  return (
    <div>
      {/* Mini breadcrumb */}
      <nav style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {crumb.map((c, i) => {
          const isLast = i === crumb.length - 1
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {c.href && !isLast ? (
                <Link href={c.href} className="ad-mono" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ad-fg-muted)', textTransform: 'uppercase', textDecoration: 'none' }}>
                  {c.label}
                </Link>
              ) : (
                <span className="ad-mono" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ad-fg)', textTransform: 'uppercase', fontWeight: 500 }}>
                  {c.label}
                </span>
              )}
              {!isLast && <span style={{ color: 'var(--ad-line)' }}>›</span>}
            </span>
          )
        })}
      </nav>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Defter · Arşiv</p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
            {mode === 'years' && 'Tüm Yıllar'}
            {mode === 'months' && (
              <>
                <span>{year} </span>
                <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400 }}>· Aylık</span>
              </>
            )}
            {mode === 'days' && (
              <>
                <span>{monthName(month!)} {year} </span>
                <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400 }}>· Günlük</span>
              </>
            )}
          </h1>
        </div>

        {/* CSV indir — seçili dönemi kapsar */}
        {(mode === 'months' || mode === 'days') && (
          <a
            href={(() => {
              if (mode === 'days' && year && month) {
                const last = new Date(year, month, 0).getDate()
                const mm = String(month).padStart(2, '0')
                return `/api/admin/defter/export?from=${year}-${mm}-01&to=${year}-${mm}-${String(last).padStart(2, '0')}`
              }
              if (mode === 'months' && year) {
                return `/api/admin/defter/export?from=${year}-01-01&to=${year}-12-31`
              }
              return '#'
            })()}
            className="ad-btn ad-btn-secondary ad-btn-sm"
            download
            title="Bu dönemin tüm kayıtlarını CSV olarak indir"
          >
            CSV İndir
          </a>
        )}
      </div>

      {/* Toplam metrik */}
      {summaries.length > 0 && (
        <div className="archive-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <style>{`
            @media (max-width: 900px) { .archive-totals { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .archive-totals { grid-template-columns: 1fr !important; } }
          `}</style>
          <Metric label="Kayıt" value={String(totals.entryCount)} />
          <Metric label="Ciro" value={formatPrice(totals.totalSale)} gold />
          <Metric label="Kart / Nakit" value={
            <span style={{ fontSize: '20px' }}>
              <span style={{ color: 'var(--ad-info)' }}>{formatPrice(totals.cardSale)}</span>{' '}
              <span style={{ color: 'var(--ad-fg-faint)', fontSize: '12px' }}>/</span>{' '}
              <span style={{ color: 'var(--ad-success)' }}>{formatPrice(totals.cashSale)}</span>
            </span>
          } />
          <Metric label="Rehber Toplamı" value={formatPrice(totals.guideTotal)} small />
        </div>
      )}

      {summaries.length === 0 ? (
        <EmptyState
          title={mode === 'years' ? 'Henüz hiç defter kaydı yok.' : 'Bu dönem için kayıt yok.'}
          hint={mode !== 'years' ? 'Başka bir dönem dene.' : undefined}
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>{mode === 'years' ? 'Yıl' : mode === 'months' ? 'Ay' : 'Gün'}</th>
                <th className="is-right">Kayıt</th>
                <th className="is-right">Ciro</th>
                <th className="is-right">Kart</th>
                <th className="is-right">Nakit</th>
                <th className="is-right">Rehber</th>
                <th>Ödenmemiş</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => {
                const href = buildHref(mode, year, month, s.key)
                return (
                  <tr key={s.key}>
                    <td>
                      <Link
                        href={href}
                        style={{
                          fontFamily: mode === 'days' ? undefined : 'var(--font-jetbrains), monospace',
                          fontSize: mode === 'days' ? '13px' : '15px',
                          color: 'var(--ad-fg)',
                          textDecoration: 'none',
                          fontWeight: 500,
                          letterSpacing: mode === 'days' ? undefined : '0.05em',
                        }}
                      >
                        {s.label}
                      </Link>
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '13px', color: 'var(--ad-fg-muted)' }}>
                      {s.entryCount}
                    </td>
                    <td className="is-right">
                      <span className="ad-display" style={{ fontSize: '17px', fontWeight: 500, color: 'var(--ad-gold-deep)' }}>
                        {formatPrice(s.totalSale)}
                      </span>
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: 'var(--ad-info)' }}>
                      {s.cardSale > 0 ? formatPrice(s.cardSale) : '—'}
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: 'var(--ad-success)' }}>
                      {s.cashSale > 0 ? formatPrice(s.cashSale) : '—'}
                    </td>
                    <td className="is-right ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg-muted)' }}>
                      {s.guideTotal > 0 ? formatPrice(s.guideTotal) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {s.unpaidCustomers > 0 && (
                          <Badge tone="warning" bracketed>{s.unpaidCustomers} müşt.</Badge>
                        )}
                        {s.unpaidGuides > 0 && (
                          <Badge tone="warning" bracketed>{s.unpaidGuides} reh.</Badge>
                        )}
                        {s.unpaidCustomers === 0 && s.unpaidGuides === 0 && (
                          <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-success)', letterSpacing: '0.1em' }}>
                            ✓ TAMAM
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="ad-mono" style={{ marginTop: '16px', fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
        {mode === 'years' && 'Yıla tıklayınca aylık özet açılır.'}
        {mode === 'months' && 'Aya tıklayınca günlük dökümü açılır.'}
        {mode === 'days' && 'Güne tıklayınca defterde o günü görüntülersin.'}
      </p>
    </div>
  )
}

function monthName(m: number) {
  return ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][m - 1] ?? String(m)
}

function buildHref(mode: 'years' | 'months' | 'days', year: number | null, month: number | null, key: string): string {
  if (mode === 'years') return `/admin/defter/arsiv?year=${key}`
  if (mode === 'months') {
    // key = "2026-05"
    const [y, mo] = key.split('-')
    return `/admin/defter/arsiv?year=${y}&month=${Number(mo)}`
  }
  // days: tek güne git
  return `/admin/defter?date=${key}`
}

function Metric({ label, value, gold, small }: { label: string; value: React.ReactNode; gold?: boolean; small?: boolean }) {
  return (
    <div className="ad-metric">
      <p className="ad-metric-label">{label}</p>
      <p className="ad-metric-value" style={{ fontSize: small ? '22px' : undefined, color: gold ? 'var(--ad-gold-deep)' : undefined }}>
        {value}
      </p>
    </div>
  )
}
