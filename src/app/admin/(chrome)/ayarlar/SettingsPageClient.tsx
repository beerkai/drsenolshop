'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AyarlarPagePayload } from '@/lib/admin-ayarlar-data'
import { Badge } from '@/components/admin/ui/Badge'
import BankInfoForm from './BankInfoForm'
import ShippingForm from './ShippingForm'
import TelegramTestPanel from './TelegramTestPanel'
import BroadcastPanel from './BroadcastPanel'
import AdminsPanel from './AdminsPanel'
import ComparePriceBackfillButton from './ComparePriceBackfillButton'

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="ad-kv">
      <span className="ad-mono ad-kv-label">{label}</span>
      <span className="ad-kv-value">{value}</span>
    </div>
  )
}

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      data-ad-page-title
      className="ad-page-title"
      style={{
        display: 'block',
        fontSize: '28px',
        fontWeight: 500,
        lineHeight: '34px',
        minHeight: '34px',
        color: '#1A1916',
        margin: '8px 0 0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </p>
  )
}

export default function SettingsPageClient() {
  const [data, setData] = useState<AyarlarPagePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/ayarlar/bootstrap', { credentials: 'include', cache: 'no-store' })
        const json = (await res.json()) as { ok?: boolean; message?: string; data?: AyarlarPagePayload }
        if (cancelled) return
        if (!res.ok || !json.ok || !json.data) {
          setError(json.message ?? 'Ayarlar yüklenemedi.')
          return
        }
        setData(json.data)
      } catch {
        if (!cancelled) setError('Sunucuya bağlanılamadı.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="ad-card" style={{ padding: 20 }}>
        <p style={{ margin: '0 0 12px', color: 'var(--ad-danger)' }}>{error}</p>
        <button type="button" className="ad-btn ad-btn-primary" onClick={() => window.location.reload()}>
          Yeniden dene
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Sistem</p>
        <PageTitle>Ayarlar</PageTitle>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Banka bilgileri, telegram bağlantısı, admin yönetimi.
        </p>
        <div className="ad-card" style={{ marginTop: 20, padding: 24, color: 'var(--ad-fg-muted)' }}>
          Yükleniyor…
        </div>
      </div>
    )
  }

  const {
    admin,
    bankInfo,
    shippingConfig,
    telegramConfigured,
    emailConfigured,
    paytrConfigured,
    paytrTestMode,
    adminHostsRaw,
    broadcastRecipientCount,
    resendFromEmail,
    admins,
  } = data

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p className="ad-eyebrow" style={{ marginBottom: '12px' }}>Sistem</p>
        <PageTitle>Ayarlar</PageTitle>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '13px', margin: '8px 0 0' }}>
          Banka bilgileri, telegram bağlantısı, admin yönetimi.
        </p>
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Aktif Hesap</p>
        <KV label="E-mail" value={admin.email} />
        <KV label="Ad" value={admin.full_name ?? '—'} />
        <KV label="Rol" value={<Badge tone="gold" bracketed>{admin.role}</Badge>} />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Banka Bilgileri</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Havale ödemeli sipariş onay sayfasında gösterilir.
        </p>
        <BankInfoForm initial={bankInfo} />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Kargo Ücreti</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Sepet tutarına göre uygulanan sabit kargo + ücretsiz kargo eşiği. Checkout&apos;ta görünür.
        </p>
        <ShippingForm initial={shippingConfig} />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Katalog · Liste Fiyatı</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Yalnızca <strong>indirimli varyantlarda</strong> liste fiyatını (<code>compare_price</code> = satış
          fiyatı) günceller. Yapay %12 referans fiyat artık uygulanmaz.
        </p>
        <ComparePriceBackfillButton />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>PayTR · Kart ile Ödeme</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          PayTR iframe API entegrasyonu. Yapılandırılınca checkout&apos;ta &quot;Kredi / Banka Kartı&quot; seçeneği görünür.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
          <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Durum</span>
          {paytrConfigured ? (
            paytrTestMode
              ? <Badge tone="gold" bracketed>Aktif · TEST MODE</Badge>
              : <Badge tone="success" bracketed>Aktif · CANLI</Badge>
          ) : (
            <Badge tone="neutral" bracketed>Env eksik</Badge>
          )}
        </div>
        {!paytrConfigured && (
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '12px', letterSpacing: '0.05em', lineHeight: 1.8 }}>
            Aktive etmek için Vercel env&apos;e ekle:<br />
            <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>PAYTR_MERCHANT_ID</code>,{' '}
            <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>PAYTR_MERCHANT_KEY</code>,{' '}
            <code style={{ background: 'var(--ad-surface-2)', padding: '1px 5px' }}>PAYTR_MERCHANT_SALT</code>
          </p>
        )}
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Telegram Bot</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Yeni sipariş, ödeme ve stok geçişi bildirir.
        </p>
        <TelegramTestPanel configured={telegramConfigured} />
      </div>

      <div className="ad-card" style={{ marginBottom: '20px' }}>
        <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>E-posta Bildirimleri</p>
        <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
          Sipariş durum mailleri için Resend.{' '}
          <Link href="/admin/epostalar" style={{ color: 'var(--ad-gold-deep)' }}>
            E-posta şablon galerisi →
          </Link>
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
          <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>{resendFromEmail}</span>
        </div>
      </div>

      {telegramConfigured && (
        <div className="ad-card" style={{ marginBottom: '20px' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Duyuru Gönder</p>
          <p style={{ color: 'var(--ad-fg-muted)', fontSize: '12px', margin: '0 0 16px' }}>
            {broadcastRecipientCount} alıcı
          </p>
          <BroadcastPanel recipientCount={broadcastRecipientCount} />
        </div>
      )}

      {admin.role === 'owner' && (
        <div className="ad-card" style={{ marginBottom: '20px' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '6px' }}>Admin Yönetimi</p>
          <AdminsPanel currentAdminId={admin.id} initialAdmins={admins} />
        </div>
      )}

      <div className="ad-card">
        <p className="ad-eyebrow-muted" style={{ marginBottom: '16px' }}>Güvenlik</p>
        <KV
          label="Admin Host Kısıtı"
          value={<span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>{adminHostsRaw}</span>}
        />
        <KV label="RLS · admin_users" value={<Badge tone="success" bracketed>Aktif</Badge>} />
        <KV label="RLS · ledger / daily_logs / site_settings" value={<Badge tone="success" bracketed>Aktif</Badge>} />
      </div>
    </div>
  )
}
