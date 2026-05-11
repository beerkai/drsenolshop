import { requireAdmin } from '@/lib/admin-auth'
import { getDashboardStatsV2 } from '@/lib/admin-data'
import { getDailyLog, listRecentDailyLogs } from '@/lib/daily-log'
import { formatPrice } from '@/types'
import JournalEditor from './JournalEditor'

function todayHuman() {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function dateHuman(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default async function GunlukPage() {
  const ctx = await requireAdmin()

  const [stats, todayLog, recent] = await Promise.all([
    getDashboardStatsV2(),
    getDailyLog(ctx.admin.email),
    listRecentDailyLogs(ctx.admin.email, 10),
  ])

  const todayKey = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Günlük</p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: '0 0 8px' }}
        >
          <span style={{ color: 'var(--ad-fg)' }}>Bugün —</span>{' '}
          <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400 }}>{todayHuman()}</span>
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: 0 }}>
          Patronun serbest notları + özelleştirilebilir mini metrikler. Her admin için günde bir kayıt.
        </p>
      </div>

      <div className="gunluk-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <style>{`
          @media (max-width: 980px) { .gunluk-layout { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Sol — Editor */}
        <JournalEditor
          initialNotes={todayLog?.notes ?? ''}
          initialMetrics={todayLog?.metrics ?? {}}
          lastSavedAt={todayLog?.updated_at ?? todayLog?.created_at ?? null}
        />

        {/* Sağ — Bugünün özeti + geçmiş */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ad-card">
            <p className="ad-eyebrow-muted" style={{ marginBottom: '18px' }}>Bugün · Sistemden</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatBlock label="Sipariş" value={String(stats.today.orders)} />
              <StatBlock label="Ciro" value={formatPrice(stats.today.revenue)} gold />
              <StatBlock
                label="Bekleyen"
                value={String(stats.pending)}
                accent={stats.pending > 0 ? 'warning' : undefined}
              />
              <hr className="ad-divider" />
              <StatBlock
                label="Düşük Stok"
                value={`${stats.lowStock} varyant`}
                accent={stats.lowStock > 0 ? 'danger' : undefined}
                small
              />
            </div>
          </div>

          {recent.filter((l) => l.log_date !== todayKey).length > 0 && (
            <div className="ad-card">
              <p className="ad-eyebrow-muted" style={{ marginBottom: '14px' }}>Son Günler</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {recent
                  .filter((l) => l.log_date !== todayKey)
                  .slice(0, 8)
                  .map((l) => {
                    const metricCount = Object.keys(l.metrics ?? {}).length
                    const hasNotes = (l.notes ?? '').trim().length > 0
                    return (
                      <div
                        key={l.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          borderBottom: '1px solid var(--ad-line-faint)',
                        }}
                      >
                        <span
                          className="ad-mono"
                          style={{
                            fontSize: '10.5px',
                            color: 'var(--ad-fg-muted)',
                            letterSpacing: '0.05em',
                            minWidth: '92px',
                          }}
                        >
                          {dateHuman(l.log_date)}
                        </span>
                        <span style={{ flex: 1, minWidth: 0, color: 'var(--ad-fg)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {hasNotes
                            ? (l.notes ?? '').slice(0, 60) + ((l.notes ?? '').length > 60 ? '…' : '')
                            : <span style={{ color: 'var(--ad-fg-faint)', fontStyle: 'italic' }}>not yok</span>}
                        </span>
                        {metricCount > 0 && (
                          <span
                            className="ad-mono"
                            style={{
                              fontSize: '10px',
                              color: 'var(--ad-gold-deep)',
                              backgroundColor: 'var(--ad-gold-faint)',
                              padding: '2px 6px',
                              letterSpacing: '0.08em',
                            }}
                          >
                            {metricCount}
                          </span>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  gold,
  accent,
  small,
}: {
  label: string
  value: string
  gold?: boolean
  accent?: 'warning' | 'danger'
  small?: boolean
}) {
  const color = gold
    ? 'var(--ad-gold-deep)'
    : accent === 'warning'
      ? 'var(--ad-warning)'
      : accent === 'danger'
        ? 'var(--ad-danger)'
        : 'var(--ad-fg)'
  return (
    <div>
      <p className="ad-mono" style={{ fontSize: '9.5px', letterSpacing: '0.25em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p className="ad-display" style={{ fontSize: small ? '20px' : '28px', fontWeight: 500, lineHeight: 1, margin: 0, color }}>
        {value}
      </p>
    </div>
  )
}
