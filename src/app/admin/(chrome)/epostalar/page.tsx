import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { isEmailConfigured } from '@/lib/email'
import { listEmailTemplates } from '@/lib/email-template-catalog'
import { Badge } from '@/components/admin/ui/Badge'
import EmailGalleryClient from './EmailGalleryClient'

export default async function AdminEmailGalleryPage() {
  await requireAdmin()

  const templates = listEmailTemplates()
  const resendOk = isEmailConfigured()
  const telegramOk =
    Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()) && Boolean(process.env.TELEGRAM_CHAT_ID?.trim())

  const resendCount = templates.filter((t) => t.channel === 'resend').length
  const authCount = templates.filter((t) => t.channel === 'supabase_auth').length

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>İletişim</p>
        <h1
          className="ad-display"
          style={{
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.1,
            color: 'var(--ad-fg)',
            margin: 0,
          }}
        >
          E-posta şablon galerisi
        </h1>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0', maxWidth: '640px', lineHeight: 1.65 }}>
          Sipariş ve auth e-postalarının tek tip editoryal tasarımı (bone / gold / mono). Canlı HTML önizleme,
          Supabase yapıştırma notları ve Resend tetikleyicileri.
        </p>
      </div>

      <div
        className="ad-card"
        style={{
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <Stat label="Toplam şablon" value={String(templates.length)} />
        <Stat label="Resend (işlem)" value={String(resendCount)} badge={resendOk ? 'Aktif' : 'Env eksik'} badgeOk={resendOk} />
        <Stat label="Supabase Auth" value={String(authCount)} badge="Dashboard" badgeOk />
        <Stat label="Telegram" value={telegramOk ? 'Bağlı' : 'Env eksik'} badge={telegramOk ? 'OK' : '—'} badgeOk={telegramOk} />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '10px' }}>Tasarım sistemi</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <Swatch label="Bone arka plan" hex="#F4F0E8" />
          <Swatch label="Ink metin" hex="#1A1714" />
          <Swatch label="Gold vurgu" hex="#C9A961" />
          <Swatch label="Muted gövde" hex="#6B6258" />
        </div>
        <p style={{ margin: '14px 0 0', fontSize: '12px', lineHeight: 1.65, color: 'var(--ad-fg-muted)' }}>
          İşlem mailleri <code>src/lib/email.ts</code> içindeki <code>emailLayout</code> ile üretilir.
          Auth şablonları <code>supabase/email-templates/</code> klasöründen okunur —{' '}
          <Link href="/admin/ayarlar" style={{ color: 'var(--ad-gold-deep)' }}>
            Ayarlar
          </Link>{' '}
          sayfasından env durumunu kontrol edin.
        </p>
      </div>

      <EmailGalleryClient templates={templates} />
    </div>
  )
}

function Stat({
  label,
  value,
  badge,
  badgeOk,
}: {
  label: string
  value: string
  badge?: string
  badgeOk?: boolean
}) {
  return (
    <div>
      <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: 500, color: 'var(--ad-fg)' }}>{value}</p>
      {badge && (
        <div style={{ marginTop: '8px' }}>
          <Badge tone={badgeOk ? 'success' : 'neutral'} bracketed>
            {badge}
          </Badge>
        </div>
      )}
    </div>
  )
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ width: '36px', height: '36px', backgroundColor: hex, border: '1px solid var(--ad-line-faint)', flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--ad-fg)' }}>{label}</p>
        <p className="ad-mono" style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--ad-fg-muted)' }}>{hex}</p>
      </div>
    </div>
  )
}
