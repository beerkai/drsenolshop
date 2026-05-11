import { requireAdmin } from '@/lib/admin-auth'
import { Badge } from '@/components/admin/ui/Badge'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { IconSettings } from '@/components/admin/ui/Icon'

export default async function AdminSettingsPage() {
  const ctx = await requireAdmin()

  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim())
  const adminHostsRaw = process.env.ADMIN_HOSTS?.trim() ?? '(kısıt yok)'

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Sistem</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Ayarlar
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Yapılandırma ve entegrasyon özetleri. Düzenleme bir sonraki iterasyonda.
        </p>
      </div>

      {/* Hesap */}
      <div className="ad-card" style={{ marginBottom: '16px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Hesap</p>
        <KV label="E-mail" value={ctx.admin.email} />
        <KV label="Ad" value={ctx.admin.full_name ?? '—'} />
        <KV label="Rol" value={<Badge tone="gold" bracketed>{ctx.admin.role}</Badge>} />
      </div>

      {/* Entegrasyonlar */}
      <div className="ad-card" style={{ marginBottom: '16px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Entegrasyonlar</p>
        <KV
          label="Telegram Bot"
          value={
            telegramConfigured
              ? <Badge tone="success" bracketed>Bağlı</Badge>
              : <Badge tone="neutral" bracketed>Yapılandırılmamış</Badge>
          }
        />
        <KV
          label="Ödeme Sağlayıcı"
          value={<Badge tone="warning" bracketed>Iyzico bekleyen</Badge>}
        />
        <KV
          label="E-posta Servisi"
          value={<Badge tone="neutral" bracketed>Yok</Badge>}
        />
      </div>

      {/* Güvenlik */}
      <div className="ad-card" style={{ marginBottom: '16px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Güvenlik</p>
        <KV
          label="Admin Host Kısıtı"
          value={<span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>{adminHostsRaw}</span>}
        />
        <KV
          label="RLS · admin_users"
          value={<Badge tone="success" bracketed>Aktif</Badge>}
        />
      </div>

      {/* Yakında */}
      <EmptyState
        icon={<IconSettings size={32} />}
        title="Düzenleme arayüzü yakında geliyor."
        hint="Banka bilgileri, kargo eşiği, KDV varsayılan, admin ekle/çıkar, bot test gönderimi gibi düzenlemeler ileride buradan yapılacak."
      />
    </div>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '10px 0',
        borderBottom: '1px solid var(--ad-line-faint)',
      }}
    >
      <span
        className="ad-mono"
        style={{
          fontSize: '11px',
          color: 'var(--ad-fg-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--ad-fg)', fontSize: '13px', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
