// Sunucu formu — useSearchParams Suspense sorununu önler (mobil PWA)

export default function OrdersSearchForm({
  initial,
  status,
}: {
  initial: string
  status?: string
}) {
  return (
    <form method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', maxWidth: '520px' }}>
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={initial}
        placeholder="Sipariş no, email, telefon veya isim ile ara…"
        className="ad-input"
        style={{ flex: '1 1 200px', fontSize: '13px' }}
        aria-label="Sipariş ara"
      />
      <button type="submit" className="ad-btn ad-btn-primary" style={{ fontSize: '11px' }}>
        Ara
      </button>
    </form>
  )
}
