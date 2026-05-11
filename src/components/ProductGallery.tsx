'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [errors, setErrors] = useState<Record<number, boolean>>({})

  const hasMultiple = images.length > 1
  const selected = images[selectedIdx] ?? null

  function prev() { setSelectedIdx(i => (i - 1 + images.length) % images.length) }
  function next() { setSelectedIdx(i => (i + 1) % images.length) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Ana görsel */}
      <div style={{ position: 'relative', aspectRatio: '4 / 5', backgroundColor: '#141210', overflow: 'hidden' }}>
        {selected && !errors[selectedIdx] ? (
          <Image
            src={selected}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            style={{ objectFit: 'cover' }}
            onError={() => setErrors(p => ({ ...p, [selectedIdx]: true }))}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-cormorant)', color: '#3A3530', fontStyle: 'italic', fontSize: '18px', margin: 0, textAlign: 'center', padding: '0 24px' }}>
              {productName}
            </p>
          </div>
        )}

        {hasMultiple && (
          <>
            <button type="button" onClick={prev} aria-label="Önceki"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,9,8,0.72)', border: '1px solid rgba(244,240,232,0.12)', color: '#F4F0E8', cursor: 'pointer', zIndex: 2, fontSize: '16px' }}>
              ←
            </button>
            <button type="button" onClick={next} aria-label="Sonraki"
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,9,8,0.72)', border: '1px solid rgba(244,240,232,0.12)', color: '#F4F0E8', cursor: 'pointer', zIndex: 2, fontSize: '16px' }}>
              →
            </button>
          </>
        )}

        {/* Görsel sayacı */}
        {hasMultiple && (
          <div style={{ position: 'absolute', bottom: '14px', right: '14px', fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.2em', color: '#B8B0A0', backgroundColor: 'rgba(10,9,8,0.7)', padding: '4px 8px' }}>
            {selectedIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Küçük resimler */}
      {hasMultiple && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {images.map((img, idx) => (
            <button key={idx} type="button" onClick={() => setSelectedIdx(idx)} aria-pressed={idx === selectedIdx} aria-label={`Görsel ${idx + 1}`}
              style={{ position: 'relative', flexShrink: 0, width: '68px', height: '85px', border: idx === selectedIdx ? '1px solid #C9A961' : '1px solid rgba(244,240,232,0.1)', overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'transparent', transition: 'border-color 0.2s' }}>
              {!errors[idx] ? (
                <Image src={img} alt={`${productName} ${idx + 1}`} fill sizes="68px" style={{ objectFit: 'cover', opacity: idx === selectedIdx ? 1 : 0.55, transition: 'opacity 0.2s' }} onError={() => setErrors(p => ({ ...p, [idx]: true }))} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: '#141210', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#3A3530', fontSize: '10px' }}>—</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
