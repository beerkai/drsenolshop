'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'
import {
  HOME_HTML_STRIP_TEMPLATE,
  MAX_HOME_HTML_BLOCKS,
  newHomeHtmlBlockId,
  sanitizeHomeHtml,
  type HomeHtmlBlock,
} from '@/lib/cms/home-html'

type EditorMode = 'visual' | 'html'

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction
  if (next < 0 || next >= list.length) return list
  const copy = list.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

export default function HtmlBlocksEditor({ initialBlocks }: { initialBlocks: HomeHtmlBlock[] }) {
  const router = useRouter()
  const visualRef = useRef<HTMLDivElement>(null)
  const htmlRef = useRef<HTMLTextAreaElement>(null)
  const [blocks, setBlocks] = useState<HomeHtmlBlock[]>(initialBlocks)
  const [selectedId, setSelectedId] = useState<string | null>(initialBlocks[0]?.id ?? null)
  const [mode, setMode] = useState<EditorMode>('visual')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const selected = blocks.find((block) => block.id === selectedId) ?? null
  const selectedIndex = blocks.findIndex((block) => block.id === selectedId)

  useEffect(() => {
    if (mode !== 'visual' || !visualRef.current) return
    const block = blocks.find((item) => item.id === selectedId)
    visualRef.current.innerHTML = block?.html ?? ''
    // Yalnızca şerit veya sekme değişince doldur; her tuşta innerHTML yazmak imleci sıfırlar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedId])

  function patchSelected(patch: Partial<HomeHtmlBlock>) {
    if (!selectedId) return
    setDirty(true)
    setBlocks((prev) => prev.map((block) => (block.id === selectedId ? { ...block, ...patch } : block)))
  }

  function readVisualHtml(): string {
    return visualRef.current?.innerHTML ?? selected?.html ?? ''
  }

  function flushVisual() {
    if (mode !== 'visual' || !selectedId) return
    const html = readVisualHtml()
    setBlocks((prev) => prev.map((block) => (block.id === selectedId ? { ...block, html } : block)))
  }

  function switchMode(next: EditorMode) {
    if (next === mode) return
    if (next === 'html') flushVisual()
    setMode(next)
  }

  function selectBlock(id: string) {
    flushVisual()
    setSelectedId(id)
  }

  function addBlock() {
    if (blocks.length >= MAX_HOME_HTML_BLOCKS) {
      toast.warning(`En fazla ${MAX_HOME_HTML_BLOCKS} şerit ekleyebilirsiniz.`)
      return
    }
    flushVisual()
    const block: HomeHtmlBlock = {
      id: newHomeHtmlBlockId(),
      name: `Şerit ${blocks.length + 1}`,
      enabled: true,
      html: '',
    }
    setDirty(true)
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
    setMode('visual')
  }

  function removeSelected() {
    if (!selectedId) return
    const ok = window.confirm('Bu şerit silinsin mi?')
    if (!ok) return
    const next = blocks.filter((block) => block.id !== selectedId)
    setDirty(true)
    setBlocks(next)
    setSelectedId(next[0]?.id ?? null)
  }

  function keepEditorFocus(event: MouseEvent) {
    event.preventDefault()
  }

  function applyCommand(command: string, value?: string) {
    if (mode === 'html') return
    visualRef.current?.focus()
    document.execCommand(command, false, value)
    patchSelected({ html: readVisualHtml() })
  }

  function insertHtml(snippet: string) {
    setDirty(true)
    if (mode === 'html' && htmlRef.current && selected) {
      const el = htmlRef.current
      const start = el.selectionStart ?? selected.html.length
      const end = el.selectionEnd ?? start
      const next = selected.html.slice(0, start) + snippet + selected.html.slice(end)
      patchSelected({ html: next })
      requestAnimationFrame(() => {
        el.focus()
        const cursor = start + snippet.length
        el.setSelectionRange(cursor, cursor)
      })
      return
    }
    visualRef.current?.focus()
    document.execCommand('insertHTML', false, snippet)
    patchSelected({ html: readVisualHtml() })
  }

  function insertStripTemplate() {
    if (selected?.html.trim()) {
      const ok = window.confirm('Mevcut içeriğin yerine şerit şablonu yazılsın mı?')
      if (!ok) return
    }
    setDirty(true)
    patchSelected({ html: HOME_HTML_STRIP_TEMPLATE })
    if (mode === 'visual' && visualRef.current) {
      visualRef.current.innerHTML = HOME_HTML_STRIP_TEMPLATE
    }
  }

  function addLink() {
    const href = window.prompt('Bağlantı adresi', 'https://')
    if (!href?.trim()) return
    const url = href.trim().replace(/"/g, '%22')
    if (mode === 'html') {
      insertHtml(`<a href="${url}">bağlantı</a>`)
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      insertHtml(`<a href="${url}">bağlantı</a>`)
      return
    }
    applyCommand('createLink', url)
  }

  async function handleSave() {
    if (saving) return
    const snapshot =
      mode === 'visual' && selectedId
        ? blocks.map((block) => (block.id === selectedId ? { ...block, html: readVisualHtml() } : block))
        : blocks
    setBlocks(snapshot)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/html-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: snapshot }),
      })
      const data = (await res.json()) as { ok?: boolean; message?: string; blocks?: HomeHtmlBlock[] }
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kayıt başarısız.')
        return
      }
      if (Array.isArray(data.blocks)) setBlocks(data.blocks)
      setDirty(false)
      toast.success('Şeritler kaydedildi.')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  const previewHtml = sanitizeHomeHtml(
    mode === 'visual' && selected ? selected.html : (selected?.html ?? ''),
  )

  return (
    <div className="html-blocks-editor">
      <style>{`
        .html-blocks-editor { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 16px; align-items: start; }
        @media (max-width: 860px) {
          .html-blocks-editor { grid-template-columns: 1fr; }
        }
        .html-block-row { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--ad-line-faint); background: transparent; color: var(--ad-fg); cursor: pointer; }
        .html-block-row.is-active { background: var(--ad-surface-2, rgba(201, 169, 97, 0.08)); }
        .html-editor-toolbar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .html-visual {
          min-height: 220px;
          padding: 16px;
          background: #fff;
          color: #1a1814;
          border: 1px solid var(--ad-line);
          outline: none;
          font-size: 15px;
          line-height: 1.55;
        }
        .html-visual:empty:before { content: 'Metni buraya yazın veya HTML sekmesine geçin.'; color: #8a8175; }
        .html-visual a { color: #8a6a2f; }
        .html-code {
          min-height: 280px;
          font-family: var(--font-jetbrains), ui-monospace, monospace;
          font-size: 12px;
          line-height: 1.6;
          tab-size: 2;
        }
        .html-preview {
          margin-top: 16px;
          background: #F4F0E8;
          color: #1a1814;
          border: 1px solid var(--ad-line);
          min-height: 72px;
        }
        .html-preview img, .html-preview video { max-width: 100%; height: auto; }
      `}</style>

      <div className="ad-card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 14px 10px' }}>
          <span className="ad-label" style={{ margin: 0 }}>
            Şeritler
          </span>
          <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onClick={addBlock}>
            Ekle
          </button>
        </div>
        {blocks.length === 0 ? (
          <p style={{ margin: 0, padding: '8px 14px 16px', fontSize: 13, color: 'var(--ad-fg-muted)' }}>
            Henüz şerit yok.
          </p>
        ) : (
          blocks.map((block, index) => (
            <div key={block.id} style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid var(--ad-line-faint)' }}>
              <button
                type="button"
                className={`html-block-row${block.id === selectedId ? ' is-active' : ''}`}
                style={{ borderBottom: 0 }}
                onClick={() => selectBlock(block.id)}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {block.name || 'Şerit'}
                  </span>
                  <span className="ad-mono" style={{ fontSize: 10, color: 'var(--ad-fg-faint)' }}>
                    {block.enabled ? 'Açık' : 'Kapalı'}
                    {block.html.trim() ? '' : ' · boş'}
                  </span>
                </span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost ad-btn-sm"
                  disabled={index === 0}
                  onClick={() => {
                    flushVisual()
                    setDirty(true)
                    setBlocks((prev) => moveItem(prev, index, -1))
                  }}
                  aria-label="Yukarı taşı"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost ad-btn-sm"
                  disabled={index === blocks.length - 1}
                  onClick={() => {
                    flushVisual()
                    setDirty(true)
                    setBlocks((prev) => moveItem(prev, index, 1))
                  }}
                  aria-label="Aşağı taşı"
                >
                  ↓
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ad-card">
        {selected ? (
          <>
            <label className="ad-label" htmlFor="html-block-name">
              Ad
            </label>
            <input
              id="html-block-name"
              className="ad-input"
              value={selected.name}
              onChange={(e) => patchSelected({ name: e.target.value })}
              style={{ marginBottom: 14 }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selected.enabled}
                onChange={(e) => patchSelected({ enabled: e.target.checked })}
              />
              <span style={{ fontSize: 13 }}>Anasayfada göster</span>
            </label>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                className={`ad-btn ad-btn-sm ${mode === 'visual' ? 'ad-btn-primary' : 'ad-btn-secondary'}`}
                onClick={() => switchMode('visual')}
              >
                Görsel
              </button>
              <button
                type="button"
                className={`ad-btn ad-btn-sm ${mode === 'html' ? 'ad-btn-primary' : 'ad-btn-secondary'}`}
                onClick={() => switchMode('html')}
                lang="en"
              >
                HTML
              </button>
            </div>

            <div className="html-editor-toolbar">
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" disabled={mode === 'html'} onMouseDown={keepEditorFocus} onClick={() => applyCommand('bold')}>
                Kalın
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" disabled={mode === 'html'} onMouseDown={keepEditorFocus} onClick={() => applyCommand('italic')}>
                İtalik
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" disabled={mode === 'html'} onMouseDown={keepEditorFocus} onClick={() => applyCommand('formatBlock', '<h2>')}>
                Başlık
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" disabled={mode === 'html'} onMouseDown={keepEditorFocus} onClick={() => applyCommand('formatBlock', '<p>')}>
                Paragraf
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" disabled={mode === 'html'} onMouseDown={keepEditorFocus} onClick={() => applyCommand('insertUnorderedList')}>
                Liste
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onMouseDown={keepEditorFocus} onClick={addLink}>
                Bağlantı
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onMouseDown={keepEditorFocus} onClick={() => insertHtml('<hr />')}>
                Ayraç
              </button>
              <button type="button" className="ad-btn ad-btn-secondary ad-btn-sm" onMouseDown={keepEditorFocus} onClick={insertStripTemplate}>
                Şerit şablonu
              </button>
            </div>

            {mode === 'visual' ? (
              <div
                ref={visualRef}
                className="html-visual"
                contentEditable
                role="textbox"
                aria-label="Şerit içeriği"
                suppressContentEditableWarning
                onInput={() => patchSelected({ html: readVisualHtml() })}
              />
            ) : (
              <textarea
                ref={htmlRef}
                className="ad-textarea html-code"
                value={selected.html}
                spellCheck={false}
                aria-label="HTML kodu"
                onChange={(e) => patchSelected({ html: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key !== 'Tab' || !htmlRef.current) return
                  e.preventDefault()
                  const el = htmlRef.current
                  const start = el.selectionStart ?? 0
                  const end = el.selectionEnd ?? start
                  const next = selected.html.slice(0, start) + '  ' + selected.html.slice(end)
                  patchSelected({ html: next })
                  requestAnimationFrame(() => {
                    el.selectionStart = start + 2
                    el.selectionEnd = start + 2
                  })
                }}
              />
            )}

            <p className="ad-mono" style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--ad-fg-faint)' }}>
              HTML sekmesinde etiket yapıştırabilirsiniz. script ve javascript: adresleri kaydedilmez.
            </p>

            <p className="ad-label" style={{ marginTop: 18 }}>
              Önizleme
            </p>
            <div className="html-preview">
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p style={{ margin: 0, padding: 16, fontSize: 13, color: '#8a8175' }}>Önizleme boş.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" className="ad-btn ad-btn-primary" onClick={handleSave} disabled={saving || !dirty}>
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button type="button" className="ad-btn ad-btn-danger ad-btn-sm" onClick={removeSelected}>
                Bu şeridi sil
              </button>
              {selectedIndex >= 0 ? (
                <span className="ad-mono" style={{ alignSelf: 'center', fontSize: 10, color: 'var(--ad-fg-faint)' }}>
                  {selectedIndex + 1} / {blocks.length}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--ad-fg-muted)' }}>
              Parfüm seçkisinin altına bir şerit ekleyin. Görsel editör veya HTML kodu kullanabilirsiniz.
            </p>
            <button type="button" className="ad-btn ad-btn-primary" onClick={addBlock}>
              Şerit ekle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
