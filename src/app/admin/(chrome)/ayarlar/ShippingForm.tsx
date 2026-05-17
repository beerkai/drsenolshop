'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'
import type { ShippingConfig } from '@/lib/site-settings'

export default function ShippingForm({ initial }: { initial: ShippingConfig }) {
  const router = useRouter()
  const [form, setForm] = useState<ShippingConfig>(initial)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof ShippingConfig>(k: K, v: ShippingConfig[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
      } else {
        toast.success('Kargo ayarları kaydedildi.')
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
          <label className="ad-label">Sabit Kargo Ücreti (TL)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(form.flat_fee) ? form.flat_fee : 0}
            onChange={(e) => update('flat_fee', parseFloat(e.target.value) || 0)}
            placeholder="Ör: 60"
            className="ad-input ad-mono"
          />
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
            0 yazılırsa kargo ücreti uygulanmaz (her zaman ücretsiz).
          </p>
        </div>
        <div>
          <label className="ad-label">Ücretsiz Kargo Eşiği (TL)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(form.free_threshold) ? form.free_threshold : 0}
            onChange={(e) => update('free_threshold', parseFloat(e.target.value) || 0)}
            placeholder="Ör: 750"
            className="ad-input ad-mono"
          />
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
            Bu tutar ve üzeri siparişte kargo ücretsiz. 0 yazılırsa devre dışı.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="ad-label">Anlaşmalı Kargo Şirketi</label>
        <input
          type="text"
          value={form.courier_name}
          onChange={(e) => update('courier_name', e.target.value)}
          placeholder="Ör: Yurtiçi Kargo, Aras Kargo"
          className="ad-input"
        />
        <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
          Bilgi amaçlı — sipariş onay e-postasında gösterilir.
        </p>
      </div>

      <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  )
}
