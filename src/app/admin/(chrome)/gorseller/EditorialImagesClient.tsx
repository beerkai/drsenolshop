'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from '@/components/admin/toast/toast'
import {
  EDITORIAL_IMAGE_MAX_BYTES,
  EDITORIAL_IMAGE_TYPES,
} from '@/lib/cms/editorial-image-files'
import type { EditorialSlot, EditorialSlotGroup } from '@/lib/cms/editorial-slots'

const GROUP_ORDER: EditorialSlotGroup[] = ['hero', 'header', 'journal', 'instagram', 'feed', 'goldylium']

export default function EditorialImagesClient({ initial }: { initial: EditorialSlot[] }) {
  const [slots, setSlots] = useState(initial)
  const [busyId, setBusyId] = useState<string | null>(null)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  const groups = useMemo(() => {
    return GROUP_ORDER
      .map((group) => ({
        group,
        label: slots.find((slot) => slot.group === group)?.groupLabel ?? group,
        items: slots.filter((slot) => slot.group === group),
      }))
      .filter((group) => group.items.length > 0)
  }, [slots])

  function replaceSlot(next: EditorialSlot | null | undefined) {
    if (!next) return
    setSlots((prev) => prev.map((slot) => (slot.id === next.id ? next : slot)))
  }

  async function upload(slot: EditorialSlot, file: File) {
    const ext = EDITORIAL_IMAGE_TYPES[file.type]
    if (!ext) {
      toast.error('WebP, JPG, PNG veya AVIF yükleyin.')
      return
    }
    if (file.size > EDITORIAL_IMAGE_MAX_BYTES) {
      toast.error('Dosya en fazla 8 MB olabilir.')
      return
    }

    setBusyId(slot.id)
    try {
      const signRes = await fetch('/api/admin/editorial-images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, contentType: file.type }),
      })
      const signed = await signRes.json().catch(() => ({}))
      if (!signRes.ok || !signed.ok || !signed.signedUrl || !signed.path) {
        toast.error(signed.message ?? 'Yükleme başlatılamadı.')
        return
      }

      const put = await fetch(signed.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      })
      if (!put.ok) {
        toast.error('Görsel depolamaya yazılamadı.')
        return
      }

      const saveRes = await fetch('/api/admin/editorial-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, path: signed.path }),
      })
      const saved = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok || !saved.ok) {
        toast.error(saved.message ?? 'Görsel siteye bağlanamadı.')
        return
      }

      replaceSlot(saved.slot)
      toast.success('Görsel güncellendi.')
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setBusyId(null)
    }
  }

  async function reset(slot: EditorialSlot) {
    setBusyId(slot.id)
    try {
      const res = await fetch('/api/admin/editorial-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Yer tutucuya dönülemedi.')
        return
      }
      replaceSlot(data.slot)
      toast.success(slot.id === 'header-logo' ? 'Logo kaldırıldı.' : 'Yer tutucu geri geldi.')
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setBusyId(null)
    }
  }

  const customCount = slots.filter((slot) => slot.custom).length

  return (
    <div className="editorial-images">
      <style>{`
        .editorial-images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .editorial-image-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .editorial-image-frame {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--ad-surface-2);
          border: 1px solid var(--ad-line);
        }
        .editorial-image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .editorial-image-empty {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: var(--ad-fg-muted);
        }
        .editorial-image-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      `}</style>

      <p style={{ margin: '0 0 28px', fontSize: 13, color: 'var(--ad-fg-muted)' }}>
        {slots.length} görsel · {customCount} tanesi yüklenmiş. Yer tutucular anasayfadaki Stitch fotoğraflarıdır.
        Yeni dosya kaydedilince vitrin hemen güncellenir.
      </p>

      {groups.map((group) => (
        <section key={group.group} style={{ marginBottom: 36 }}>
          <h2
            className="ad-mono"
            style={{
              margin: '0 0 14px',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ad-fg-muted)',
            }}
          >
            {group.label}
          </h2>
          <div className="editorial-images-grid">
            {group.items.map((slot) => {
              const busy = busyId === slot.id
              return (
                <article key={slot.id} className="ad-card editorial-image-card">
                  <div className="editorial-image-frame">
                    {slot.previewUrl ? (
                      <img src={slot.previewUrl} alt={slot.alt || slot.label} />
                    ) : (
                      <div className="editorial-image-empty">Wordmark — logo yok</div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ fontSize: 14, fontWeight: 500 }}>{slot.label}</strong>
                      <span className={slot.custom ? 'ad-badge ad-badge-success' : 'ad-badge'}>
                        {slot.custom ? 'Yüklendi' : 'Yer tutucu'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: 'var(--ad-fg-muted)' }}>
                      {slot.hint}
                    </p>
                  </div>
                  <div className="editorial-image-actions">
                    <input
                      ref={(node) => { inputs.current[slot.id] = node }}
                      type="file"
                      accept="image/webp,image/jpeg,image/png,image/avif"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (file) void upload(slot, file)
                      }}
                    />
                    <button
                      type="button"
                      className="ad-btn ad-btn-primary"
                      disabled={busy}
                      onClick={() => inputs.current[slot.id]?.click()}
                    >
                      {busy ? 'Bekleyin…' : 'Fotoğraf yükle'}
                    </button>
                    {slot.custom ? (
                      <button
                        type="button"
                        className="ad-btn ad-btn-secondary"
                        disabled={busy}
                        onClick={() => void reset(slot)}
                      >
                        Yer tutucu
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
