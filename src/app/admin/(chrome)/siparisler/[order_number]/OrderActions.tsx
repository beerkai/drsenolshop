'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'

interface Props {
  orderId: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentRef: string | null
  trackingNumber: string | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'preparing', label: 'Hazırlanıyor' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal' },
  { value: 'refunded', label: 'İade' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekliyor' },
  { value: 'captured', label: 'Alındı' },
  { value: 'failed', label: 'Başarısız' },
  { value: 'refunded', label: 'İade' },
]

export default function OrderActions(props: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(props.status)
  const [paymentStatus, setPaymentStatus] = useState(props.paymentStatus)
  const [trackingNumber, setTrackingNumber] = useState(props.trackingNumber ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${props.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          tracking_number: trackingNumber || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncelleme başarısız.')
      } else {
        toast.success(`${props.orderNumber} güncellendi.`)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pn-card" style={{ position: 'sticky', top: '76px' }}>
      <p className="pn-eyebrow" style={{ marginBottom: '20px' }}>Aksiyonlar</p>

      <div style={{ marginBottom: '14px' }}>
        <label className="pn-label">Sipariş Durumu</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="pn-select">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label className="pn-label">Ödeme Durumu</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="pn-select">
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label className="pn-label">Kargo Takip No</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="pn-input"
          placeholder="Yurtiçi / MNG / Aras"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="pn-btn pn-btn-primary"
        style={{ width: '100%' }}
      >
        {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
      </button>

      <hr className="pn-divider" />

      <p className="pn-eyebrow-muted" style={{ marginBottom: '8px' }}>Ödeme Yöntemi</p>
      <p style={{ color: 'var(--ad-fg)', fontSize: '13px', margin: 0 }}>
        {props.paymentMethod === 'bank_transfer' ? 'Havale / EFT' : props.paymentMethod}
      </p>

      {props.paymentRef && (
        <>
          <p className="pn-eyebrow-muted" style={{ marginTop: '14px', marginBottom: '6px' }}>Ödeme Ref.</p>
          <p className="pn-mono" style={{ color: 'var(--ad-fg)', fontSize: '12px', margin: 0, wordBreak: 'break-all' }}>
            {props.paymentRef}
          </p>
        </>
      )}
    </div>
  )
}
