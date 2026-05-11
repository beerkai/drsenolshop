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

## 🔮 v0.5.0 — Ödeme entegrasyonu (Iyzico)
- Iyzico hosted page entegrasyonu
- 3D Secure flow
- Callback / webhook handler
- Order status sync

## 🔮 v0.6.0 — Müşteri hesabı (auth)
- Supabase Auth (email + magic link)
- `/hesabim` — adres defteri, sipariş geçmişi
- Sepetin DB tarafında saklanması (kullanıcı oturum açtıysa)

## 🔮 v0.7.0 — İçerik & SEO
- `/hikaye` (markanın hikayesi)
- `/blog` (opsiyonel — MDX)
- Schema.org JSON-LD (Product, Organization, BreadcrumbList)
- Open Graph görselleri

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
