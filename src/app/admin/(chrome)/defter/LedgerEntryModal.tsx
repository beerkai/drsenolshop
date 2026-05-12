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
}

/** Komisyon string'ini float olarak yarısı satışın mı? — auto kontrolü */
function isHalfOf(commission: string, sale: string): boolean {
  const c = Number(commission)
  const s = Number(sale)
  if (!Number.isFinite(c) || !Number.isFinite(s) || s === 0) return false
  return Math.abs(c - s / 2) < 0.005
}

function formatHalf(sale: string): string {
  const s = Number(sale)
  if (!Number.isFinite(s) || s <= 0) return ''
  const half = s / 2
  // Tam sayıysa ondalık koyma
  return Number.isInteger(half) ? String(half) : half.toFixed(2)
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
    }
  })

  // Komisyon "auto" mu? — true ise sale_amount değiştikçe komisyon güncellenir.
  // Toggle ilk açıldığında auto'ya geçer. Kullanıcı manuel değiştirirse auto kapanır.
  const [commissionAuto, setCommissionAuto] = useState(
    initial ? initial.has_guide && initial.guide_commission != null && isHalfOf(String(initial.guide_commission), String(initial.sale_amount)) : true
  )

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

  /** sale_amount değişince, eğer auto modda VE rehber açıksa komisyonu güncelle */
  function handleSaleAmountChange(v: string) {
    setForm((prev) => {
      const next = { ...prev, sale_amount: v }
      if (prev.has_guide && commissionAuto) {
        next.guide_commission = formatHalf(v)
      }
      return next
    })
  }

  /** Rehber toggle değişince: açılınca otomatik yarı tutar; kapanınca temizle */
  function handleHasGuideToggle(v: boolean) {
    if (v) {
      setCommissionAuto(true)
      setForm((prev) => ({
        ...prev,
        has_guide: true,
        guide_commission: formatHalf(prev.sale_amount),
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        has_guide: false,
        guide_commission: '',
        guide_paid: false,
      }))
      setCommissionAuto(true) // bir dahaki açılışta tekrar auto başlar
    }
  }

  /** Komisyon inputu kullanıcı tarafından değişti → auto modu kapat */
  function handleCommissionChange(v: string) {
    setCommissionAuto(false)
    setForm((prev) => ({ ...prev, guide_commission: v }))
  }

  /** Auto modu manuel tekrar aç (komisyon = sale / 2) */
  function resetCommissionAuto() {
    setCommissionAuto(true)
    setForm((prev) => ({ ...prev, guide_commission: formatHalf(prev.sale_amount) }))
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
      toast.error('Plaka/etiket formatı geçersiz. Örn: 34BRK1234 veya MERCAN-KADIR')
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
      <style>{`
        @media (max-width: 640px) {
          .ad-ledger-modal {
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            height: 100vh !important;
            height: 100dvh !important;
            border: none !important;
          }
          /* Mobile'da alt footer gizle — Kaydet zaten üstte */
          .ad-modal-footer { display: none !important; }
          /* Compact form padding */
          .ad-ledger-form { padding: 14px 16px !important; }
          .ad-ledger-form > div { margin-bottom: 12px !important; }
        }
      `}</style>
      <div
        role="dialog"
        aria-label={isEdit ? 'Defter kaydını düzenle' : 'Yeni defter kaydı'}
        className="ad-ledger-modal"
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
        {/* Header — sticky-top action bar */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ad-line-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: 'var(--ad-surface)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="ad-icon-btn"
            style={{ flexShrink: 0 }}
          >
            ✕
          </button>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            <p className="ad-eyebrow" style={{ marginBottom: '2px', fontSize: '9px' }}>
              {isEdit ? 'Düzenle' : 'Yeni Kayıt'}
            </p>
            <h2 className="ad-display" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ad-fg)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Defter Kaydı
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={saving}
            className="ad-btn ad-btn-primary"
            style={{ flexShrink: 0, padding: '9px 14px', fontSize: '11px', letterSpacing: '0.18em', minWidth: '92px' }}
          >
            {saving ? '…' : isEdit ? 'Kaydet' : '+ Ekle'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ad-ledger-form" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', WebkitOverflowScrolling: 'touch' }}>
          {/* Plaka / Etiket */}
          <div style={{ marginBottom: '14px' }}>
            <label className="ad-label" htmlFor="plate">Plaka / Tur Etiketi</label>
            <input
              ref={plateRef}
              id="plate"
              type="text"
              required
              value={form.plate}
              onChange={(e) => handlePlateChange(e.target.value)}
              placeholder="34BRK1234 veya MERCAN-KADIR"
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
            <p className="ad-mono" style={{ fontSize: '10px', color: form.plate && !plateValid ? 'var(--ad-danger)' : 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em', lineHeight: 1.5 }}>
              {form.plate && !plateValid
                ? 'Geçersiz format. Örn: 34BRK1234 veya MERCAN-KADIR'
                : 'Plaka veya tur kodu (şirket-rehber). Boşluk ve özel karakter yok, tire serbest.'}
            </p>
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
              onChange={(e) => handleSaleAmountChange(e.target.value)}
              placeholder="0"
              className="ad-input ad-mono"
              style={{ fontSize: '15px', fontWeight: 500 }}
            />
          </div>

          {/* Rehber */}
          <div style={{ marginBottom: '14px', padding: '14px', border: '1px solid var(--ad-line-faint)', backgroundColor: 'var(--ad-surface-2)' }}>
            <ToggleRow
              label="Rehberle geldi"
              hint="Komisyon otomatik satışın yarısı olur"
              checked={form.has_guide}
              onChange={handleHasGuideToggle}
            />
            {form.has_guide && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="ad-label" htmlFor="comm" style={{ marginBottom: 0 }}>Rehber Komisyonu (TL)</label>
                  {commissionAuto ? (
                    <span className="ad-mono" style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'var(--ad-success)', textTransform: 'uppercase' }}>
                      otomatik · satışın 1/2'si
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={resetCommissionAuto}
                      className="ad-mono"
                      style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'var(--ad-gold-deep)', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase', padding: 0 }}
                    >
                      otomatik moda dön ↻
                    </button>
                  )}
                </div>
                <input
                  id="comm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.guide_commission}
                  onChange={(e) => handleCommissionChange(e.target.value)}
                  placeholder="0"
                  className="ad-input ad-mono"
                />
                <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginTop: '4px', letterSpacing: '0.05em' }}>
                  Satışın yarısı otomatik gelir; istersen düzenleyebilirsin (örn. 2500 satışta default 1250 yazılır).
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

        {/* Footer — sadece masaüstünde tam, mobile'da kompakt (Kaydet butonu zaten üstte) */}
        <div className="ad-modal-footer" style={{ padding: '12px 18px', borderTop: '1px solid var(--ad-line-faint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: 'var(--ad-surface-2)', flexShrink: 0 }}>
          <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.08em' }}>
            <span className="ad-kbd">esc</span> kapat · <span className="ad-kbd">⌘</span><span className="ad-kbd">↵</span> kaydet
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} className="ad-btn ad-btn-secondary ad-btn-sm">Vazgeç</button>
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
