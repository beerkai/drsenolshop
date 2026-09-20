'use client'

// ═══════════════════════════════════════════════════════════════
// Kategori yöneticisi
// ─ Ağaç görünümü (üst kategori → alt kategoriler)
// ─ Satır seçince sağda düzenleme paneli açılır
// ─ Yeni kategori ekleme, sıralama (↑/↓), silme (boşsa)
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminCategory } from '@/lib/admin-data'
import { toast } from '@/components/admin/toast/toast'

type Draft = {
  name: string
  slug: string
  description: string
  parent_id: string
  image_url: string
  meta_title: string
  meta_description: string
  is_active: boolean
  display_order: string
}

function toDraft(c: AdminCategory): Draft {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    parent_id: c.parent_id ?? '',
    image_url: c.image_url ?? '',
    meta_title: c.meta_title ?? '',
    meta_description: c.meta_description ?? '',
    is_active: c.is_active,
    display_order: c.display_order?.toString() ?? '',
  }
}

/** Ad → slug (Türkçe karakterler sadeleştirilir) */
function slugify(s: string): string {
  const map: Record<string, string> = { ğ: 'g', ü: 'u', ş: 's', ı: 'i', ö: 'o', ç: 'c' }
  return s
    .toLowerCase()
    .replace(/[ğüşıöç]/g, (m) => map[m] ?? m)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CategoryManagerClient({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(categories[0]?.id ?? null)
  const [draft, setDraft] = useState<Draft | null>(categories[0] ? toDraft(categories[0]) : null)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [dragCatId, setDragCatId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)

  const selected = categories.find((c) => c.id === selectedId) ?? null

  // Ağaç: köklerin altına çocukları dizer
  const tree = useMemo(() => {
    const roots = categories.filter((c) => !c.parent_id)
    const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id)
    return roots.map((r) => ({ node: r, children: childrenOf(r.id) }))
  }, [categories])

  // Üst kategori seçeneği: yalnızca kökler (iki seviye tutuyoruz)
  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== selectedId)

  function select(c: AdminCategory) {
    setSelectedId(c.id)
    setDraft(toDraft(c))
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function save() {
    if (!selected || !draft) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/categories/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          parent_id: draft.parent_id || null,
          display_order: draft.display_order === '' ? null : Number(draft.display_order),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Kaydedilemedi.')
        return
      }
      toast.success(`${draft.name} güncellendi.`)
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setSaving(false)
    }
  }

  async function create() {
    const name = newName.trim()
    if (name.length < 2) {
      toast.error('Kategori adı en az 2 karakter olmalı.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slugify(name), is_active: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Oluşturulamadı.')
        return
      }
      toast.success(`${name} eklendi.`)
      setNewName('')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setCreating(false)
    }
  }

  async function remove(c: AdminCategory) {
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      toast.error(data.message ?? 'Silinemedi.')
      return
    }
    toast.success(`${c.name} silindi.`)
    if (selectedId === c.id) {
      setSelectedId(null)
      setDraft(null)
    }
    router.refresh()
  }

  async function persistSiblingOrder(parentId: string | null, orderedIds: string[]) {
    setReordering(true)
    try {
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId, order: orderedIds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Sıra kaydedilemedi.')
        return
      }
      toast.success('Kategori sırası güncellendi.')
      router.refresh()
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setReordering(false)
    }
  }

  function dropOnSibling(target: AdminCategory) {
    if (!dragCatId || dragCatId === target.id) return
    const dragged = categories.find((x) => x.id === dragCatId)
    if (!dragged) return
    if ((dragged.parent_id ?? null) !== (target.parent_id ?? null)) {
      toast.error('Yalnızca aynı seviyedeki kategorileri sıralayabilirsiniz.')
      return
    }
    const siblings = categories
      .filter((x) => (x.parent_id ?? null) === (target.parent_id ?? null))
      .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
    const from = siblings.findIndex((x) => x.id === dragCatId)
    const to = siblings.findIndex((x) => x.id === target.id)
    if (from < 0 || to < 0) return
    const next = [...siblings]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    void persistSiblingOrder(target.parent_id ?? null, next.map((x) => x.id))
    setDragCatId(null)
  }

  /** Aynı seviyedeki komşuyla display_order takası */
  async function swap(c: AdminCategory, delta: number) {
    const siblings = categories.filter((x) => (x.parent_id ?? null) === (c.parent_id ?? null))
    const index = siblings.findIndex((x) => x.id === c.id)
    const other = siblings[index + delta]
    if (!other) return

    const a = c.display_order ?? (index + 1) * 10
    const b = other.display_order ?? (index + 1 + delta) * 10

    const results = await Promise.all([
      fetch(`/api/admin/categories/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: b }),
      }),
      fetch(`/api/admin/categories/${other.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: a }),
      }),
    ])

    if (results.some((r) => !r.ok)) {
      toast.error('Sıra değiştirilemedi.')
      return
    }
    router.refresh()
  }

  function Row({ c, depth }: { c: AdminCategory; depth: number }) {
    const active = c.id === selectedId
    return (
      <div
        className={active ? 'ad-cat-row is-active' : 'ad-cat-row'}
        style={{ paddingLeft: 12 + depth * 18, opacity: reordering ? 0.7 : 1 }}
        draggable
        onDragStart={() => setDragCatId(c.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropOnSibling(c)}
        onDragEnd={() => setDragCatId(null)}
      >
        <button type="button" className="ad-cat-name" onClick={() => select(c)}>
          <span>{c.name}</span>
          <span className="ad-cat-meta">
            /{c.slug} · {c.product_count} ürün
            {c.is_active ? '' : ' · pasif'}
          </span>
        </button>
        <div className="ad-image-tools" style={{ marginTop: 0, width: 108, flex: '0 0 auto' }}>
          <button type="button" onClick={() => swap(c, -1)} title="Yukarı">
            ↑
          </button>
          <button type="button" onClick={() => swap(c, 1)} title="Aşağı">
            ↓
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={() => remove(c)}
            disabled={c.product_count > 0}
            title={c.product_count > 0 ? 'Önce ürünleri taşıyın' : 'Sil'}
          >
            Sil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
          Katalog
        </p>
        <p style={{ fontSize: 13, color: 'var(--ad-fg-muted)', marginBottom: 8 }}>
          Alt kategori eklemek için düzenleme panelinden üst kategori seçin. Aynı seviyedeki satırları sürükleyerek
          sıralayın.
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Kategoriler{' '}
          <span
            style={{
              color: 'var(--ad-fg-faint)',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.55em',
              letterSpacing: '0.1em',
              marginLeft: 6,
            }}
          >
            {categories.length}
          </span>
        </h1>
      </div>

      <div className="theme-editor-grid">
        {/* Ağaç */}
        <div className="ad-card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="ad-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Yeni kategori adı…"
            />
            <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={create} disabled={creating}>
              {creating ? '…' : 'Ekle'}
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="ad-empty">
              <p className="ad-empty-title">Kategori yok.</p>
              <p className="ad-empty-hint">Yukarıdan ilk kategoriyi ekleyin.</p>
            </div>
          ) : (
            <div>
              {tree.map(({ node, children }) => (
                <div key={node.id}>
                  <Row c={node} depth={0} />
                  {children.map((child) => (
                    <Row key={child.id} c={child} depth={1} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Düzenleme paneli */}
        <div className="ad-card" style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
          {!selected || !draft ? (
            <div className="ad-empty">
              <p className="ad-empty-title">Kategori seçin.</p>
              <p className="ad-empty-hint">Soldaki listeden düzenlemek istediğinizi seçin.</p>
            </div>
          ) : (
            <>
              <p className="ad-eyebrow" style={{ marginBottom: 16 }}>
                {selected.name}
              </p>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Ad</span>
                <input className="ad-input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Slug</span>
                <input className="ad-input" value={draft.slug} onChange={(e) => set('slug', e.target.value)} />
                <span
                  className="ad-mono"
                  style={{ display: 'block', marginTop: 4, fontSize: 10, color: 'var(--ad-fg-faint)' }}
                >
                  /kategori/{draft.slug || '…'} — değiştirirseniz eski bağlantılar kırılır.
                </span>
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Üst Kategori</span>
                <select
                  className="ad-select"
                  value={draft.parent_id}
                  onChange={(e) => set('parent_id', e.target.value)}
                >
                  <option value="">— Ana kategori —</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Açıklama</span>
                <textarea
                  className="ad-textarea"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Görsel URL</span>
                <input
                  className="ad-input"
                  value={draft.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Sıra</span>
                <input
                  className="ad-input"
                  type="number"
                  value={draft.display_order}
                  onChange={(e) => set('display_order', e.target.value)}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--ad-fg)' }}>Aktif (sitede görünür)</span>
              </label>

              <div className="ad-divider" style={{ margin: '4px 0 16px' }} />

              <label style={{ display: 'block', marginBottom: 12 }}>
                <span className="ad-label">Meta Başlık</span>
                <input
                  className="ad-input"
                  value={draft.meta_title}
                  onChange={(e) => set('meta_title', e.target.value)}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 16 }}>
                <span className="ad-label">Meta Açıklama</span>
                <textarea
                  className="ad-textarea"
                  rows={2}
                  value={draft.meta_description}
                  onChange={(e) => set('meta_description', e.target.value)}
                />
              </label>

              <button
                type="button"
                className="ad-btn ad-btn-primary"
                style={{ width: '100%', minHeight: 44 }}
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
