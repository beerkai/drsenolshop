<!-- BEGIN:nextjs-agent-rules -->
# Dr. Şenol Shop — Proje Konvansiyonları

Bu dosya AI ajanları (Claude, Cursor, Windsurf) için projeye özgü kuralları içerir.
Dil: yorumlar Türkçe, kod/identifier'lar İngilizce.

---

## 1. Next.js 16 — Eğitim datanızla aynı DEĞİL

Breaking changes var:
- `params` ve `searchParams` artık **Promise**. Server Component imzası:
  ```ts
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
  }
  ```
- `next/image`'da `fill` kullanıyorsanız `sizes` prop **zorunlu**.
- Turbopack dev/build varsayılan.
- App Router'da `metadata` export'u Server Component'lardan.

Şüpheliyseniz: `node_modules/next/dist/docs/` içindeki kılavuza bakın. Deprecation uyarılarını dikkate alın.

---

## 2. Styling — Vanilla CSS + Inline Styles (Tailwind v4 kurulu ama bilinçli kullanılmıyor)

Bu proje **bileşen düzeyinde inline `style` + global CSS class'larıyla** çalışır. Tailwind utility'leri yalnızca **Header.tsx**'te ve birkaç eski component'te. Yeni kod için pattern:

```tsx
// ✅ Inline style + responsive davranış için CSS class
<div
  className="px-responsive"
  style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#0A0908' }}
>
```

Responsive davranış (hover, media query) inline yapılamaz → `globals.css`'te class tanımlanır:
```css
.px-responsive { padding-left: clamp(1rem, 4vw, 3rem); padding-right: clamp(1rem, 4vw, 3rem); }
@media (max-width: 640px) { .featured-grid { grid-template-columns: repeat(2, 1fr) !important; } }
```

Veya component içinde `<style>{`...`}</style>` bloğuyla scoped CSS.

**Tasarım sistemi (`globals.css` `@theme`):**
- Renkler: `--color-ink` (#0A0908), `--color-bone` (#F4F0E8), `--color-gold` (#C9A961), `--color-cream-muted` (#B8B0A0)…
- Fontlar: `--font-display` (Cormorant Garamond, başlık), `--font-sans` (Inter, gövde), `--font-mono` (JetBrains Mono, etiket/eyebrow)

Yeni renk gerektiğinde önce `globals.css` `@theme` bloğuna ekle.

---

## 3. Türkçe `i`/`I` Casing — `lang="en"` Zorunluluğu

HTML `lang="tr"` + CSS `text-transform: uppercase` İngilizce `i` → `İ` yapar. İngilizce uppercase metin gösteren her element için `lang="en"`:

```tsx
// ❌ "The Honey Scientist" → "THE HONEY SCİENTİST"
<p className="uppercase">The Honey Scientist</p>

// ✅
<p className="uppercase" lang="en">The Honey Scientist</p>

// ✅ Helper fonksiyonla otomatik
function isLikelyEnglish(s: string) { return !/[ğüşıöçĞÜŞİÖÇ]/.test(s) }
<p {...(isLikelyEnglish(name) && { lang: 'en' })}>{name}</p>
```

`.cursor/rules/turkish-english-casing.mdc` dosyasına bak.

---

## 4. Server vs Client Component Sınırı

**Default Server Component.** `'use client'` sadece şu durumlarda:
- `useState`, `useEffect`, `useReducer`, custom hook
- `onClick`, `onChange`, `onMouseEnter` vb. event handler
- Browser API (`localStorage`, `window`, `document`)
- Context Provider/Consumer

**Pattern**: Sayfa Server Component'tir, interactive parça'lar ayrı Client Component dosyalarda. Veri Server Component'te fetch edilir, prop olarak Client Component'a iletilir.

```tsx
// app/urun/[slug]/page.tsx — Server
export default async function Page({ params }) {
  const product = await getProductBySlug(...)
  return <ProductActions product={product} />  // Client component
}

// components/ProductActions.tsx
'use client'
export default function ProductActions({ product }) {
  const [qty, setQty] = useState(1)
  // ...
}
```

**Sınırdan geçen prop'lar serializable olmalı** (plain object, primitive, array). Function/Date/Class instance geçmez.

---

## 5. Supabase — Lazy Init + İki Client

`src/lib/supabase.ts`:
- `getSupabase()` — anon key, browser/server okuma. Lazy: ilk çağrıda init.
- `getSupabaseAdmin()` — service_role key, **sadece sunucu tarafı** (API route, script). RLS bypass eder.

Modül import'unda env zorunlu değil — env yoksa `isSupabaseConfigured()` false döner, `getProducts` boş liste döner. Bu sayede env eksikken build kırılmaz.

```ts
// ✅ Server Component / API route içinde
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

if (!isSupabaseConfigured()) return { products: [], total: 0 }
const { data } = await getSupabase().from('products').select(...)
```

**Service role key'i ASLA `'use client'` dosyada veya `NEXT_PUBLIC_*` env'de açma.**

---

## 6. Tipler — `@/types` Tek Kaynaktan

`src/types/index.ts`:
- `Product`, `ProductVariant`, `Category`, `ProductWithRelations`, `Order`, `OrderItem`, `AdminUser` interface'leri
- Yardımcı fonksiyonlar: `getProductImage`, `getProductStartingPrice`, `getVariantPrice`, `findDefaultVariant`, `formatPrice` …

Yeni bir hesaplama gerektiğinde önce buraya bak. Aynı mantığı tekrar yazma. Numeric NaN/null güvenliği için `toFiniteNumber` pattern'ini takip et.

---

## 7. Para Formatı

```ts
formatPrice(amount) // 'tr-TR' locale, TRY, max 2 ondalık
// → "1.250 TL"
```

Asla `${price.toFixed(2)} TL` yazma — `tr-TR` locale binlik ayırıcı (.) gerektirir.

---

## 8. Görsel Yönetimi

- Storage: **Supabase Storage** `products` bucket (public).
- URL format: `https://<project>.supabase.co/storage/v1/object/public/products/<slug>/<n>.webp`
- `next.config.ts`'te `*.supabase.co` allow'lu.
- `<Image>` her zaman `sizes` ile (örn. `(max-width: 640px) 50vw, 380px`).
- ikas CDN (`cdn.myikas.com`) deprecated, sadece eski script'lerde referans.

---

## 9. Database Migration Konvansiyonu

`supabase/migrations/NNNN_<slug>.sql` dosyaları. Numaralandırma artan (0001, 0002…).
Her migration **idempotent** olmalı: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS`.

`schema.sql` referans/snapshot dosyasıdır — manuel güncellenir, doğru kaynak migration dosyalarıdır.

RLS politikaları zorunlu. Anon role için sadece gereken minimum: products/categories/order_items SELECT, orders INSERT (misafir checkout için). UPDATE/DELETE her zaman service_role.

---

## 10. Genel Kod Hijyeni

- **Yorumlar Türkçe, kod İngilizce.** Dosya başı ASCII separator yaygın (`// ═══════…`).
- Hata mesajları kullanıcıya **Türkçe**.
- `console.error('[fonksiyonAdi] hata:', err.message)` pattern'i — prefix'le debug edilebilsin.
- `npm run build` her commit'te yeşil olmalı. `npx tsc --noEmit` ile lokal kontrol.
- Push öncesi: TypeScript hata YOK, build OK, dev'de manuel test (bilhassa UI değişiklikleri).
- Commit mesajı pattern: `feat(v0.X.0): kısa açıklama` / `fix(mobile): …` / `style: …` / `refactor: …`

---

## 11. Roadmap

Mevcut yol haritası ve hangi versiyonda ne biteceği `ROADMAP.md`'de. Bayat plan dosyaları yerine versiyonlu yol haritası tutuyoruz.
<!-- END:nextjs-agent-rules -->
