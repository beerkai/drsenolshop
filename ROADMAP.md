# Dr. Şenol Shop — Roadmap

Versiyonlu yol haritası. Her versiyon kapanınca commit + tag.

---

## ✅ v0.1.0 — Temel iskelet
- Next.js 16 + Supabase + Tailwind v4 kurulum
- Ana sayfa + Header/Footer + Hero
- Tasarım sistemi (`@theme` token'lar)

## ✅ v0.2.0 — Katalog
- Product/Variant/Category modelleri
- `/koleksiyon` (filtreleme + sort + sonsuz scroll)
- `/kategori/[slug]`
- Ürün kartları + öne çıkanlar bölümü
- Görsel migration (ikas CDN → Supabase Storage)
- `sitemap.ts`, `robots.ts`
- `short_desc` doldurma scripti

## ✅ v0.3.0 — Ürün detay + sepet
- `/urun/[slug]` (galeri + sticky info panel + ilgili ürünler)
- Sepet sistemi: `CartContext` (localStorage), `CartDrawer`
- Header'da sepet butonu + live count
- Mobile responsive fixleri

## 🔄 v0.4.0 — Sipariş & Admin & Bildirim (BUNU YAPIYORUZ)

### 4.1 — DB Şema (orders + order_items)
- `supabase/migrations/0001_orders.sql`
- `orders` tablosu: order_number, status, customer + adres, totals, payment_*
- `order_items`: snapshot fields (name, price, tax_rate), quantity, subtotal
- RLS: anon INSERT, SELECT yok (API route service_role ile)
- Trigger: `order_number` otomatik ("DS-2026-NNNN")
- Stok düşürme RPC fonksiyonu (atomic)

### 4.2 — Checkout Sayfası `/odeme`
- Misafir checkout (kayıt opsiyonel)
- Adres formu: ad/soyad, e-mail, telefon, adres, il, ilçe, posta kodu
- Sipariş özeti: items + KDV (per-item `tax_rate`) + kargo (0) + toplam
- Form validation (server-side, manual)
- POST `/api/orders` → order oluştur → ödeme yöntemine göre yönlendir
- Ödeme yöntemi: şimdilik **havale/EFT** (Iyzico bekleyen)

### 4.3 — Sipariş Onay `/siparis/[order_number]`
- Order özet, banka bilgileri (havale ise), durum
- E-posta yok (kullanıcı kararı)

### 4.4 — Admin Panel `/admin`
- Auth: Supabase Auth (email/password), `admin_users` whitelist
- `/admin` dashboard: günlük özet (sipariş sayısı, ciro, son siparişler)
- `/admin/siparisler` — sipariş listesi + detay + status update
- `/admin/urunler` — ürün listesi + edit (stok güncelleme öncelik)
- `/admin/stok` — varyant stok takibi
- Tasarım: Aynı tema (ink/bone/gold), data-dense layout

### 4.5 — Telegram Bot
- Yeni sipariş geldiğinde bildirim (chat'e mesaj)
- Komutlar:
  - `/yeni` — bugünkü siparişler
  - `/durum DS-2026-0001` — sipariş detayı
  - `/stok kestane-bali` — ürün stoğu
  - `/ozet` — günlük ciro + sipariş sayısı
- Implementation: Telegram Bot API, webhook on Vercel
- Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (admin chat)

---

## 🔄 v0.5.0 — Ödeme entegrasyonu (PayTR iframe)
- ✅ `src/lib/paytr.ts` — token üretimi (HMAC-SHA256), callback hash doğrulama, basket builder
- ✅ POST `/api/payments/paytr/init` — order_number → iframe URL
- ✅ POST `/api/payments/paytr/callback` — webhook, hash doğrulama, status sync, Telegram + e-posta
- ✅ `/odeme/paytr/[order_number]` — iframe sayfası
- ✅ Checkout'ta yöntem seçici (PAYTR_MERCHANT_* env'leri varsa görünür)
- ✅ Migration 0009: payment_method enum'a 'paytr'
- ✅ Admin Ayarlar'da PayTR durum kartı + bildirim URL hatırlatması
- 🔄 PayTR başvuru onayı bekleniyor → env doldur → test → canlıya geç

## ✅ v0.6.0 — Müşteri hesabı (auth)
- Supabase Auth (email + password) — `@supabase/ssr` cookie tabanlı
- `/giris`, `/kayit`, `/sifre-unuttum`, `/sifre-yenile`, `/hesabim`
- `/auth/callback` (e-posta linklerinden code exchange)
- E-posta linkleri `/auth/callback?next=...` üzerinden geçer (SSR cookie session kurulur)
- 0008 migration: orders + order_items için authenticated kullanıcının kendi email'iyle eşleşen / user_id eşleşen satırları okuma RLS'i
- `/hesabim`: sipariş geçmişi listesi (RLS sayesinde sadece kendi siparişleri)
- `/odeme` autofill: logged-in kullanıcının son siparişindeki adresi prefill eder
- `/api/orders` server-side `user_id` stamping (client forge edemiyor)
- Header'da hesap iconu (`HeaderAccountLink`) + mobile menüde Hesabım/Çıkış

## 🔮 v0.7.0 — İçerik & SEO
- ✅ Schema.org JSON-LD (Organization + WebSite root layout, Product + BreadcrumbList ürün sayfası)
- ✅ Analytics: Plausible — NEXT_PUBLIC_PLAUSIBLE_DOMAIN env'i set ise yüklenir (çerezsiz, rıza gerekmez)
- ✅ Open Graph görselleri (commit d124627'de)
- ⏳ `/blog` (opsiyonel — MDX)
- ⏳ Lighthouse turu (manuel — staging'de yapılacak)

## 🔮 v0.8.0 — Çok dilli (TR/EN/DE/FR)
- next-intl entegrasyonu
- Ürün isimleri/açıklamaları DB'de çevirili
- URL slug per locale

---

## Notlar

- Her release öncesi: `npx tsc --noEmit` + `npm run build` + manuel test.
- Commit pattern: `feat(v0.X.0): kısa açıklama`.
- `schema.sql` her DB değişikliğinde manuel güncellenir (snapshot).
- Eski plan dosyaları (`plan-for-one-use.md` gibi) artık tutulmaz — değişiklikler buraya yazılır.
