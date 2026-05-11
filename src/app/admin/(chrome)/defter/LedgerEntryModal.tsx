'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from '@/components/admin/toast/toast'
import type { Employee, LedgerEntry } from '@/lib/ledger'
import { normalizePlate, isValidPlate } from '@/lib/ledger'

interface Props {
  date: string
  employees: Employee[]
  initial: LedgerEntry | null
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  plate: string
  employee_id: string
  payment_method: 'cash' | 'card'
  sale_amount: string
  has_guide: boolean
  guide_commission: string
  customer_paid: boolean
  guide_paid: boolean
  notes: string
  entry_time: string
}

const DEFAULT_FORM: FormState = {
  plate: '',
  employee_id: '',
  payment_method: 'cash',
  sale_amount: '',
  has_guide: false,
  guide_commission: '',
  customer_paid: true,    // varsayılan: müşteri ödedi
  guide_paid: false,
  notes: '',
  entry_time: '',
}

export default function LedgerEntryModal({ date, employees, initial, onClose, onSaved }: Props) {
  const plateRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return DEFAULT_FORM
    return {
      plate: initial.plate,
      employee_id: initial.employee_id ?? '',
      payment_method: initial.payment_method,
      sale_amount: String(initial.sale_amount),
      has_guide: initial.has_guide,
      guide_commission: initial.guide_commission != null ? String(initial.guide_commission) : '',
      customer_paid: initial.customer_paid,
      guide_paid: initial.guide_paid,
      notes: initial.notes ?? '',
      entry_time: initial.entry_time?.slice(0, 5) ?? '',
    }
  })
  const [saving, setSaving] = useState(false)
  const [employeeQuickAdd, setEmployeeQuickAdd] = useState(false)
  const [newEmpName, setNewEmpName] = useState('')

  const isEdit = !!initial

  // Plaka inputuna otomatik focus
  useEffect(() => { plateRef.current?.focus() }, [])

  // Esc → kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handlePlateChange(raw: string) {
    update('plate', normalizePlate(raw))
  }

  async function handleQuickAddEmployee() {
    const name = newEmpName.trim()
    if (!name) return
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Çalışan eklenemedi.')
        return
      }
      toast.success(`${data.employee.name} eklendi.`)
      // Employee'leri yenilemek için sayfayı refresh edeceğiz — şimdilik
      // listede yok ama seçili yapabiliriz, sayfa refresh edince düzelir
      update('employee_id', data.employee.id)
      setEmployeeQuickAdd(false)
      setNewEmpName('')
      // Sayfayı yenilemiyoruz; modal kalsın, kullanıcı kaydet butonuna basınca onSaved çalışır.
    } catch {
      toast.error('Ağ hatası.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return

    // Client-side validasyon
    if (!form.plate) {
      toast.error('Plaka gerekli.')
      plateRef.current?.focus()
      return
    }
    if (!isValidPlate(form.plate)) {
      toast.error('Plaka formatı geçersiz. Örn: 34BED961')
      plateRef.current?.focus()
      return
    }
    const sale = Number(form.sale_amount)
    if (!Number.isFinite(sale) || sale < 0) {
      toast.error('Satış miktarı geçersiz.')
      return
    }
    if (form.has_guide) {
      const c = Number(form.guide_commission)
      if (!Number.isFinite(c) || c < 0) {
        toast.error('Rehber komisyonu geçersiz.')
        return
      }
    }

    setSaving(true)
    try {
      if (isEdit && initial) {
        // Edit — PATCH
        const res = await fetch(`/api/admin/defter/${initial.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_method: form.payment_method,
            sale_amount: sale,
            has_guide: form.has_guide,
            guide_commission: form.has_guide ? Number(form.guide_commission) : null,
            customer_paid: form.customer_paid,
            guide_paid: form.guide_paid,
            notes: form.notes.trim() || null,
            employee_id: form.employee_id || null,
            entry_time: form.entry_time ? `${form.entry_time}:00` : undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          toast.error(data.message ?? 'Güncellenemedi.')
          setSaving(false)
          return
        }
        toast.success(`${form.plate} kaydı güncellendi.`)
        onSaved()
      } else {
        // Create — POST
        const res = await fetch('/api/admin/defter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry_date: date,
            entry_time: form.entry_time ? `${form.entry_time}:00` : undefined,
            plate: form.plate,
            employee_id: form.employee_id || null,
            payment_method: form.payment_method,
            sale_amount: sale,
            has_guide: form.has_guide,
            guide_commission: form.has_guide ? Number(form.guide_commission) : null,
            customer_paid: form.customer_paid,
            guide_paid: form.guide_paid,
            notes: form.notes.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          toast.error(data.message ?? 'Kayıt başarısız.')
          setSaving(false)
          return
        }
        toast.success(`${form.plate} kaydı eklendi.`)
        onSaved()
      }
    } catch {
      toast.error('Ağ hatası.')
      setSaving(false)
    }
  }

  const plateValid = !form.plate || isValidPlate(form.plate)

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,9,8,0.45)', backdropFilter: 'blur(3px)', zIndex: 80 }}
      />
      <div
        role="dialog"
        aria-label={isEdit ? 'Defter kaydını düzenle' : 'Yeni defter kaydı'}
        style={{
          position: 'fixed',
          top: '6vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '620px',
          maxHeight: '88vh',
          backgroundColor: 'var(--ad-surface)',
          border: '1px solid var(--ad-line)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          animation: 'ad-fadeup 0.2s ease-out both',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ad-line-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="ad-eyebrow" style={{ marginBottom: '6px' }}>{isEdit ? 'Düzenle' : 'Yeni Kayıt'}</p>
            <h2 className="ad-display" style={{ fontSize: '20px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0 }}>
              Defter Kaydı
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="ad-icon-btn">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Plaka */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="plate">Araç Plakası</label>
            <input
              ref={plateRef}
              id="plate"
              type="text"
              required
              value={form.plate}
              onChange={(e) => handlePlateChange(e.target.value)}
              placeholder="34BED961"
              className="ad-input ad-mono"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '15px',
                fontWeight: 500,
                borderColor: form.plate && !plateValid ? 'var(--ad-danger)' : undefined,
              }}
              autoComplete="off"
              spellCheck={false}
              disabled={isEdit}
            />
            <p className="ad-mono" style={{ fontSize: '10px', color: form.plate && !plateValid ? 'var(--ad-danger)' : 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
              {form.plate && !plateValid ? 'Geçersiz format. Örn: 34BED961' : 'Boşluksuz, büyük harf. Örn: 34BED961'}
            </p>
          </div>

          {/* Saat (opsiyonel) */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="time">
              Saat <span style={{ textTransform: 'lowercase', letterSpacing: 0, color: 'var(--ad-fg-faint)' }}>(boşsa şu an)</span>
            </label>
            <input
              id="time"
              type="time"
              value={form.entry_time}
              onChange={(e) => update('entry_time', e.target.value)}
              className="ad-input"
              style={{ maxWidth: '160px' }}
            />
          </div>

          {/* Çalışan */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="employee">İlgilenen Çalışan</label>
            {!employeeQuickAdd ? (
              <>
                <select
                  id="employee"
                  value={form.employee_id}
                  onChange={(e) => update('employee_id', e.target.value)}
                  className="ad-select"
                >
                  <option value="">— Seçiniz —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setEmployeeQuickAdd(true)}
                  className="ad-btn ad-btn-ghost ad-btn-sm"
                  style={{ marginTop: '6px' }}
                >
                  + Yeni Çalışan Ekle
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Çalışan adı"
                  className="ad-input"
                  style={{ flex: 1 }}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddEmployee() } }}
                />
                <button type="button" onClick={handleQuickAddEmployee} className="ad-btn ad-btn-primary ad-btn-sm">Ekle</button>
                <button type="button" onClick={() => { setEmployeeQuickAdd(false); setNewEmpName('') }} className="ad-btn ad-btn-ghost ad-btn-sm">İptal</button>
              </div>
            )}
          </div>

          {/* Ödeme yöntemi */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label">Ödeme Yöntemi</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <PaymentToggle
                active={form.payment_method === 'cash'}
                onClick={() => update('payment_method', 'cash')}
                label="Nakit"
              />
              <PaymentToggle
                active={form.payment_method === 'card'}
                onClick={() => update('payment_method', 'card')}
                label="Kart"
              />
            </div>
          </div>

          {/* Satış miktarı */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="sale">Satış Miktarı (TL)</label>
            <input
              id="sale"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.sale_amount}
              onChange={(e) => update('sale_amount', e.target.value)}
              placeholder="0"
              className="ad-input ad-mono"
              style={{ fontSize: '15px', fontWeight: 500 }}
            />
          </div>

          {/* Rehber */}
          <div style={{ marginBottom: '14px', padding: '14px', border: '1px solid var(--ad-line-faint)', backgroundColor: 'var(--ad-surface-2)' }}>
            <ToggleRow
              label="Rehberle geldi"
              hint="Komisyon defteri oluştur"
              checked={form.has_guide}
              onChange={(v) => update('has_guide', v)}
            />
            {form.has_guide && (
              <div style={{ marginTop: '10px' }}>
                <label className="ad-label" htmlFor="comm">Rehber Komisyonu (TL)</label>
                <input
                  id="comm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.guide_commission}
                  onChange={(e) => update('guide_commission', e.target.value)}
                  placeholder="0"
                  className="ad-input ad-mono"
                />
                <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
                  Toplam satışın içinden rehbere verilecek miktar (örn. 2500 satıştan 500 rehbere → bu alana 500 yaz)
                </p>
              </div>
            )}
          </div>

          {/* Ödeme durumu checkbox'ları */}
          <div style={{ marginBottom: '14px', padding: '14px', border: '1px solid var(--ad-line-faint)' }}>
            <p className="ad-eyebrow-muted" style={{ marginBottom: '10px' }}>Ödeme Durumu</p>
            <CheckboxRow
              label="Müşteriden ödeme alındı"
              checked={form.customer_paid}
              onChange={(v) => update('customer_paid', v)}
            />
            {form.has_guide && (
              <CheckboxRow
                label="Rehbere ödeme yapıldı"
                checked={form.guide_paid}
                onChange={(v) => update('guide_paid', v)}
              />
            )}
          </div>

          {/* Notlar */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="notes">Ekstra Notlar <span style={{ textTransform: 'lowercase', letterSpacing: 0, color: 'var(--ad-fg-faint)' }}>(opsiyonel)</span></label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="ad-textarea"
              rows={3}
              placeholder="Ekstrem durumlar için..."
            />
          </div>
        </form>

        {/* Footer / Submit */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--ad-line-faint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: 'var(--ad-surface-2)' }}>
          <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
            <span className="ad-kbd">esc</span> kapat
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} className="ad-btn ad-btn-secondary">Vazgeç</button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
              disabled={saving}
              className="ad-btn ad-btn-primary"
            >
              {saving ? 'Kaydediliyor…' : isEdit ? 'Değişiklikleri Kaydet' : '+ Kaydı Ekle'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function PaymentToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '11px',
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '12px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        border: `1px solid ${active ? 'var(--ad-gold)' : 'var(--ad-line)'}`,
        backgroundColor: active ? 'var(--ad-gold-faint)' : 'var(--ad-surface)',
        color: active ? 'var(--ad-gold-deep)' : 'var(--ad-fg-muted)',
        cursor: 'pointer',
        transition: 'all 120ms',
      }}
    >
      {label}
    </button>
  )
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
      <span
        style={{
          width: '34px',
          height: '20px',
          backgroundColor: checked ? 'var(--ad-gold)' : 'var(--ad-line)',
          position: 'relative',
          transition: 'background-color 160ms',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            width: '16px',
            height: '16px',
            backgroundColor: checked ? '#0A0908' : 'var(--ad-surface)',
            transition: 'left 160ms, background-color 160ms',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ color: 'var(--ad-fg)', fontSize: '13px', display: 'block', fontWeight: 500 }}>{label}</span>
        {hint && (
          <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.05em' }}>
            {hint}
          </span>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  )
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
      <span
        style={{
          width: '18px',
          height: '18px',
          border: `1px solid ${checked ? 'var(--ad-gold)' : 'var(--ad-line-strong)'}`,
          backgroundColor: checked ? 'var(--ad-gold)' : 'var(--ad-surface)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#0A0908',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        {checked && '✓'}
      </span>
      <span style={{ color: 'var(--ad-fg)', fontSize: '13px' }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  )
}
