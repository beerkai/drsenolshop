// ═══════════════════════════════════════════════════════════════
// Anasayfa Hero — admin/CMS prop sözleşmesi (Editorial Minimal)
// ═══════════════════════════════════════════════════════════════

export interface HeroImage {
  src: string
  alt: string
}

export interface HeroCta {
  label: string
  href: string
}

/** Masaüstü sağ-alt köşe (Stitch GPS / rakım satırları) */
export interface HeroProvenance {
  gpsLine?: string
  elevationLine?: string
}

/** Mobil anasayfa varyantı — verilmezse üst alanlar desktop ile aynı metni kullanır */
export interface HeroMobileOverrides {
  badge?: string
  kicker?: string
  subtitle?: string
  cta?: HeroCta
}

export interface HeroProps {
  image: HeroImage
  /** Mobil art direction — yoksa `image` kullanılır */
  imageMobile?: HeroImage
  eyebrow: string
  title: string
  subtitle: string
  cta: HeroCta
  /** Masaüstü CTA yanı meta (ör. hasat kodu) */
  metaLabel?: string
  provenance?: HeroProvenance
  mobile?: HeroMobileOverrides
  className?: string
  /** Sabit header altına taşma (Stitch: -mt-28, lg+) */
  underlapHeader?: boolean
}
