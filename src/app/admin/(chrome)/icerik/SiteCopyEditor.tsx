'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { toast } from '@/components/admin/toast/toast'
import type { SiteCopy } from '@/lib/site-copy'

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span className="ad-label">{label}</span>
      {multiline ? (
        <textarea className="ad-textarea" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ad-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

export default function SiteCopyEditor({ initialCopy }: { initialCopy: SiteCopy }) {
  const [copy, setCopy] = useState(() => clone(initialCopy))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const touch = useCallback((mutator: (d: SiteCopy) => void) => {
    setCopy((prev) => {
      const next = clone(prev)
      mutator(next)
      return next
    })
    setDirty(true)
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
        return
      }
      toast.success('Site metinleri kaydedildi.')
      setDirty(false)
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {dirty ? <span className="ad-badge ad-badge-warning">Kaydedilmemiş</span> : null}
        <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
        <button
          type="button"
          className="ad-btn ad-btn-secondary"
          onClick={() => {
            setCopy(clone(initialCopy))
            setDirty(false)
          }}
          disabled={!dirty}
        >
          Geri Al
        </button>
      </div>

      <div className="ad-card" style={{ marginBottom: 24, padding: 16 }}>
        <p className="ad-label">Diğer metinler</p>
        <p style={{ fontSize: 13, color: 'var(--ad-fg-muted)', margin: '0 0 12px' }}>
          Anasayfa hero, footer, katalog butonları:{' '}
          <Link href="/admin/tema" style={{ color: 'var(--ad-accent)' }}>
            Tema editörü
          </Link>
          . Kargo metinleri:{' '}
          <Link href="/admin/ayarlar" style={{ color: 'var(--ad-accent)' }}>
            Ayarlar → Kargo
          </Link>
          .
        </p>
      </div>

      <h2 className="ad-display" style={{ fontSize: 22, marginBottom: 16 }}>
        Sıkça Sorulanlar
      </h2>
      <Field
        label="Üst etiket (eyebrow)"
        value={copy.faq.eyebrow}
        onChange={(v) => touch((d) => { d.faq.eyebrow = v })}
      />
      <Field label="Başlık" value={copy.faq.title} onChange={(v) => touch((d) => { d.faq.title = v })} />
      <Field
        label="Başlık vurgusu"
        value={copy.faq.titleAccent}
        onChange={(v) => touch((d) => { d.faq.titleAccent = v })}
      />
      <Field
        label="Giriş paragrafı"
        multiline
        value={copy.faq.intro}
        onChange={(v) => touch((d) => { d.faq.intro = v })}
      />

      {copy.faq.sections.map((sec, si) => (
        <div key={sec.id} className="ad-card" style={{ marginTop: 24, padding: 16 }}>
          <Field
            label={`Bölüm ${si + 1} — eyebrow`}
            value={sec.eyebrow}
            onChange={(v) => touch((d) => { d.faq.sections[si].eyebrow = v })}
          />
          {sec.items.map((item, ii) => (
            <div key={item.id} style={{ borderTop: '1px solid var(--ad-border)', paddingTop: 16, marginTop: 16 }}>
              <Field
                label="Soru"
                value={item.question}
                onChange={(v) => touch((d) => { d.faq.sections[si].items[ii].question = v })}
              />
              <Field
                label="Cevap"
                multiline
                value={item.answer}
                onChange={(v) => touch((d) => { d.faq.sections[si].items[ii].answer = v })}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
