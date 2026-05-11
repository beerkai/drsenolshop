import { requireAdmin } from '@/lib/admin-auth'
import { getDashboardStatsV2 } from '@/lib/admin-data'
import { formatPrice } from '@/types'
import { Badge } from '@/components/admin/ui/Badge'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { IconJournal } from '@/components/admin/ui/Icon'

function todayHuman() {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function GunlukPage() {
  await requireAdmin()
  const stats = await getDashboardStatsV2()

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Günlük</p>
          <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: '0 0 8px' }}>
            <span style={{ color: 'var(--ad-fg)' }}>Bugün —</span>{' '}
            <span style={{ color: 'var(--ad-gold-deep)', fontStyle: 'italic', fontWeight: 400 }}>{todayHuman()}</span>
          </h1>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: 0 }}>
            Patronun günlük notları ve özelleştirilebilir mini metrikler. <Badge tone="gold">v0.4 · placeholder</Badge>
          </p>
        </div>
      </div>

      <div className="gunluk-layout" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
        <style>{`
          @media (max-width: 900px) { .gunluk-layout { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* Sol — günlük not alanı */}
        <div className="ad-card">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p className="ad-eyebrow-muted">Notlar</p>
            <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.1em' }}>
              taslak · kaydetme henüz aktif değil
            </span>
          </div>

          <EmptyState
            icon={<IconJournal size={36} />}
            title="Günlük alanı yakında yapılandırılacak."
            hint="Buraya patronun gün içinde tutmak istediği serbest notlar, anekdotlar, hatırlatmalar gelecek. Bir sonraki iterasyonda DB'ye bağlanacak."
          />

          {/* Placeholder data slot'ları */}
          <div style={{ marginTop: '32px' }}>
            <p className="ad-eyebrow-muted" style={{ marginBottom: '14px' }}>Mini Metrikler (özelleştirilecek)</p>
            <div className="mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <style>{`
                @media (max-width: 640px) { .mini-grid { grid-template-columns: 1fr !important; } }
              `}</style>
              <SlotPlaceholder label="Kovan sağlık skoru" hint="0 / 100" />
              <SlotPlaceholder label="Günün hedefi" hint="—" />
              <SlotPlaceholder label="Hava / üretim notu" hint="—" />
            </div>
          </div>
        </div>

        {/* Sağ — bugünün sistem özeti */}
        <div className="ad-card">
          <p className="ad-eyebrow-muted" style={{ marginBottom: '20px' }}>Bugün · Sistemden</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9.5px', letterSpacing: '0.25em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Sipariş
              </p>
              <p className="ad-display" style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1, margin: 0, color: 'var(--ad-fg)' }}>
                {stats.today.orders}
              </p>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9.5px', letterSpacing: '0.25em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Ciro
              </p>
              <p className="ad-display" style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1, margin: 0, color: 'var(--ad-gold-deep)' }}>
                {formatPrice(stats.today.revenue)}
              </p>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9.5px', letterSpacing: '0.25em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Bekleyen
              </p>
              <p className="ad-display" style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1, margin: 0, color: stats.pending > 0 ? 'var(--ad-warning)' : 'var(--ad-fg)' }}>
                {stats.pending}
              </p>
            </div>

            <hr className="ad-divider" />

            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9.5px', letterSpacing: '0.25em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Düşük Stok
              </p>
              <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: 0 }}>
                <strong style={{ color: stats.lowStock > 0 ? 'var(--ad-danger)' : 'var(--ad-fg)' }}>{stats.lowStock}</strong> varyant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlotPlaceholder({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{ padding: '14px', border: '1px dashed var(--ad-line)', backgroundColor: 'var(--ad-surface-2)' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9.5px', letterSpacing: '0.22em', color: 'var(--ad-fg-faint)', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '20px', color: 'var(--ad-fg-muted)', fontStyle: 'italic', margin: 0 }}>
        {hint}
      </p>
    </div>
  )
}
