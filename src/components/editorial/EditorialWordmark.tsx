// ═══════════════════════════════════════════════════════════════
// Editorial wordmark — "DR. ŞENOL • 1985"
// Kaynak: Stitch dr._senol_wordmark_logo/code.html
//
// SVG içindeki <text> sayfanın webfont'una erişemediği için (next/image
// ile yüklenen SVG izole render edilir) wordmark gerçek DOM tipografisi
// olarak kurulur — DM Sans her zaman doğru uygulanır, keskin ve
// erişilebilir kalır.
//
// CMS gerçek logo görseli sağladığında EditorialHeader onu kullanır;
// bu component tipografik fallback / varsayılan markadır.
// ═══════════════════════════════════════════════════════════════

interface Props {
  /** Ana marka metni — Stitch: "DR. ŞENOL" */
  text?: string
  /** Kuruluş yılı rozeti; boş verilirse gizlenir */
  year?: string
  className?: string
}

export default function EditorialWordmark({
  text = 'Dr. Şenol',
  year = '1985',
  className,
}: Props) {
  return (
    <span className={`flex items-baseline gap-space-sm ${className ?? ''}`}>
      <span
        lang="tr"
        className="font-nav-caps text-[15px] font-normal uppercase leading-none tracking-[0.18em] text-on-surface lg:text-[17px]"
      >
        {text}
      </span>

      {year ? (
        <span className="hidden items-baseline gap-1.5 sm:flex">
          <span
            aria-hidden
            className="inline-block h-[5px] w-[5px] shrink-0 translate-y-[-3px] rounded-full bg-honey-amber"
          />
          <span className="font-label-spec text-[9px] uppercase leading-none tracking-[0.22em] text-stone-muted">
            {year}
          </span>
        </span>
      ) : null}
    </span>
  )
}
