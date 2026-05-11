'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains)',
  fontSize: '10px',
  letterSpacing: '0.22em',
  color: '#6E665A',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#F4F0E8',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
}

export default function OrderActions(props: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(props.status)
  const [paymentStatus, setPaymentStatus] = useState(props.paymentStatus)
  const [trackingNumber, setTrackingNumber] = useState(props.trackingNumber ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
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
        setMessage({ type: 'error', text: data.message ?? 'Güncelleme başarısız.' })
      } else {
        setMessage({ type: 'ok', text: 'Güncellendi.' })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'Ağ hatası.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div style={{ backgroundColor: '#141210', padding: '24px', position: 'sticky', top: '32px' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.25em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
        Aksiyonlar
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={LABEL_STYLE}>Sipariş Durumu</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={INPUT_STYLE}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={LABEL_STYLE}>Ödeme Durumu</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={INPUT_STYLE}>
          {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={LABEL_STYLE}>Kargo Takip No</label>
        <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} style={INPUT_STYLE} placeholder="Yurtiçi/MNG/Aras" />
      </div>

      {message && (
        <div style={{
          padding: '10px 12px',
          fontSize: '12px',
          marginBottom: '14px',
          border: '1px solid ' + (message.type === 'ok' ? 'rgba(92,122,63,0.4)' : '#C8472D'),
          color: message.type === 'ok' ? '#A6C481' : '#F4F0E8',
          backgroundColor: message.type === 'ok' ? 'rgba(92,122,63,0.08)' : 'rgba(200,71,45,0.08)',
        }}>
          {message.text}
        </div>
      )}

      <button type="button" onClick={handleSave} disabled={saving}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: saving ? '#9C7C3C' : '#C9A961',
          color: '#0A0908',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '11px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: saving ? 'wait' : 'pointer',
        }}>
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>

      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(244,240,232,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Ödeme Yöntemi
        </p>
        <p style={{ color: '#F4F0E8', fontSize: '13px', margin: 0 }}>
          {props.paymentMethod === 'bank_transfer' ? 'Havale / EFT' : props.paymentMethod}
        </p>
        {props.paymentRef && (
          <>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.22em', color: '#6E665A', textTransform: 'uppercase', margin: '12px 0 6px' }}>
              Ödeme Ref
            </p>
            <p style={{ color: '#F4F0E8', fontSize: '12px', margin: 0, fontFamily: 'var(--font-jetbrains)' }}>
              {props.paymentRef}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
