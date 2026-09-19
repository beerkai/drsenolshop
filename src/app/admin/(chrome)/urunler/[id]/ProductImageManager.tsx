'use client'

// ═══════════════════════════════════════════════════════════════
// Ürün görselleri — yükleme, sıralama, kapak seçimi, silme
// İlk sıradaki görsel kapaktır (products.image_url ile senkron).
// ═══════════════════════════════════════════════════════════════

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from '@/components/admin/toast/toast'

export default function ProductImageManager({
  productId,
  variantId,
  initialImages,
  onChange,
  eyebrow,
  showCoverBadge = true,
}: {
  productId: string
  /** Doluysa product_variants.images API'si kullanılır */
  variantId?: string
  initialImages: string[]
  /** Sıra değiştiğinde üst forma bildir — kaydetme formun Kaydet'inde olur */
  onChange: (images: string[]) => void
  eyebrow?: string
  showCoverBadge?: boolean
}) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const imagesApiUrl = variantId
    ? `/api/admin/products/${productId}/variants/${variantId}/images`
    : `/api/admin/products/${productId}/images`

  function apply(next: string[]) {
    setImages(next)
    onChange(next)
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const form = new FormData()
      for (const f of Array.from(files)) form.append('file', f)

      const res = await fetch(imagesApiUrl, {
        method: 'POST',
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Yükleme başarısız.')
        return
      }
      apply(data.images as string[])
      toast.success(`${data.uploaded.length} görsel yüklendi.`)
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove(url: string) {
    const res = await fetch(imagesApiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      toast.error(data.message ?? 'Silinemedi.')
      return
    }
    apply(data.images as string[])
    toast.success('Görsel silindi.')
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    apply(next)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p className="ad-eyebrow" style={{ margin: 0 }}>
          {eyebrow ?? 'Görseller'} ({images.length})
        </p>
        <button
          type="button"
          className="ad-btn ad-btn-secondary ad-btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Yükleniyor…' : '+ Görsel yükle'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {images.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--ad-fg-muted)' }}>
          Henüz görsel yok. WebP tercih edin — en fazla 8 MB.
        </p>
      ) : (
        <div className="ad-image-grid">
          {images.map((url, i) => (
            <figure key={url} className="ad-image-tile">
              <div className="ad-image-tile-frame">
                <Image
                  src={url}
                  alt={`Görsel ${i + 1}`}
                  fill
                  sizes="180px"
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                {showCoverBadge && i === 0 ? <span className="ad-image-cover">Kapak</span> : null}
              </div>
              <figcaption className="ad-image-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Sola al">
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  title="Sağa al"
                >
                  →
                </button>
                <button type="button" onClick={() => remove(url)} className="is-danger" title="Sil">
                  Sil
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)', marginTop: 10, letterSpacing: '0.05em' }}>
        {variantId
          ? 'Bu galeri yalnızca seçili varyantta gösterilir. Sıra değişikliği Kaydet ile uygulanır; yükleme ve silme anında kaydedilir.'
          : 'İlk görsel kapaktır. Sıra değişikliği formu kaydedince uygulanır; silme anında geçerlidir.'}
      </p>
    </div>
  )
}
