'use client'

import { useState } from 'react'
import { toast } from '@/components/admin/toast/toast'
import { Badge } from '@/components/admin/ui/Badge'

export default function TelegramTestPanel({ configured }: { configured: boolean }) {
  const [sending, setSending] = useState(false)

  async function handleTest() {
    setSending(true)
    try {
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Test başarısız.')
      } else {
        toast.success('Test mesajı gönderildi. Telegram\'ı kontrol et.')
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
        <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Durum</span>
        {configured ? (
          <Badge tone="success" bracketed>Yapılandırılmış</Badge>
        ) : (
          <Badge tone="neutral" bracketed>Eksik env</Badge>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
        <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Bot Token</span>
        <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>
          {configured ? '••••• env\'de' : 'eksik'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
        <span className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Chat ID</span>
        <span className="ad-mono" style={{ fontSize: '12px', color: 'var(--ad-fg)' }}>
          {configured ? '••••• env\'de' : 'eksik'}
        </span>
      </div>

      <div style={{ marginTop: '14px' }}>
        <button
          type="button"
          onClick={handleTest}
          disabled={!configured || sending}
          className={['ad-btn', configured ? 'ad-btn-primary' : 'ad-btn-secondary'].join(' ')}
        >
          {sending ? 'Gönderiliyor…' : 'Test Mesajı Gönder'}
        </button>
        {!configured && (
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '8px', letterSpacing: '0.05em' }}>
            TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID env değişkenleri Vercel&apos;da tanımlı olmalı.
          </p>
        )}
      </div>
    </div>
  )
}
