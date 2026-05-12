'use client'

import { useState } from 'react'
import { toast } from '@/components/admin/toast/toast'

const MAX = 3500

export default function BroadcastPanel({ recipientCount }: { recipientCount: number }) {
  const [message, setMessage] = useState('')
  const [includeFooter, setIncludeFooter] = useState(true)
  const [sending, setSending] = useState(false)

  const trimmed = message.trim()
  const length = trimmed.length
  const isOverLimit = length > MAX
  const isEmpty = length === 0

  async function handleSend() {
    if (isEmpty || isOverLimit || sending || recipientCount === 0) return

    const ok = confirm(
      `${recipientCount} alıcıya duyuru gönderilecek.\n\n` +
      `Önizleme:\n${trimmed.slice(0, 240)}${trimmed.length > 240 ? '…' : ''}\n\n` +
      `Onaylıyor musun?`
    )
    if (!ok) return

    setSending(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, includeFooter }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Duyuru gönderilemedi.')
        return
      }
      const failedNote = data.failed > 0 ? ` (${data.failed} alıcı başarısız)` : ''
      toast.success(`✓ Duyuru gönderildi · ${data.sent} alıcı${failedNote}`)
      setMessage('')
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <label htmlFor="broadcast-msg" className="ad-label" style={{ marginBottom: 0 }}>
          Mesaj
        </label>
        <span
          className="ad-mono"
          style={{
            fontSize: '10px',
            letterSpacing: '0.05em',
            color: isOverLimit ? 'var(--ad-danger)' : 'var(--ad-fg-faint)',
          }}
        >
          {length} / {MAX}
        </span>
      </div>

      <textarea
        id="broadcast-msg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          'Örnek:\n' +
          'Yarın saat 14:00\'te toplantı var.\n' +
          'Lütfen vaktinde gelin.'
        }
        className="ad-textarea"
        rows={6}
        style={{ fontSize: '13px', minHeight: '120px', fontFamily: 'var(--font-inter), sans-serif' }}
        disabled={sending}
      />

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          cursor: 'pointer',
          fontSize: '12px',
          color: 'var(--ad-fg-muted)',
        }}
      >
        <input
          type="checkbox"
          checked={includeFooter}
          onChange={(e) => setIncludeFooter(e.target.checked)}
          style={{ accentColor: 'var(--ad-gold)' }}
        />
        Gönderen ve zaman damgasını dahil et
      </label>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em', margin: 0 }}>
          {recipientCount > 0
            ? `${recipientCount} yetkili alıcıya gider`
            : 'Henüz yetkili chat ID yok'}
        </p>
        <button
          type="button"
          onClick={handleSend}
          disabled={isEmpty || isOverLimit || sending || recipientCount === 0}
          className="ad-btn ad-btn-primary"
        >
          {sending ? 'Gönderiliyor…' : '📣 Duyuru Gönder'}
        </button>
      </div>

      {isOverLimit && (
        <p style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--ad-danger)' }}>
          Mesaj limiti aşıldı. Lütfen {MAX} karakterin altında tut.
        </p>
      )}
    </div>
  )
}
