import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listDaysInRange } from '@/lib/ledger'
import { formatPrice } from '@/types'
import { todayKeyTR, mondayOf, shiftDateKey } from '@/lib/datetime'
import { Badge } from '@/components/admin/ui/Badge'

type SP = Promise<{ from?: string }>

const TR_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

function humanRange(monday: string, sunday: string): string {
  const m = new Date(monday + 'T12:00:00')
  const s = new Date(sunday + 'T12:00:00')
  const sameMonth = m.getMonth() === s.getMonth()
  if (sameMonth) {
    return `${m.getDate()} – ${s.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  return `${m.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${s.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export default async function DefterHaftalikPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams

  // Default: bu hafta (verilen tarihten hangi haftaya düşüyorsa onun pazartesi)
  const refDate = sp.from || todayKeyTR()
  const monday = mondayOf(refDate)
  const sunday = shiftDateKey(monday, 6)

  const days = await listDaysInRange(monday, sunday)

  // Hafta toplamı
  const totals = days.reduce(
    (acc, d) => ({
      entryCount: acc.entryCount + d.entryCount,
      totalSale: acc.totalSale + d.totalSale,
      cashSale: acc.cashSale + d.cashSale,
      cardSale: acc.cardSale + d.cardSale,
      guideTotal: acc.guideTotal + d.guideTotal,
      unpaidCustomers: acc.unpaidCustomers + d.unpaidCustomers,
      unpaidGuides: acc.unpaidGuides + d.unpaidGuides,
    }),
    { entryCount: 0, totalSale: 0, cashSale: 0, cardSale: 0, guideTotal: 0, unpaidCustomers: 0, unpaidGuides: 0 }
  )

  const prevWeek = shiftDateKey(monday, -7)
  const nextWeek = shiftDateKey(monday, +7)
  const thisWeekMonday = mondayOf(todayKeyTR())
  const isThisWeek = monday === thisWeekMonday
  const today = todayKeyTR()

  return (
    <div>
      {/* Mini breadcrumb */}
      <nav style={{ marginBottom: '14px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Link href="/admin/defter" className="ad-mono" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ad-fg-muted)', textTransform: 'uppercase', textDecoration: 'none' }}>
          Defter
        </Link>
        <span style={{ color: 'var(--ad-line)' }}>›</span>
        <span className="ad-mono" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ad-fg)', textTransform: 'uppercase', fontWeight: 500 }}>
          Haftalık
        </span>
      </nav>

      {/* Başlık + hafta nav */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Defter · Haftalık Döküm</p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
            {isThisWeek ? <span>Bu Hafta</span> : <span style={{ color: 'var(--ad-fg-muted)' }}>Hafta</span>}
            <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400, marginLeft: '8px' }}>
              · {humanRange(monday, sunday)}
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href={`/admin/defter/hafta?from=${prevWeek}`}
            aria-label="Önceki hafta"
            className="ad-icon-btn"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            ‹
          </Link>
          <Link
            href={`/admin/defter/hafta?from=${nextWeek}`}
            aria-label="Sonraki hafta"
            className="ad-icon-btn"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            ›
          </Link>
          {!isThisWeek && (
            <Link href={`/admin/defter/hafta?from=${thisWeekMonday}`} className="ad-btn ad-btn-secondary ad-btn-sm">
              Bu haftaya dön
            </Link>
          )}
          <Link href="/admin/defter" className="ad-btn ad-btn-secondary ad-btn-sm">
            Defter
          </Link>
        </div>
      </div>

      {/* Hafta toplam metrikleri */}
      <div className="week-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <style>{`
          @media (max-width: 1024px) { .week-metrics { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px)  { .week-metrics { grid-template-columns: 1fr !important; } }
        `}</style>

        <Metric label="Hafta · Kayıt" value={String(totals.entryCount)} />
        <Metric
          label="Hafta · Ciro"
          gold
          value={
            totals.guideTotal > 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <span>{formatPrice(totals.totalSale)}</span>
                <span style={{ fontSize: '14px', color: 'var(--ad-fg-faint)' }}>/</span>
                <span style={{ color: 'var(--ad-fg)', fontSize: '20px' }}>
                  {formatPrice(totals.totalSale - totals.guideTotal)}
                </span>
                <span className="ad-mono" style={{ fontSize: '9.5px', color: 'var(--ad-fg-faint)', letterSpacing: '0.18em', textTransform: 'uppercase', alignSelf: 'center' }}>
                  net
                </span>
              </span>
            ) : (
              formatPrice(totals.totalSale)
            )
          }
          hint={totals.guideTotal > 0 ? `−${formatPrice(totals.guideTotal)} rehber komisyonu` : undefined}
        />
        <Metric
          label="Kart / Nakit"
          value={
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--ad-info)' }}>{formatPrice(totals.cardSale)}</span>
              <span style={{ color: 'var(--ad-fg-faint)', fontSize: '14px' }}>/</span>
              <span style={{ color: 'var(--ad-success)' }}>{formatPrice(totals.cashSale)}</span>
            </span>
          }
          small
        />
        <Metric
          label="Rehber Komisyonu"
          value={formatPrice(totals.guideTotal)}
          small
        />
      </div>

      {/* 7 gün grid */}
      <div className="week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        <style>{`
          @media (max-width: 1200px) { .week-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          @media (max-width: 768px)  { .week-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px)  { .week-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {days.map((d, idx) => {
          const isToday = d.key === today
          const isFuture = d.key > today
          const dayName = TR_DAYS[idx]
          const isSunday = idx === 6

          return (
            <Link
              key={d.key}
              href={`/admin/defter?date=${d.key}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '14px',
                backgroundColor: isToday ? 'var(--ad-gold-faint)' : 'var(--ad-surface)',
                border: isToday ? '1px solid var(--ad-gold)' : '1px solid var(--ad-line-faint)',
                textDecoration: 'none',
                minHeight: '160px',
                transition: 'all 120ms',
                position: 'relative',
                opacity: isFuture ? 0.55 : 1,
              }}
            >
              {/* Gün başlığı */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  className="ad-mono"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    color: isSunday ? 'var(--ad-gold-deep)' : 'var(--ad-fg-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {dayName}
                </span>
                <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)' }}>
                  {d.key.slice(8)}
                </span>
              </div>

              {/* Sayılar */}
              {d.entryCount === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {isFuture ? '—' : 'boş'}
                  </span>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <p className="ad-display" style={{ fontSize: '22px', fontWeight: 500, color: 'var(--ad-gold-deep)', margin: 0, lineHeight: 1 }}>
                      {formatPrice(d.totalSale)}
                    </p>
                    <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-muted)', marginTop: '4px', letterSpacing: '0.05em' }}>
                      {d.entryCount} kayıt
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {d.cardSale > 0 && (
                      <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-info)', letterSpacing: '0.05em' }}>
                        K {formatPrice(d.cardSale)}
                      </span>
                    )}
                    {d.cashSale > 0 && (
                      <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-success)', letterSpacing: '0.05em' }}>
                        N {formatPrice(d.cashSale)}
                      </span>
                    )}
                  </div>

                  {(d.unpaidCustomers > 0 || d.unpaidGuides > 0) && (
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {d.unpaidCustomers > 0 && (
                        <Badge tone="warning">⚠ {d.unpaidCustomers}m</Badge>
                      )}
                      {d.unpaidGuides > 0 && (
                        <Badge tone="warning">⚠ {d.unpaidGuides}r</Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <p className="ad-mono" style={{ marginTop: '16px', fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
        Güne tıklayınca o günün defteri açılır · K=kart N=nakit · Pazar altın renkte
      </p>
    </div>
  )
}

function Metric({ label, value, gold, small, hint }: { label: string; value: React.ReactNode; gold?: boolean; small?: boolean; hint?: string }) {
  return (
    <div className="ad-metric">
      <p className="ad-metric-label">{label}</p>
      <p className="ad-metric-value" style={{ fontSize: small ? '20px' : undefined, color: gold ? 'var(--ad-gold-deep)' : undefined, lineHeight: 1.1 }}>
        {value}
      </p>
      {hint && (
        <p className="ad-mono" style={{ margin: '8px 0 0', fontSize: '10px', letterSpacing: '0.05em', color: 'var(--ad-fg-faint)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
