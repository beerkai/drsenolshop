# Editorial Minimal — Project Brief

> Stitch export klasörü: `design/stitch-export/`
>
> Google Stitch `.zip` arşivini bu dizine açın ve tasarım brief / notları bu dosyada birleştirin.

## Durum

- Branch: `redesign/editorial-minimal`
- Eski vitrin UI bileşenleri: `src/components/_deprecated/` (silinmedi, karantina)

## Tipografi (Stitch — başka font kullanma)

Kaynak: `stitch_dr._enol_editorial_e_commerce/saitabat_minimal_luxury/DESIGN.md` ve export `code.html` tailwind `fontFamily` bloğu.

| Rol | Font | Token örnekleri |
|-----|------|-----------------|
| Display & başlıklar | **DM Sans** | `font-display-hero`, `font-headline-lg/md/sm`, `font-nav-caps` |
| Gövde & caption | **Inter** | `font-body-lg/md/sm`, `font-editorial-caption` |
| Fiyat & lab etiketleri | **JetBrains Mono** | `font-price-tag`, `font-label-spec` |

- Editorial Minimal anasayfada **Cormorant / serif yok** (eski vitrin `--font-display` legacy sayfalar içindir).
- Wordmark SVG Stitch’te `Plus Jakarta Sans` fallback; sitede **logo görseli** kullanılır.

## Spacing & layout (Stitch)

- Section yatay: `ed-section-inner` (1rem → 1024px+ 3rem), dikey: `ed-section-y` / `ed-section-y-sm`.
- Section başlık satırı: `ed-section-head` (`mb-space-lg`, `pb-space-sm`, alt hairline).
- Metin yığını: `ed-stack` / `ed-stack-lg`; paragraflar: `ed-prose`.
- Feed grid gutter: `gap-gutter` (0.75rem). Kart gövdesi: `ed-card-body`, taşma: `min-w-0` + `ed-caption-truncate`.
- Detay: `.cursor/rules/editorial-layout.mdc`

## Brief (Stitch’ten yapıştır)

cd /Users/beerkai/Desktop/drsenol-reunion
git checkout main && git pull
git checkout -b redesign/editorial-minimal

mkdir -p design/stitch-export src/components/_deprecated
# Stitch .zip'i design/stitch-export/ içine aç, Project Brief'i
# design/stitch-export/BRIEF.md olarak kaydet

# UI component'lerini silme, karantinaya taşı (rollback güvenliği +
# Claude Code'a "bunları yok say" sinyali)
git mv src/components/Hero.tsx src/components/_deprecated/
git mv src/components/ProductCard.tsx src/components/_deprecated/
git mv src/components/CategoryGrid.tsx src/components/_deprecated/
# UI ile ilgili diğer tüm component'ler için tekrarla
