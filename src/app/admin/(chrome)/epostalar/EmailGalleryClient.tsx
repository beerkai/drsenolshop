'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { EmailTemplateDefinition } from '@/lib/email-template-catalog'
import { Badge } from '@/components/admin/ui/Badge'

type FilterCategory = 'all' | EmailTemplateDefinition['category']

interface Props {
  templates: EmailTemplateDefinition[]
}

const CATEGORY_LABELS: Record<EmailTemplateDefinition['category'], string> = {
  siparis: 'Sipariş',
  odeme: 'Ödeme',
  durum: 'Durum',
  auth: 'Auth',
}

export default function EmailGalleryClient({ templates }: Props) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? '')
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'err'>('idle')
  const [showRaw, setShowRaw] = useState(false)
  const [rawHtml, setRawHtml] = useState<string | null>(null)
  const [rawLoading, setRawLoading] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return templates
    return templates.filter((t) => t.category === filter)
  }, [filter, templates])

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? filtered[0] ?? templates[0],
    [filtered, selectedId, templates],
  )

  const previewSrc = selected ? `/api/admin/email-templates/preview?id=${encodeURIComponent(selected.id)}` : ''

  const loadRaw = useCallback(async () => {
    if (!selected) return
    setRawLoading(true)
    try {
      const res = await fetch(
        `/api/admin/email-templates/preview?id=${encodeURIComponent(selected.id)}&format=json`,
      )
      const data = await res.json()
      if (data.ok) setRawHtml(data.html as string)
      else setRawHtml(null)
    } catch {
      setRawHtml(null)
    } finally {
      setRawLoading(false)
    }
  }, [selected])

  async function copyHtml() {
    if (!selected) return
    setCopyState('idle')
    try {
      const res = await fetch(
        `/api/admin/email-templates/preview?id=${encodeURIComponent(selected.id)}&format=json`,
      )
      const data = await res.json()
      if (!data.ok) throw new Error('fetch')
      await navigator.clipboard.writeText(data.html as string)
      setCopyState('ok')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('err')
      setTimeout(() => setCopyState('idle'), 2500)
    }
  }

  function openFullscreen() {
    if (!previewSrc) return
    window.open(previewSrc, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="email-gallery">
      <style>{`
        .email-gallery { display: grid; grid-template-columns: minmax(260px, 320px) 1fr; gap: 20px; align-items: start; }
        @media (max-width: 960px) {
          .email-gallery { grid-template-columns: 1fr; }
        }
        .email-gallery-list { max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 4px; }
        .email-gallery-item {
          display: block; width: 100%; text-align: left; cursor: pointer;
          padding: 12px 14px; margin-bottom: 8px;
          border: 1px solid var(--ad-line-faint); background: var(--ad-surface);
          transition: border-color 0.15s, background 0.15s;
        }
        .email-gallery-item:hover { border-color: var(--ad-line); background: var(--ad-surface-2); }
        .email-gallery-item.is-active { border-color: var(--ad-gold-deep); background: var(--ad-gold-faint); }
        .email-gallery-preview-frame {
          border: 1px solid var(--ad-line-faint); background: #F4F0E8;
          transition: max-width 0.2s ease;
        }
        .email-gallery-preview-frame.w-desktop iframe { width: 100%; min-height: 720px; border: 0; display: block; }
        .email-gallery-preview-frame.w-mobile { max-width: 390px; margin: 0 auto; }
        .email-gallery-preview-frame.w-mobile iframe { width: 100%; min-height: 640px; border: 0; display: block; }
        .email-gallery-filter-btn {
          font-family: var(--font-jetbrains), monospace; font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 6px 10px; cursor: pointer;
          border: 1px solid var(--ad-line-faint); background: transparent; color: var(--ad-fg-muted);
        }
        .email-gallery-filter-btn.is-on { border-color: var(--ad-gold-deep); color: var(--ad-fg); background: var(--ad-gold-faint); }
      `}</style>

      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {(['all', 'siparis', 'odeme', 'durum', 'auth'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`email-gallery-filter-btn${filter === key ? ' is-on' : ''}`}
              onClick={() => setFilter(key)}
            >
              {key === 'all' ? 'Tümü' : CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>

        <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', margin: '0 0 10px', letterSpacing: '0.15em' }}>
          {filtered.length} şablon
        </p>

        <div className="email-gallery-list">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`email-gallery-item${selected?.id === t.id ? ' is-active' : ''}`}
              onClick={() => {
                setSelectedId(t.id)
                setShowRaw(false)
                setRawHtml(null)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Badge tone={t.channel === 'resend' ? 'gold' : 'neutral'} bracketed>
                  {t.channel === 'resend' ? 'Resend' : 'Supabase'}
                </Badge>
                <span className="ad-mono" style={{ fontSize: '9px', color: 'var(--ad-fg-faint)', letterSpacing: '0.1em' }}>
                  {CATEGORY_LABELS[t.category]}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--ad-fg)', lineHeight: 1.35 }}>
                {t.title}
              </p>
              <p className="ad-mono" style={{ margin: '6px 0 0', fontSize: '10px', color: 'var(--ad-fg-muted)', lineHeight: 1.4 }}>
                {t.subject}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div>
          <div className="ad-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: '1 1 280px' }}>
                <p className="ad-eyebrow-muted" style={{ marginBottom: '8px' }}>Seçili şablon</p>
                <h2 className="ad-display" style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 8px', color: 'var(--ad-fg)' }}>
                  {selected.title}
                </h2>
                <p style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: 1.6, color: 'var(--ad-fg-muted)' }}>
                  {selected.description}
                </p>
                <KV label="Konu" value={selected.subject} />
                <KV label="Tetikleyici" value={selected.trigger} mono />
                {selected.supabaseTemplateName && (
                  <KV label="Supabase template" value={selected.supabaseTemplateName} mono />
                )}
                {selected.authFile && (
                  <KV label="Dosya" value={`supabase/email-templates/${selected.authFile}`} mono />
                )}
                {selected.codeRef && <KV label="Kod" value={selected.codeRef} mono />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <ToolbarButton onClick={() => setPreviewWidth('desktop')} active={previewWidth === 'desktop'}>
                    Masaüstü
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setPreviewWidth('mobile')} active={previewWidth === 'mobile'}>
                    Mobil 390px
                  </ToolbarButton>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <ToolbarButton onClick={openFullscreen}>Yeni sekme</ToolbarButton>
                  <ToolbarButton onClick={copyHtml}>
                    {copyState === 'ok' ? 'Kopyalandı ✓' : copyState === 'err' ? 'Hata' : 'HTML kopyala'}
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      const next = !showRaw
                      setShowRaw(next)
                      if (next && !rawHtml) void loadRaw()
                    }}
                  >
                    {showRaw ? 'Önizleme' : 'Kaynak HTML'}
                  </ToolbarButton>
                </div>
              </div>
            </div>

            {selected.channel === 'supabase_auth' && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  border: '1px solid var(--ad-line-faint)',
                  background: 'var(--ad-surface-2)',
                }}
              >
                <p className="ad-eyebrow-muted" style={{ marginBottom: '10px' }}>Supabase&apos;e yapıştırma</p>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: 1.75, color: 'var(--ad-fg-muted)' }}>
                  <li>Dashboard → Authentication → Email Templates → <strong>{selected.supabaseTemplateName}</strong></li>
                  <li>Subject: <code style={{ fontSize: '11px' }}>{selected.subject}</code></li>
                  <li>Message body: repo dosyasındaki ham HTML (değişkenler <code>{'{{ .ConfirmationURL }}'}</code> vb. korunmalı)</li>
                  <li>Site URL + Redirect URLs: <code>{process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drsenol.shop'}</code> ve <code>/auth/callback</code></li>
                </ol>
              </div>
            )}

            {selected.channel === 'resend' && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  border: '1px solid var(--ad-line-faint)',
                  background: 'var(--ad-surface-2)',
                }}
              >
                <p className="ad-eyebrow-muted" style={{ marginBottom: '8px' }}>Resend · operasyon</p>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.7, color: 'var(--ad-fg-muted)' }}>
                  Gönderim <code>RESEND_API_KEY</code> ile sunucudan yapılır. Domain doğrulaması Resend panelinde;
                  gönderen varsayılan <code>siparis@drsenol.shop</code>. Önizlemede örnek sipariş{' '}
                  <code>DS-2026-0042</code> kullanılır.
                </p>
              </div>
            )}
          </div>

          {showRaw ? (
            <div className="ad-card">
              <p className="ad-eyebrow-muted" style={{ marginBottom: '10px' }}>HTML kaynağı</p>
              {rawLoading && <p style={{ fontSize: '13px', color: 'var(--ad-fg-muted)' }}>Yükleniyor…</p>}
              {!rawLoading && rawHtml && (
                <pre
                  style={{
                    margin: 0,
                    maxHeight: '720px',
                    overflow: 'auto',
                    fontSize: '11px',
                    lineHeight: 1.45,
                    padding: '14px',
                    background: 'var(--ad-surface-2)',
                    border: '1px solid var(--ad-line-faint)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {rawHtml}
                </pre>
              )}
            </div>
          ) : (
            <div className={`email-gallery-preview-frame ${previewWidth === 'mobile' ? 'w-mobile' : 'w-desktop'}`}>
              <iframe title={`E-posta önizleme: ${selected.title}`} src={previewSrc} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid var(--ad-line-faint)' }}>
      <span className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', minWidth: '100px' }}>
        {label}
      </span>
      <span
        className={mono ? 'ad-mono' : undefined}
        style={{ fontSize: mono ? '11px' : '13px', color: 'var(--ad-fg)', lineHeight: 1.5, flex: 1 }}
      >
        {value}
      </span>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ad-mono"
      style={{
        fontSize: '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '8px 12px',
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--ad-gold-deep)' : 'var(--ad-line-faint)'}`,
        background: active ? 'var(--ad-gold-faint)' : 'var(--ad-surface)',
        color: 'var(--ad-fg)',
      }}
    >
      {children}
    </button>
  )
}
