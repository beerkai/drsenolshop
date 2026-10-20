'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'
import type { BankInfo } from '@/lib/site-settings'

function formatIbanForDisplay(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

export default function BankInfoForm({ initial }: { initial: BankInfo }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
      } else {
        toast.success('Banka bilgileri kaydedildi.')
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="pn-split-2">
        <div>
          <label className="pn-label">Banka Adı</label>
          <input
            type="text"
            value={form.bank_name}
            onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
            placeholder="Ör: Garanti BBVA"
            className="pn-input"
          />
        </div>
        <div>
          <label className="pn-label">Hesap Sahibi</label>
          <input
            type="text"
            value={form.account_holder}
            onChange={(e) => setForm((f) => ({ ...f, account_holder: e.target.value }))}
            placeholder="Ör: Dr. Şenol Ltd."
            className="pn-input"
          />
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label className="pn-label">IBAN</label>
        <input
          type="text"
          value={form.iban}
          onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className="pn-input pn-mono"
          style={{ letterSpacing: '0.05em' }}
        />
        {form.iban && (
          <p className="pn-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.08em' }}>
            Görüntü: {formatIbanForDisplay(form.iban)}
          </p>
        )}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
        />
        <span className="pn-label" style={{ marginBottom: 0 }}>
          Havale / EFT ile ödemeyi kabul et
        </span>
      </label>
      {!form.enabled && (
        <p className="pn-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '-8px', marginBottom: '16px', letterSpacing: '0.08em' }}>
          Kapalı — checkout&apos;ta sadece kart ile ödeme (PayTR) görünür.
        </p>
      )}

      <button type="submit" disabled={saving} className="pn-btn pn-btn-primary">
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  )
}
