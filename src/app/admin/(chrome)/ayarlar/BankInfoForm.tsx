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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label className="ad-label">Banka Adı</label>
          <input
            type="text"
            value={form.bank_name}
            onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
            placeholder="Ör: Garanti BBVA"
            className="ad-input"
          />
        </div>
        <div>
          <label className="ad-label">Hesap Sahibi</label>
          <input
            type="text"
            value={form.account_holder}
            onChange={(e) => setForm((f) => ({ ...f, account_holder: e.target.value }))}
            placeholder="Ör: Dr. Şenol Ltd."
            className="ad-input"
          />
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label className="ad-label">IBAN</label>
        <input
          type="text"
          value={form.iban}
          onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          className="ad-input ad-mono"
          style={{ letterSpacing: '0.05em' }}
        />
        {form.iban && (
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.08em' }}>
            Görüntü: {formatIbanForDisplay(form.iban)}
          </p>
        )}
      </div>

      <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  )
}
