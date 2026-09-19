'use client'

// ═══════════════════════════════════════════════════════════════
// Tema editörü — anasayfa içeriği + katalog etiketleri
// ─ Sol: bölümlere ayrılmış form
// ─ Sağ: seçili bölümün canlı önizlemesi (site tipografisiyle)
// ─ Kaydet → POST /api/admin/home-content → site_settings.home_content
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo, useState } from 'react'
import { toast } from '@/components/admin/toast/toast'
import type { HomeContent } from '@/lib/cms/home-content'
import type { EditorialFeedItem } from '@/types/editorial-home'

interface ProductOption {
  id: string
  name: string
  slug: string
  price: string
  image: string | null
  category: string
}

type SectionId = 'hero' | 'strip' | 'curated' | 'feed' | 'journal' | 'labels' | 'footer'

const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'hero', label: 'Hero', hint: 'Anasayfa açılış bloğu' },
  { id: 'strip', label: 'Hasat Şeridi', hint: 'Hero altındaki bant' },
  { id: 'curated', label: 'Keşfet Vitrini', hint: 'En çok tercih edilenler & Signature' },
  { id: 'feed', label: 'Eski Feed (opsiyonel)', hint: 'Mock editöryal akış — varsayılan kapalı' },
  { id: 'journal', label: 'Günlük', hint: 'Editöryal anlatı bölümü' },
  { id: 'labels', label: 'Katalog Etiketleri', hint: 'Kart, buton ve durum metinleri' },
  { id: 'footer', label: 'Alt Bilgi', hint: 'Telif ve künye' },
]

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3 }} />
      <span>
        <span className="ad-label" style={{ display: 'block' }}>
          {label}
        </span>
        {hint ? (
          <span className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)' }}>
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  )
}

/** Derin kopya — iç içe nesneleri mutasyondan korur */
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function Field({
  label,
  value,
  onChange,
  hint,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  multiline?: boolean
}) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span className="ad-label">{label}</span>
      {multiline ? (
        <textarea
          className="ad-textarea"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="ad-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? (
        <span
          className="ad-mono"
          style={{ display: 'block', marginTop: 4, fontSize: 10, color: 'var(--ad-fg-faint)' }}
        >
          {hint}
        </span>
      ) : null}
    </label>
  )
}

export default function ThemeEditorClient({
  initialContent,
  products,
}: {
  initialContent: HomeContent
  products: ProductOption[]
}) {
  const [content, setContent] = useState<HomeContent>(() => clone(initialContent))
  const [section, setSection] = useState<SectionId>('hero')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const update = useCallback((mutator: (draft: HomeContent) => void) => {
    setContent((prev) => {
      const next = clone(prev)
      mutator(next)
      return next
    })
    setDirty(true)
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/home-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
        return
      }
      toast.success('Tema içeriği kaydedildi.')
      setDirty(false)
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setContent(clone(initialContent))
    setDirty(false)
    toast.info('Değişiklikler geri alındı.')
  }

  // Akıştaki ürün kartları (öne çıkan ürün seçimi bunlar üzerinden)
  const productCards = useMemo(
    () =>
      content.editorial.feed.items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.type === 'product' || item.type === 'product-dark'),
    [content.editorial.feed.items]
  )

  return (
    <div>
      {/* Başlık + aksiyonlar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
            Görünüm
          </p>
          <h1
            className="ad-display"
            style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
          >
            Tema Editörü
          </h1>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ad-fg-muted)' }}>
            Anasayfa metinleri, öne çıkan ürünler ve katalog etiketleri.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {dirty ? (
            <span className="ad-badge ad-badge-warning">Kaydedilmemiş değişiklik</span>
          ) : null}
          <button type="button" className="ad-btn ad-btn-secondary" onClick={reset} disabled={!dirty}>
            Geri Al
          </button>
          <button type="button" className="ad-btn ad-btn-primary" onClick={save} disabled={saving || !dirty}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Bölüm sekmeleri */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={section === s.id ? 'ad-btn ad-btn-primary ad-btn-sm' : 'ad-btn ad-btn-secondary ad-btn-sm'}
            title={s.hint}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="theme-editor-grid">
        {/* ── FORM ─────────────────────────────────────────── */}
        <div className="ad-card">
          {section === 'hero' ? (
            <>
              <Field
                label="Üst etiket (eyebrow)"
                value={content.hero.eyebrow}
                onChange={(v) => update((d) => { d.hero.eyebrow = v })}
              />
              <Field
                label="Başlık"
                multiline
                value={content.hero.title}
                onChange={(v) => update((d) => { d.hero.title = v })}
              />
              <Field
                label="Alt metin"
                multiline
                value={content.hero.subtitle}
                onChange={(v) => update((d) => { d.hero.subtitle = v })}
              />
              <Field
                label="Buton metni"
                value={content.hero.cta.label}
                onChange={(v) => update((d) => { d.hero.cta.label = v })}
              />
              <Field
                label="Buton bağlantısı"
                value={content.hero.cta.href}
                hint="Örn. /koleksiyon"
                onChange={(v) => update((d) => { d.hero.cta.href = v })}
              />
              <Field
                label="Hasat kodu"
                value={content.hero.metaLabel ?? ''}
                onChange={(v) => update((d) => { d.hero.metaLabel = v })}
              />
              <Field
                label="Duyuru şeridi"
                value={content.editorial.header.announcement}
                onChange={(v) => update((d) => { d.editorial.header.announcement = v })}
              />
              <Field
                label="Duyuru vurgusu"
                value={content.editorial.header.announcementAccent ?? ''}
                onChange={(v) => update((d) => { d.editorial.header.announcementAccent = v })}
              />
            </>
          ) : null}

          {section === 'curated' ? (
            <>
              <Toggle
                label="Eski mock ürün feed'ini göster"
                checked={content.curated.legacyFeedEnabled}
                onChange={(v) => update((d) => { d.curated.legacyFeedEnabled = v })}
                hint="Kapalıyken yalnızca canlı katalog vitrinleri görünür (önerilen)."
              />

              <div className="ad-divider" style={{ margin: '20px 0' }} />
              <p className="ad-label">En Çok Tercih Edilenler</p>
              <Toggle
                label="Bölümü göster"
                checked={content.curated.mostPreferred.enabled}
                onChange={(v) => update((d) => { d.curated.mostPreferred.enabled = v })}
              />
              <Field
                label="Üst etiket"
                value={content.curated.mostPreferred.eyebrow}
                onChange={(v) => update((d) => { d.curated.mostPreferred.eyebrow = v })}
              />
              <Field
                label="Başlık"
                value={content.curated.mostPreferred.title}
                onChange={(v) => update((d) => { d.curated.mostPreferred.title = v })}
              />
              <Field
                label="Açıklama"
                multiline
                value={content.curated.mostPreferred.description}
                onChange={(v) => update((d) => { d.curated.mostPreferred.description = v })}
              />
              <Field
                label="Kategori slug (otomatik liste)"
                value={content.curated.mostPreferred.categorySlug}
                hint="Boş manuel liste yoksa bu kategoriden çekilir (ör. bal)"
                onChange={(v) => update((d) => { d.curated.mostPreferred.categorySlug = v })}
              />
              <Field
                label="Tümünü gör linki"
                value={content.curated.mostPreferred.viewAllHref}
                onChange={(v) => update((d) => { d.curated.mostPreferred.viewAllHref = v })}
              />
              <Field
                label="Tümünü gör metni"
                value={content.curated.mostPreferred.viewAllLabel}
                onChange={(v) => update((d) => { d.curated.mostPreferred.viewAllLabel = v })}
              />

              <p className="ad-label" style={{ marginTop: 8 }}>
                Manuel ürün seçimi ({content.curated.mostPreferred.productIds.length}/8)
              </p>
              <p style={{ fontSize: 12, color: 'var(--ad-fg-muted)', marginBottom: 8 }}>
                Liste doluysa kategori yerine bu sıra kullanılır.
              </p>
              {content.curated.mostPreferred.productIds.map((id, i) => {
                const p = products.find((x) => x.id === id)
                return (
                  <div key={id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span className="ad-mono" style={{ fontSize: 11, flex: 1 }}>
                      {p?.name ?? id}
                    </span>
                    <button
                      type="button"
                      className="ad-btn ad-btn-secondary ad-btn-sm"
                      onClick={() =>
                        update((d) => {
                          d.curated.mostPreferred.productIds.splice(i, 1)
                        })
                      }
                    >
                      Kaldır
                    </button>
                  </div>
                )
              })}
              {content.curated.mostPreferred.productIds.length < 8 ? (
                <select
                  className="ad-select"
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    update((d) => {
                      if (!d.curated.mostPreferred.productIds.includes(id)) {
                        d.curated.mostPreferred.productIds.push(id)
                      }
                    })
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Ürün ekle…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <div className="ad-divider" style={{ margin: '24px 0' }} />
              <p className="ad-label">Signature Series</p>
              <Toggle
                label="Bölümü göster"
                checked={content.curated.signature.enabled}
                onChange={(v) => update((d) => { d.curated.signature.enabled = v })}
              />
              <Toggle
                label="Koyu kart stili (product-dark)"
                checked={content.curated.signature.darkCards}
                onChange={(v) => update((d) => { d.curated.signature.darkCards = v })}
                hint="Açık/koyu grid görünümü."
              />
              <Field
                label="Üst etiket"
                value={content.curated.signature.eyebrow}
                onChange={(v) => update((d) => { d.curated.signature.eyebrow = v })}
              />
              <Field
                label="Başlık"
                value={content.curated.signature.title}
                onChange={(v) => update((d) => { d.curated.signature.title = v })}
              />
              <Field
                label="Kategori slug"
                value={content.curated.signature.categorySlug}
                onChange={(v) => update((d) => { d.curated.signature.categorySlug = v })}
              />
              <Field
                label="Tümünü gör linki"
                value={content.curated.signature.viewAllHref}
                onChange={(v) => update((d) => { d.curated.signature.viewAllHref = v })}
              />
              <Field
                label="Tümünü gör metni"
                value={content.curated.signature.viewAllLabel}
                onChange={(v) => update((d) => { d.curated.signature.viewAllLabel = v })}
              />

              <p className="ad-label" style={{ marginTop: 8 }}>
                Manuel ürün seçimi ({content.curated.signature.productIds.length}/8)
              </p>
              {content.curated.signature.productIds.map((id, i) => {
                const p = products.find((x) => x.id === id)
                return (
                  <div key={id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span className="ad-mono" style={{ fontSize: 11, flex: 1 }}>
                      {p?.name ?? id}
                    </span>
                    <button
                      type="button"
                      className="ad-btn ad-btn-secondary ad-btn-sm"
                      onClick={() =>
                        update((d) => {
                          d.curated.signature.productIds.splice(i, 1)
                        })
                      }
                    >
                      Kaldır
                    </button>
                  </div>
                )
              })}
              {content.curated.signature.productIds.length < 8 ? (
                <select
                  className="ad-select"
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    update((d) => {
                      if (!d.curated.signature.productIds.includes(id)) {
                        d.curated.signature.productIds.push(id)
                      }
                    })
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Ürün ekle…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </>
          ) : null}

          {section === 'strip' ? (
            <>
              <Field
                label="Şerit başlığı"
                value={content.curationStrip.harvestTitle}
                onChange={(v) => update((d) => { d.curationStrip.harvestTitle = v })}
              />
              <Field
                label="Şerit açıklaması"
                value={content.curationStrip.harvestDetail}
                onChange={(v) => update((d) => { d.curationStrip.harvestDetail = v })}
              />
              <span className="ad-label">Vurgular</span>
              {content.curationStrip.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="ad-input"
                    value={h}
                    onChange={(e) =>
                      update((d) => { d.curationStrip.highlights[i] = e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="ad-btn ad-btn-secondary ad-btn-sm"
                    onClick={() => update((d) => { d.curationStrip.highlights.splice(i, 1) })}
                  >
                    Sil
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ad-btn ad-btn-secondary ad-btn-sm"
                onClick={() => update((d) => { d.curationStrip.highlights.push('Yeni vurgu') })}
              >
                + Vurgu ekle
              </button>
            </>
          ) : null}

          {section === 'feed' ? (
            <>
              <Toggle
                label="Legacy feed'i anasayfada göster"
                checked={content.curated.legacyFeedEnabled}
                onChange={(v) => update((d) => { d.curated.legacyFeedEnabled = v })}
                hint="Keşfet Vitrini sekmesindeki ana anahtar ile aynı."
              />
              <Field
                label="Bölüm üst etiketi"
                value={content.editorial.feed.header.eyebrow}
                onChange={(v) => update((d) => { d.editorial.feed.header.eyebrow = v })}
              />
              <Field
                label="Bölüm başlığı"
                value={content.editorial.feed.header.title}
                onChange={(v) => update((d) => { d.editorial.feed.header.title = v })}
              />
              <Field
                label="Sağdaki not"
                value={content.editorial.feed.header.aside}
                onChange={(v) => update((d) => { d.editorial.feed.header.aside = v })}
              />

              <div className="ad-divider" style={{ margin: '20px 0' }} />

              <p className="ad-label" style={{ marginBottom: 12 }}>
                Öne çıkan ürün kartları ({productCards.length})
              </p>
              <p style={{ fontSize: 12, color: 'var(--ad-fg-muted)', marginBottom: 16 }}>
                Her kart için katalogdan bir ürün seçin — ad, fiyat ve görsel o üründen alınır.
              </p>

              {productCards.map(({ item, index }) => {
                if (item.type !== 'product' && item.type !== 'product-dark') return null
                const matched = products.find((p) => `/urun/${p.slug}` === item.href)
                return (
                  <div
                    key={item.id}
                    className="ad-card-sm"
                    style={{ marginBottom: 12, padding: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span className="ad-badge ad-badge-neutral">{item.type === 'product-dark' ? 'Koyu kart' : 'Kart'}</span>
                      <span className="ad-mono" style={{ fontSize: 11, color: 'var(--ad-fg-faint)' }}>
                        #{index + 1}
                      </span>
                    </div>

                    <label style={{ display: 'block', marginBottom: 10 }}>
                      <span className="ad-label">Ürün</span>
                      <select
                        className="ad-select"
                        value={matched?.id ?? ''}
                        onChange={(e) => {
                          const p = products.find((x) => x.id === e.target.value)
                          if (!p) return
                          update((d) => {
                            const target = d.editorial.feed.items[index] as Extract<
                              EditorialFeedItem,
                              { type: 'product' | 'product-dark' }
                            >
                            target.href = `/urun/${p.slug}`
                            target.title = p.name
                            target.price = p.price
                            target.category = p.category
                            if (p.image) target.image = { src: p.image, alt: p.name }
                          })
                        }}
                      >
                        <option value="">— Elle girilmiş içerik —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <Field
                      label="Kart başlığı"
                      value={item.title}
                      onChange={(v) =>
                        update((d) => {
                          const t = d.editorial.feed.items[index] as Extract<
                            EditorialFeedItem,
                            { type: 'product' | 'product-dark' }
                          >
                          t.title = v
                        })
                      }
                    />
                    <Field
                      label="Kategori etiketi"
                      value={item.category}
                      onChange={(v) =>
                        update((d) => {
                          const t = d.editorial.feed.items[index] as Extract<
                            EditorialFeedItem,
                            { type: 'product' | 'product-dark' }
                          >
                          t.category = v
                        })
                      }
                    />
                    <Field
                      label="Fiyat metni"
                      value={item.price}
                      hint="Görsel metindir; sepet fiyatı ürün kaydından gelir."
                      onChange={(v) =>
                        update((d) => {
                          const t = d.editorial.feed.items[index] as Extract<
                            EditorialFeedItem,
                            { type: 'product' | 'product-dark' }
                          >
                          t.price = v
                        })
                      }
                    />
                    <Field
                      label="Buton metni"
                      value={item.ctaLabel}
                      onChange={(v) =>
                        update((d) => {
                          const t = d.editorial.feed.items[index] as Extract<
                            EditorialFeedItem,
                            { type: 'product' | 'product-dark' }
                          >
                          t.ctaLabel = v
                        })
                      }
                    />
                  </div>
                )
              })}
            </>
          ) : null}

          {section === 'journal' ? (
            <>
              <Field
                label="Başlık"
                multiline
                value={content.editorial.journal.title}
                onChange={(v) => update((d) => { d.editorial.journal.title = v })}
              />
              <span className="ad-label">Paragraflar</span>
              {content.editorial.journal.paragraphs.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <textarea
                    className="ad-textarea"
                    rows={3}
                    value={p}
                    onChange={(e) =>
                      update((d) => { d.editorial.journal.paragraphs[i] = e.target.value })
                    }
                  />
                </div>
              ))}
              <div className="ad-divider" style={{ margin: '20px 0' }} />
              <span className="ad-label">Metrikler</span>
              {content.editorial.journal.metrics.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="ad-input"
                    value={m.value}
                    onChange={(e) =>
                      update((d) => { d.editorial.journal.metrics[i].value = e.target.value })
                    }
                    placeholder="Değer"
                  />
                  <input
                    className="ad-input"
                    value={m.label}
                    onChange={(e) =>
                      update((d) => { d.editorial.journal.metrics[i].label = e.target.value })
                    }
                    placeholder="Etiket"
                  />
                </div>
              ))}
            </>
          ) : null}

          {section === 'labels' ? (
            <>
              <p style={{ fontSize: 12, color: 'var(--ad-fg-muted)', marginBottom: 16 }}>
                Bu metinler ürün kartlarında, ürün sayfasında ve koleksiyon sayfasında kullanılır.
              </p>
              <Field
                label="Sepete ekle butonu"
                value={content.productLabels.addToCart}
                onChange={(v) => update((d) => { d.productLabels.addToCart = v })}
              />
              <Field
                label="Sepete eklendi (onay)"
                value={content.productLabels.addedToCart}
                onChange={(v) => update((d) => { d.productLabels.addedToCart = v })}
              />
              <Field
                label="Tükendi etiketi"
                hint="Kartlarda, varyant düğmesinde ve detay butonunda kullanılır."
                value={content.productLabels.outOfStock}
                onChange={(v) => update((d) => { d.productLabels.outOfStock = v })}
              />
              <Field
                label="Varyanttan fiyat metni"
                hint="Ürünün tek fiyatı yoksa kartta bunun yerine bu yazar."
                value={content.productLabels.variantPricePlaceholder}
                onChange={(v) => update((d) => { d.productLabels.variantPricePlaceholder = v })}
              />
              <Field
                label="Varyant başlığı"
                value={content.productLabels.variantHeading}
                onChange={(v) => update((d) => { d.productLabels.variantHeading = v })}
              />
              <Field
                label="Varyant notu"
                value={content.productLabels.variantNote}
                onChange={(v) => update((d) => { d.productLabels.variantNote = v })}
              />
              <Field
                label="Varyant — seçili"
                value={content.productLabels.variantSelected}
                onChange={(v) => update((d) => { d.productLabels.variantSelected = v })}
              />
              <Field
                label="Varyant — mevcut"
                value={content.productLabels.variantAvailable}
                onChange={(v) => update((d) => { d.productLabels.variantAvailable = v })}
              />
              <Field
                label="Boş sonuç başlığı"
                value={content.productLabels.emptyTitle}
                onChange={(v) => update((d) => { d.productLabels.emptyTitle = v })}
              />
              <Field
                label="Boş sonuç ipucu"
                value={content.productLabels.emptyHint}
                onChange={(v) => update((d) => { d.productLabels.emptyHint = v })}
              />
            </>
          ) : null}

          {section === 'footer' ? (
            <>
              <Field
                label="Telif satırı"
                value={content.editorial.footer.copyright}
                onChange={(v) => update((d) => { d.editorial.footer.copyright = v })}
              />
              <Field
                label="Slogan"
                value={content.editorial.footer.tagline}
                onChange={(v) => update((d) => { d.editorial.footer.tagline = v })}
              />
              <Field
                label="Instagram etiketi"
                value={content.editorial.footer.instagramHandle.label}
                onChange={(v) => update((d) => { d.editorial.footer.instagramHandle.label = v })}
              />
              <Field
                label="Instagram bağlantısı"
                value={content.editorial.footer.instagramHandle.href}
                onChange={(v) => update((d) => { d.editorial.footer.instagramHandle.href = v })}
              />
            </>
          ) : null}
        </div>

        {/* ── ÖNİZLEME ──────────────────────────────────────── */}
        <div className="ad-card" style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: 12 }}>
            Önizleme
          </p>
          <div className="theme-preview">
            {section === 'hero' || section === 'strip' ? (
              <div className="theme-preview-dark">
                <p className="tp-eyebrow">{content.hero.eyebrow}</p>
                <h2 className="tp-title">{content.hero.title}</h2>
                <p className="tp-body">{content.hero.subtitle}</p>
                <p className="tp-cta">{content.hero.cta.label} →</p>
                {section === 'strip' ? (
                  <div className="tp-strip">
                    <strong>{content.curationStrip.harvestTitle}</strong>{' '}
                    {content.curationStrip.harvestDetail}
                    <div className="tp-strip-tags">
                      {content.curationStrip.highlights.map((h) => (
                        <span key={h}>{h}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {section === 'curated' ? (
              <div>
                <p className="tp-eyebrow-amber">{content.curated.mostPreferred.eyebrow}</p>
                <h2 className="tp-title-light">{content.curated.mostPreferred.title}</h2>
                <p className="tp-body-light">{content.curated.mostPreferred.description}</p>
                <p className="tp-aside" lang="en">
                  Signature · {content.curated.signature.darkCards ? 'dark cards' : 'light cards'}
                </p>
              </div>
            ) : null}

            {section === 'feed' ? (
              <div>
                <p className="tp-eyebrow-amber">{content.editorial.feed.header.eyebrow}</p>
                <h2 className="tp-title-light">{content.editorial.feed.header.title}</h2>
                <p className="tp-aside">{content.editorial.feed.header.aside}</p>
                <div className="tp-cards">
                  {productCards.slice(0, 4).map(({ item }) => {
                    if (item.type !== 'product' && item.type !== 'product-dark') return null
                    return (
                      <div key={item.id} className="tp-card">
                        <span className="tp-card-cat">{item.category}</span>
                        <span className="tp-card-title">{item.title}</span>
                        <span className="tp-card-row">
                          <span className="tp-card-price">{item.price}</span>
                          <span className="tp-card-cta">{item.ctaLabel}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {section === 'journal' ? (
              <div>
                <h2 className="tp-title-light">{content.editorial.journal.title}</h2>
                {content.editorial.journal.paragraphs.map((p, i) => (
                  <p key={i} className="tp-body-light">
                    {p}
                  </p>
                ))}
                <div className="tp-metrics">
                  {content.editorial.journal.metrics.map((m, i) => (
                    <div key={i}>
                      <strong>{m.value}</strong>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {section === 'labels' ? (
              <div className="tp-cards">
                <div className="tp-card">
                  <span className="tp-card-cat">Bal Çeşitleri</span>
                  <span className="tp-card-title">Örnek Ürün</span>
                  <span className="tp-card-row">
                    <span className="tp-card-price">
                      {content.productLabels.variantPricePlaceholder}
                    </span>
                    <span className="tp-card-cta">{content.productLabels.outOfStock}</span>
                  </span>
                </div>
                <div className="tp-btn-stack">
                  <span className="tp-btn-primary">{content.productLabels.addToCart}</span>
                  <span className="tp-btn-primary tp-btn-ok">{content.productLabels.addedToCart}</span>
                  <span className="tp-btn-muted">{content.productLabels.outOfStock}</span>
                  <span className="tp-variant">
                    {content.productLabels.variantHeading}
                    <em>{content.productLabels.variantNote}</em>
                  </span>
                  <span className="tp-variant">
                    {content.productLabels.variantSelected}
                    <em>{content.productLabels.variantAvailable}</em>
                  </span>
                </div>
              </div>
            ) : null}

            {section === 'footer' ? (
              <div className="tp-footer">
                <p>{content.editorial.footer.copyright}</p>
                <p>{content.editorial.footer.instagramHandle.label}</p>
                <p>{content.editorial.footer.tagline}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
