import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getBankInfo } from '@/lib/site-settings'
import { getBroadcastChatIds } from '@/lib/telegram'
import { isEmailConfigured } from '@/lib/email'
import { Badge } from '@/components/admin/ui/Badge'
import BankInfoForm from './BankInfoForm'
import TelegramTestPanel from './TelegramTestPanel'
import BroadcastPanel from './BroadcastPanel'
import AdminsPanel from './AdminsPanel'

export default async function AdminSettingsPage() {
  const ctx = await requireAdmin()
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()) && Boolean(process.env.TELEGRAM_CHAT_ID?.trim())
  const emailConfigured = isEmailConfigured()
  const adminHostsRaw = process.env.ADMIN_HOSTS?.trim() ?? '(kısıt yok)'
  const broadcastIds = getBroadcastChatIds()

  const [bankInfo, admins] = await Promise.all([
    getBankInfo(),
    ctx.admin.role === 'owner'
      ? getSupabaseAdmin()
          .from('admin_users')
          .select('id, email, full_name, role, is_active, last_login_at, created_at')
          .order('created_at', { ascending: true })
          .then((r) => (r.data ?? []) as Array<{ id: string; email: string; full_name: string | null; role: 'owner' | 'staff'; is_active: boolean; last_login_at: string | null; created_at: string }>)
      : Promise.resolve([]),
  ])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Sistem</p>
        <h1 className="ad-display" style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, color: 'var(--ad-fg)', margin: 0 }}>
          Ayarlar
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Banka bilgileri, telegram bağlantısı, admin yönetimi.
        </p>
      </div>

      {/* Hesap özeti */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Aktif Hesap</p>
        <KV label="E-mail" value={ctx.admin.email} />
        <KV label="Ad" value={ctx.admin.full_name ?? '—'} />
        <KV label="Rol" value={<Badge tone="gold" bracketed>{ctx.admin.role}</Badge>} />
      </div>

      {/* Banka bilgileri */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Banka Bilgileri</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Havale ödemeli sipariş onay sayfasında gösterilir.
        </p>
        <BankInfoForm initial={bankInfo} />
      </div>

      {/* Telegram bot */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Telegram Bot</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Yeni sipariş geldiğinde bildirim gönderir. /yeni /durum /stok /defter /satis vs. komutlarına yanıt verir.
        </p>
        <TelegramTestPanel configured={telegramConfigured} />
      </div>

      {/* E-posta servisi (Resend) */}
      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>E-posta Bildirimleri</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Sipariş onayı + durum güncellemeleri için Resend kullanılır.
          Şu durumlarda mail gider: yeni sipariş alındı, ödendi, hazırlanıyor, kargoda, teslim edildi, iptal edildi.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
          <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Durum</span>
          {emailConfigured ? (
            <Badge tone="success" bracketed>Aktif</Badge>
          ) : (
            <Badge tone="neutral" bracketed>RESEND_API_KEY eksik</Badge>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
          <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gönderen</span>
          <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>
            {process.env.RESEND_FROM_EMAIL ?? 'siparis@drsenolnaturalhoney.shop (default)'}
          </span>
        </div>
        {!emailConfigured && (
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '12px', letterSpacing: '0.05em', lineHeight: 1.6 }}>
            Aktive etmek için Vercel env&apos;e <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>RESEND_API_KEY</code> ekle.
            <br />
            Opsiyonel: <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>RESEND_FROM_EMAIL</code>,{' '}
            <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>RESEND_FROM_NAME</code>,{' '}
            <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>RESEND_REPLY_TO</code>.
          </p>
        )}
      </div>

      {/* Duyuru gönderme */}
      {telegramConfigured && (
        <div className="ad-card" style={{ marginBottom: '20px' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Duyuru Gönder</p>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
            Tüm yetkili Telegram chat&apos;lerine ({broadcastIds.length} alıcı) duyuru atar. Yetki listesi
            <code style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: 'var(--ad-gold-deep)', backgroundColor: 'var(--ad-gold-faint)', padding: '1px 5px', marginLeft: '4px' }}>TELEGRAM_ADMIN_IDS</code> env&apos;i ile yönetilir.
          </p>
          <BroadcastPanel recipientCount={broadcastIds.length} />
        </div>
      )}

      {/* Admin yönetimi (sadece owner) */}
      {ctx.admin.role === 'owner' && (
        <div className="ad-card" style={{ marginBottom: '20px' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Admin Yönetimi</p>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
            Yeni admin email&apos;i ekledikten sonra Supabase Authentication&apos;dan o email için kullanıcı + şifre oluşturmayı unutma.
          </p>
          <AdminsPanel currentAdminId={ctx.admin.id} initialAdmins={admins} />
        </div>
      )}

      {/* Güvenlik özeti */}
      <div className="ad-card">
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Güvenlik</p>
        <KV
          label="Admin Host Kısıtı"
          value={<span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>{adminHostsRaw}</span>}
        />
        <KV
          label="RLS · admin_users"
          value={<Badge tone="success" bracketed>Aktif</Badge>}
        />
        <KV
          label="RLS · ledger / daily_logs / site_settings"
          value={<Badge tone="success" bracketed>Aktif</Badge>}
        />
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
      <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: 'var(--ad-fg)', fontSize: '13px', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
