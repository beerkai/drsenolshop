'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ProfileInitial {
  full_name: string
  phone: string
  address_line1: string
  address_line2: string
  district: string
  city: string
  postal_code: string
}

export default function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const router = useRouter()
  const [form, setForm] = useState<ProfileInitial>(initial)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof ProfileInitial>(k: K, v: ProfileInitial[K]) {
    setForm((f) => ({ ...f, [k]: v }))
    setSavedAt(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/auth/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Profil kaydedilemedi.')
        setSaving(false)
        return
      }
      setSavedAt(Date.now())
      setSaving(false)
      router.refresh()
    } catch {
      setError('Sunucuya bağlanılamadı.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        @media (max-width: 640px) { .pf-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pf-grid">
        <Field label="Ad Soyad">
          <input className="auth-input" type="text" autoComplete="name" value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Telefon">
          <input className="auth-input" type="tel" autoComplete="tel" value={form.phone}
            onChange={(e) => update('phone', e.target.value)} placeholder="0(5xx) xxx xx xx" style={inputStyle} />
        </Field>
      </div>

      <Field label="Adres (cadde, sokak, no)">
        <input className="auth-input" type="text" autoComplete="address-line1" value={form.address_line1}
          onChange={(e) => update('address_line1', e.target.value)} style={inputStyle} />
      </Field>

      <Field label="Apartman / Daire (opsiyonel)">
        <input className="auth-input" type="text" autoComplete="address-line2" value={form.address_line2}
          onChange={(e) => update('address_line2', e.target.value)} style={inputStyle} />
      </Field>

      <div className="pf-grid">
        <Field label="İlçe">
          <input className="auth-input" type="text" autoComplete="address-level2" value={form.district}
            onChange={(e) => update('district', e.target.value)} style={inputStyle} />
        </Field>
        <Field label="İl">
          <input className="auth-input" type="text" autoComplete="address-level1" value={form.city}
            onChange={(e) => update('city', e.target.value)} style={inputStyle} />
        </Field>
      </div>

      <Field label="Posta Kodu (opsiyonel)">
        <input className="auth-input" type="text" autoComplete="postal-code" value={form.postal_code}
          onChange={(e) => update('postal_code', e.target.value)} style={{ ...inputStyle, maxWidth: '240px' }} />
      </Field>

      {error && (
        <div role="alert" style={errBoxStyle}>
          <span aria-hidden style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px' }}>✕</span>
          <span>{error}</span>
        </div>
      )}

      {savedAt && !error && (
        <div role="status" style={okBoxStyle}>
          <span aria-hidden style={{ color: '#C9A961' }}>✓</span>
          <span>Profil bilgileri kaydedildi. Bir sonraki siparişte otomatik dolacak.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="auth-submit"
        style={{
          ...submitStyle,
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'wait' : 'pointer',
        }}
      >
        {saving ? 'Kaydediliyor…' : 'Profili kaydet'}
        {!saving && <span style={{ fontFamily: 'var(--font-jetbrains)', opacity: 0.7 }}>→</span>}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#6E665A',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#F4F0E8',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '14px',
  letterSpacing: '0.02em',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const errBoxStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #D17B6A',
  backgroundColor: 'rgba(209,123,106,0.08)',
  color: '#D17B6A',
  fontSize: '13px',
  marginBottom: '14px',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
}

const okBoxStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #C9A961',
  backgroundColor: 'rgba(201,169,97,0.08)',
  color: '#E5DDC8',
  fontSize: '13px',
  marginBottom: '14px',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
}

const submitStyle: React.CSSProperties = {
  padding: '14px 24px',
  backgroundColor: '#C9A961',
  border: '1px solid #C9A961',
  color: '#0A0908',
  fontFamily: 'var(--font-jetbrains), monospace',
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 500,
  minHeight: '46px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
}
