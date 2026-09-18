// ═══════════════════════════════════════════════════════════════
// Yasal taslak uyarı bandı — Editorial Minimal
// ─ Hairline çerçeveli ince şerit; amber nokta + label-spec metin
// ═══════════════════════════════════════════════════════════════

export default function LegalDraftNotice() {
  return (
    <div className="w-full border-b border-hairline-light bg-surface-container-low">
      <div className="ed-section-inner flex items-center justify-center gap-space-sm py-space-sm text-center">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-honey-amber" />
        <p className="font-label-spec text-label-spec uppercase tracking-[0.12em] text-on-surface-variant">
          Bu metin taslak niteliğindedir; nihai hukuki onay sürecindedir.
        </p>
      </div>
    </div>
  )
}
