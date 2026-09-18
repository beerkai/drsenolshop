// ═══════════════════════════════════════════════════════════════
// Kategori başlığı — Editorial Minimal (Stitch koleksiyon)
// ─ Amber kare + eyebrow, headline-lg başlık, body-md açıklama
// ─ Sağda ürün sayısı / canlı stok notu
//
// Referans: dr._enol_koleksiyon_hasatlar/code.html "Editorial Category Header"
// ═══════════════════════════════════════════════════════════════

interface CategoryHeroProps {
  title: string
  titleAccent?: string
  /** ASCII-only Türkçe kelimeler için açıkça verin */
  titleAccentLang?: 'tr' | 'en'
  titleLang?: 'tr' | 'en'
  description?: string
  totalProducts: number
  eyebrow?: string
  /** Sağdaki canlı durum notu (Stitch: "Canlı Stok: 12 Seri Açık") */
  statusNote?: string
}

export default function CategoryHero({
  title,
  titleAccent,
  titleAccentLang,
  titleLang,
  description,
  totalProducts,
  eyebrow = 'Saitabat Köyü • Rakım 1120m • 2025 Mahsulü',
  statusNote,
}: CategoryHeroProps) {
  return (
    <section className="w-full bg-surface">
      <div className="ed-section-inner pb-space-lg pt-space-lg">
        <div className="flex flex-col justify-between gap-space-lg pb-space-lg md:flex-row md:items-end">
          <div className="ed-min-w-0 flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 bg-honey-amber" />
              <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.2em] text-on-surface-variant">
                {eyebrow}
              </p>
            </div>

            <h1
              lang={titleLang}
              className="font-headline-lg text-headline-lg font-light tracking-[-0.02em] text-on-surface"
            >
              {title}
              {titleAccent ? (
                <>
                  {' '}
                  {/* Derin altın — honey-amber açık zeminde kontrast bırakmıyor */}
                  <span lang={titleAccentLang} className="text-secondary">
                    {titleAccent}
                  </span>
                </>
              ) : null}
            </h1>

            {description ? (
              <p className="max-w-2xl font-body-md text-body-md font-light text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-space-md self-start md:self-end">
            <span className="font-label-spec text-label-spec uppercase text-on-surface-variant">
              {totalProducts} Ürün
            </span>
            {statusNote ? (
              <span className="hidden items-center gap-2 font-label-spec text-label-spec text-on-surface-variant md:inline-flex">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey-amber" />
                {statusNote}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
