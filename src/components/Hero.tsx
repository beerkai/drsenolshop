// ═══════════════════════════════════════════════════════════════
// Hero — Editorial Minimal anasayfa (Stitch referans)
// design/stitch-export/.../dr._enol_editorial_minimal_anasayfa/code.html
// design/stitch-export/.../dr._enol_mobil_editoryal_anasayfa/code.html
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getEditorialImageUrl } from '@/lib/images'
import type { HeroProps } from '@/types/hero'

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

function ArrowForwardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
    </svg>
  )
}

export type { HeroProps, HeroImage, HeroCta, HeroProvenance, HeroMobileOverrides } from '@/types/hero'

export default function Hero({
  image,
  imageMobile,
  eyebrow,
  title,
  subtitle,
  cta,
  metaLabel,
  provenance,
  mobile,
  className,
  underlapHeader = true,
}: HeroProps) {
  const mobileKicker = mobile?.kicker ?? eyebrow
  const mobileSubtitle = mobile?.subtitle ?? subtitle
  const mobileCta = mobile?.cta ?? cta
  const showProvenance =
    Boolean(provenance?.gpsLine?.trim()) || Boolean(provenance?.elevationLine?.trim())
  const mobileImage = imageMobile ?? image
  const desktopSrc = getEditorialImageUrl(image.src)
  const mobileSrc = getEditorialImageUrl(mobileImage.src)

  return (
    <section
      className={cx(
        'relative w-full bg-charcoal-pure',
        'h-[724px] max-h-[720px] overflow-hidden',
        underlapHeader && '-mt-28',
        'ed-hero-section',
        'lg:h-auto lg:max-h-none lg:overflow-visible',
        className,
      )}
      aria-label={title}
    >
      {/* Arka plan görseli */}
      <div className="absolute inset-0 z-0 overflow-hidden lg:opacity-80 lg:mix-blend-luminosity">
        <Image
          src={mobileSrc}
          alt={mobileImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] lg:hidden"
        />
        <Image
          src={desktopSrc}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-center lg:block"
        />
      </div>

      {/* Gradyan — mobil / masaüstü Stitch opaklıkları */}
      <div
        className={cx(
          'pointer-events-none absolute inset-0 z-10',
          'bg-gradient-to-t from-charcoal-pure/90 via-charcoal-pure/30 to-transparent',
          'lg:from-charcoal-pure/95 lg:via-charcoal-pure/40',
        )}
      />

      {/* Mobil: provenance rozeti */}
      {mobile?.badge ? (
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 bg-surface/90 px-2.5 py-1 backdrop-blur-md lg:hidden">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-honey-amber" />
          <span className="font-label-spec text-label-spec uppercase tracking-[0.16em] text-on-surface">
            {mobile.badge}
          </span>
        </div>
      ) : null}

      {/* Mobil: alt içerik bloğu */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-start gap-5 p-margin pb-8 lg:hidden">
        <div className="ed-stack ed-min-w-0 max-w-[320px]">
          <p className="font-editorial-caption text-editorial-caption uppercase tracking-[0.2em] text-secondary-fixed">
            {mobileKicker}
          </p>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-light text-surface">
            {title}
          </h1>
        </div>
        <p className="max-w-[300px] font-body-sm text-body-sm leading-relaxed text-surface-container-highest">
          {mobileSubtitle}
        </p>
        <Link
          href={mobileCta.href}
          className={cx(
            'inline-flex h-12 items-center gap-2.5 px-6',
            'bg-surface font-nav-caps text-nav-caps uppercase tracking-[0.14em] text-charcoal-pure',
            'transition-all duration-300 hover:bg-canvas-cream active:scale-95',
          )}
        >
          <span>{mobileCta.label}</span>
          <ArrowForwardIcon className="text-honey-amber" />
        </Link>
      </div>

      {/* Masaüstü: ana içerik (Stitch: space-y-space-md, alt hizalı blok) */}
      <div className="ed-hero-content relative z-20 hidden lg:block">
        <div className="ed-section-inner pb-space-xl text-surface-container-lowest">
          <div className="max-w-3xl ed-stack-md ed-min-w-0">
            <div className="flex items-center gap-space-sm text-honey-amber">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-honey-amber" />
              <span className="font-nav-caps text-nav-caps uppercase tracking-[0.2em] text-honey-amber">
                {eyebrow}
              </span>
            </div>

            <h1 className="max-w-2xl font-display-hero text-display-hero font-light text-surface-container-lowest">
              {title}
            </h1>

            <p className="max-w-xl font-body-lg text-body-lg font-light text-surface-dim">
              {subtitle}
            </p>

            <div className="flex flex-col items-start gap-space-lg pt-space-md sm:flex-row sm:items-center">
              <Link
                href={cta.href}
                className={cx(
                  'group inline-flex items-center gap-space-sm',
                  'font-nav-caps text-nav-caps uppercase tracking-[0.16em]',
                  'text-surface-container-lowest transition-colors duration-300 hover:text-honey-amber',
                )}
              >
                <span>{cta.label}</span>
                <ArrowForwardIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {metaLabel ? (
                <>
                  <span className="hidden text-editorial-caption text-hairline-subtle sm:inline">•</span>
                  <span className="font-label-spec text-label-spec uppercase text-hairline-subtle">
                    {metaLabel}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Masaüstü: GPS / rakım */}
      {showProvenance ? (
        <div
          className={cx(
            'absolute bottom-space-lg z-20 hidden flex-col items-end gap-1 text-surface-dim lg:flex',
            'right-margin',
          )}
        >
          {provenance?.gpsLine ? (
            <span className="font-label-spec text-[10px] uppercase tracking-widest text-honey-amber">
              {provenance.gpsLine}
            </span>
          ) : null}
          {provenance?.elevationLine ? (
            <span className="font-label-spec text-[10px] uppercase tracking-widest text-surface-dim">
              {provenance.elevationLine}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
