import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { listProductsForVitrin, type VitrinSortMode } from '@/lib/admin-data'
import VitrinSortList from '@/components/admin/VitrinSortList'

type SP = Promise<{ mode?: string; q?: string }>

const MODES: { id: VitrinSortMode; label: string; hint: string }[] = [
  {
    id: 'harvest',
    label: 'En Yeni Hasat',
    hint: 'Koleksiyon sayfasında “En Yeni Hasat” seçildiğinde görünen sıra.',
  },
  {
    id: 'featured',
    label: 'Öne Çıkanlar',
    hint: 'Koleksiyon “Öne Çıkanlar” sıralaması (manuel sıra + satış adedi yedek).',
  },
  {
    id: 'catalog',
    label: 'Genel sıra',
    hint: 'display_order — ürünler listesindeki genel katalog sırası.',
  },
]

function parseMode(raw: string | undefined): VitrinSortMode {
  if (raw === 'featured' || raw === 'catalog') return raw
  return 'harvest'
}

export default async function AdminVitrinPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin()
  const sp = await searchParams
  const mode = parseMode(sp.mode)
  const search = sp.q?.trim() || undefined

  const { products, total, sortReady } = await listProductsForVitrin(mode, { search, limit: 500 })

  const active = MODES.find((m) => m.id === mode)!

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="ad-eyebrow" style={{ marginBottom: 12 }}>
          Mağaza vitrini
        </p>
        <h1
          className="ad-display"
          style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}
        >
          Sıralama & vitrin
        </h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ad-fg-muted)', maxWidth: 560 }}>
          Koleksiyon sıralarını buradan yönetin. Anasayfa “En Çok Tercih Edilenler” metinleri ve ürün seçimi için{' '}
          <Link href="/admin/tema" style={{ color: 'var(--ad-accent)' }}>
            Tema editörü → Keşfet Vitrini
          </Link>
          .
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {MODES.map((m) => (
          <Link
            key={m.id}
            href={`/admin/vitrin?mode=${m.id}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
            className={m.id === mode ? 'ad-btn ad-btn-primary ad-btn-sm' : 'ad-btn ad-btn-secondary ad-btn-sm'}
            style={{ textDecoration: 'none' }}
          >
            {m.label}
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--ad-fg-muted)', marginBottom: 16 }}>{active.hint}</p>

      <form method="get" style={{ marginBottom: 20, maxWidth: 420, display: 'flex', gap: 8 }}>
        <input type="hidden" name="mode" value={mode} />
        <input
          type="search"
          name="q"
          defaultValue={search ?? ''}
          placeholder="Ürün ara…"
          className="ad-input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="ad-btn ad-btn-secondary ad-btn-sm">
          Ara
        </button>
      </form>

      <p className="ad-mono" style={{ fontSize: 11, color: 'var(--ad-fg-faint)', marginBottom: 12 }}>
        {total} ürün · listelenen {products.length}
      </p>

      {products.length === 0 ? (
        <div className="ad-empty">
          <p className="ad-empty-title">Ürün yok.</p>
        </div>
      ) : (
        <VitrinSortList products={products} mode={mode} sortReady={sortReady} />
      )}
    </div>
  )
}
