# Admin Panel v2 — Tasarım & Mühendislik Planı

> **Hedef**: Vercel, Linear, Stripe, Plausible kalibresinde bir admin paneli.
> Aydınlık, yoğun, tipografik, terminal-vari ama prima.
> Hızlı, klavyeyle gezilebilir, real-time veri akışıyla yaşayan.

---

## 0. Vizyon — Bu Panel Hangi Hisse Karşılık Geliyor?

İlham örnekleri (her birinin "ne için") :
- **Linear** — light theme yoğunluğu, klavye-öncelikli UX, micro-animation hijyeni
- **Vercel Dashboard** — monospace sayılar, durum çubukları, deployment timeline
- **Plausible Analytics** — gerçek zamanlı "şu an X kişi" canlılığı
- **Stripe Dashboard** — yoğun veri tablolarının okunaklılığı, sparkline + sayı kombinasyonları
- **Resend** — açık tema + altın aksanlar + kart hiyerarşisi
- **Cloudflare** — pro panel hissi, status pulse'lar
- **Railway** — terminal/komut hissi olan butonlar

**Net hedef:** Bir önceki "koyu, fonksiyonel ama kuru" panel yerine —
**görsel olarak nefes alan, tipografik olarak aristokratik, etkileşim olarak hassas** bir araç.

---

## 1. Tasarım Sistemi (Light Tech)

### 1.1 Renk Paleti

```
─── Zemin ────────────────────────────────
--ad-bg:           #FAFAF7   /* Sıcak beyaz — sayfa zemini */
--ad-surface:      #FFFFFF   /* Kart, panel */
--ad-surface-2:    #F4F0E8   /* Altı çizili / vurgu yüzeyler */
--ad-surface-3:    #EBE5D8   /* Hover state */

─── Çizgi ────────────────────────────────
--ad-line-faint:   #EDE9DE   /* En soluk ayırıcı */
--ad-line:         #D4CFC0   /* Standart border */
--ad-line-strong:  #9B9285   /* Vurgulu border */

─── Metin ────────────────────────────────
--ad-fg:           #1A1714   /* Ana metin */
--ad-fg-muted:     #6B6258   /* İkincil */
--ad-fg-faint:     #9B9285   /* Yardımcı */

─── Aksan (mevcut marka) ─────────────────
--ad-gold:         #C9A961
--ad-gold-deep:    #9C7C3C
--ad-gold-faint:   rgba(201,169,97,0.08)
--ad-gold-line:    rgba(201,169,97,0.25)

─── Semantik ─────────────────────────────
--ad-success:      #4F7A2A   /* Yeşil */
--ad-warning:      #B8722E   /* Amber */
--ad-danger:       #B83A24   /* Kırmızı */
--ad-info:         #2E5C7A   /* Mavi */

─── Canlı bağlantı (pulse) ──────────────
--ad-live:         #DC2626   /* Pür kırmızı, pulsing nokta için */
--ad-live-glow:    rgba(220,38,38,0.35)
```

### 1.2 Tipografi

```
Display     Cormorant Garamond  500    metric başlıkları, sayfa h1
UI          Inter               400/500  gövde, metin
Mono        JetBrains Mono      400/500  sayılar, etiketler, status, kod
```

**Tabular numbers** her sayıda zorunlu (`font-variant-numeric: tabular-nums`).
Para birimleri `tr-TR` locale + JetBrains Mono.

### 1.3 Spacing & Grid

- 4px taban (4, 8, 12, 16, 24, 32, 48, 64).
- Kart padding: 24px varsayılan.
- Section spacing: 32px dikey.
- Border-radius: **0** (sharp corners — tech estetiği).
- Border-radius istisnaları: avatar (50%), pulse dot (50%).

### 1.4 Animasyon

- Mikro: 120ms `cubic-bezier(0.16, 1, 0.3, 1)` (hover, focus)
- Orta: 240ms (modal open, drawer slide)
- Pulse (canlı dot): 2s `ease-in-out infinite alternate`
- Sayım animasyonu (count-up): yeni sipariş geldiğinde 0.6s ile artar.

---

## 2. Bileşen Kütüphanesi (`src/components/admin/ui/`)

### 2.1 Atomlar

| Bileşen | Açıklama |
|---|---|
| `<Button variant="primary"\|"secondary"\|"ghost"\|"danger" size="sm"\|"md">` | Sharp corner, mono uppercase label, opsiyonel `kbd` shortcut hint, `iconLeft`/`iconRight` |
| `<IconButton>` | 32×32 kare, ikon-only, tooltip ile etiket |
| `<Input>` | Yumuşak alt çizgi → focus'ta altın çizgi (Linear pattern) |
| `<Select>` | Native select stilize, ok altın |
| `<Textarea>` | Aynı dil |
| `<Badge variant="status">` | `[ ACTIVE ]` bracket'lı mono, semantik renkler |
| `<Kbd>⌘K</Kbd>` | Klavye tuşu rozet |
| `<LiveDot>` | Pulse animasyonlu kırmızı nokta + "CANLI" yazısı |
| `<Sparkline data={[…]}>` | İnce SVG çizgi (Recharts/manuel) |
| `<TrendChip value="+12.4%">` | Yukarı/aşağı ok + yüzde + renk |
| `<EmptyState icon title hint>` | Boş durumlar için |
| `<Skeleton>` | Yükleme placeholder |

### 2.2 Moleküller

| Bileşen | Açıklama |
|---|---|
| `<MetricCard label value delta trend>` | Büyük sayı + altında sparkline + delta yüzdesi |
| `<DataTable columns rows>` | Sortable header, dense rows, hover row, click→detay |
| `<FilterBar>` | Pill-style filtre çipleri (URL'e yazılır) |
| `<StatusPill>` | Bracket'lı renk-kodlu status (sipariş durumları için) |
| `<Pagination>` | Sayı + ‹ › ile sayfa atlama |
| `<SearchInput>` | İçinde ⌘K hint'li global search |
| `<CommandPalette>` | ⌘K ile açılan global nav/search modal |
| `<Toast>` | Sağ alttan slide-in bildirim |
| `<Drawer>` | Sağdan açılır panel (filtre detayları için) |
| `<ConfirmDialog>` | Yıkıcı eylemler için onay (sipariş iptal vb.) |

### 2.3 Organizmalar

| Bileşen | Açıklama |
|---|---|
| `<AdminTopBar>` | Logo + breadcrumb + tarih/saat + canlı dot + global search + user menu |
| `<AdminSidebar>` | Sol nav (collapsable, ikonlar + label) |
| `<RecentActivityFeed>` | Real-time olay akışı (yeni sipariş, stok düşüş vb.) |
| `<OrderTimeline>` | Sipariş status değişim geçmişi |

---

## 3. Layout & Navigasyon

### 3.1 Genel Iskelet

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP BAR · 56px                                                       │
│  [DRŞ▸Admin▸Pano]                          [⌘K Search] [● CANLI] [📅]│
├──────┬───────────────────────────────────────────────────────────────┤
│      │                                                                │
│ SIDE │  CONTENT — max-w 1440, padding clamp(1rem,4vw,3rem)            │
│ NAV  │                                                                │
│ 220px│                                                                │
│      │                                                                │
│      │                                                                │
└──────┴───────────────────────────────────────────────────────────────┘
```

### 3.2 Top Bar — Detay

**Sol:** Breadcrumb (her segment tıklanabilir).
`DRŞ ▸ Admin ▸ Siparişler ▸ DS-2026-0001`

**Orta:** Global komut paleti tetik kutusu.
`[ 🔍 Sipariş, ürün ara…  ⌘K ]`  (Cmd+K basınca modal açılır.)

**Sağ:**
1. **Canlı bağlantı göstergesi**: Supabase Realtime kanalı bağlıyken yeşil + "CANLI", DB değişiklikleri akarken **kırmızı nokta pulse** + "REALTIME". Bağlantı koparsa gri + "ÇEVRİMDIŞI".
2. **Tarih/saat**: `Salı · 12 May · 14:32:47` — saniye saniye güncellenen mono yazı.
3. **Avatar + dropdown**: kullanıcı bilgisi, rol, çıkış.

### 3.3 Sidebar

Daraltılabilir (66px daraltılmış, 220px açık). LocalStorage'da hatırlanır.

```
●  Pano                ⌘1
─  Siparişler          ⌘2
─  Ürünler             ⌘3
─  Müşteriler          ⌘4
─  Analitik            ⌘5
─  Stok                ⌘6
─  Günlük              ⌘7   ← serbest günlük not + manuel data tutma
─────
─  Ayarlar             ⌘,
─  Komutlar            ⌘K
```

### `/admin/gunluk` (Günlük) — yeni tab
Patronun her gün **manuel olarak doldurduğu** mini günlük + serbest data alanı.
- Tarih başlığı (bugün otomatik)
- Serbest metin alanı (kısa notlar, anekdot)
- Birkaç sayı alanı (örn. "kovan sağlık skoru", "günün satış hedefi" gibi customizable metrikler)
- Bugünün otomatik sistem özeti (sipariş/ciro) yan tarafta sabit gösterilir.
- v1: sadece UI iskeleti + placeholder.
- v2: `daily_logs` tablosu eklenir, içerik özelleştirilir (sonraki iterasyon).

Aktif öğenin solunda 2px altın çizgi.
Her satırın sağında küçük rozet (örn. Siparişler yanında bekleyen sayısı).

---

## 4. Sayfa Sayfa Plan

### 4.1 `/admin` — Pano

**Hero satırı (üst):**
> *"İyi günler Berkay."*
>
> `Bugün 14 sipariş · 18.420 TL ciro · 3 bekleyen`
>
> Hemen sağda **canlı sipariş feed**'i — son gelen sipariş kartı pulse ile öne çıkar.

**Üst metrik grid (4 kart):**

| BUGÜN | DÜN | 7 GÜN | 30 GÜN |
|---|---|---|---|
| Sipariş 14 · ciro 18.4k · sparkline | 11 · 14.2k | 87 · 112k · trend ↑12.3% | 312 · 428k · trend ↑8.7% |

Her kart **sparkline + delta yüzdesi** içerir.

**Alt yarı — 2 sütun:**

| Sol (60%) | Sağ (40%) |
|---|---|
| Saat saat sipariş grafiği (bugün, mini bar chart) | Canlı aktivite akışı (real-time event feed) |
| Son 8 sipariş tablosu (yoğun) | Düşük stok uyarıları (kırmızı pulse) |
| Top 5 satılan ürün (mini liste) | Sistem durumu: DB, storage, telegram |

### 4.2 `/admin/siparisler` — Sipariş Listesi

**Üst:**
- Başlık + toplam sayı
- Filter bar: durum çipleri (Tümü/Bekliyor/Ödendi/Hazırlanıyor/Kargoda/Teslim/İptal), tarih aralığı, ödeme yöntemi, arama
- Sağda: "Toplu işlem" toggle + "CSV indir" butonu

**Tablo (yoğun):**

| ☐ | Sipariş No | Müşteri | Ürün | Tutar | Ödeme | Durum | Tarih | • |
|---|---|---|---|---|---|---|---|---|
| ☐ | `DS-2026-0014` | Ahmet Yılmaz / ahmet@... | 3 ürün | 1.250 TL | Havale ✓ | `[ ÖDENDİ ]` | 2 sa | ⋯ |

Toplu işlem: seç → "Durumu Güncelle" / "PDF olarak indir".
Satıra hover → satırın sağında küçük ⋮ menü (Detay, Yeni sekmede aç, Kopyala).

**URL state**: filtreler URL'de — paylaşılabilir bağlantı.

### 4.3 `/admin/siparisler/[order_number]` — Sipariş Detay

3 sütun layout (lg ekran), mobil tek sütun:

| Sol (40%) | Orta (40%) | Sağ (20%) |
|---|---|---|
| Müşteri kartı (ad/mail/tel + kopyala butonları) | Ürünler tablosu | Aksiyonlar paneli (sticky) |
| Teslimat adresi (Google Maps link) | Fiyat dökümü (subtotal, KDV, kargo, toplam) | Status dropdown |
| Notlar | Ödeme bilgisi (havale ise IBAN, ref) | Kargo no input |
| **Timeline**: olay geçmişi (sipariş alındı 14:32 → ödendi 15:01 → …) | | Hızlı eylemler: "Müşteriye e-posta", "Kargo etiketi" |

**Timeline** Linear/GitHub tarzı dikey timeline:
```
● 14:32  Sipariş oluşturuldu     [müşteri: Ahmet]
│
● 15:01  Ödeme alındı            [havale ref: TR12...]
│
○ —       Kargoya verilmedi
```

Yeni event eklenince animasyonla aşağı kayar.

### 4.4 `/admin/urunler` — Ürün Listesi

**Üst toolbar:**
- Arama (isim/SKU/slug)
- Filtre: kategori, aktif/pasif, öne çıkan, stok durumu (var/az/yok)
- Sağda: "Yeni Ürün" butonu (v0.5'te aktif olacak)

**Tablo:**
| Görsel | İsim | Kategori | Fiyat | KDV | Stok | Durum | • |
|---|---|---|---|---|---|---|---|
| 🖼️ | Kestane Balı | Bal | 320 TL | %1 | 18 | `[ AKTİF · ★ ]` | ⋯ |

Stok hücresinde inline editing: hover → kalem ikonu, tıkla → input, Enter → kaydet. (Toast: "Stok güncellendi")

### 4.5 `/admin/urunler/[id]` — Ürün Detay/Edit

Tab-style sayfa:
- **Genel**: aktif, featured, kategori, etiketler
- **Fiyat & KDV**: base_price, compare_price, tax_rate
- **Stok & Varyantlar**: varyant tablosu (inline edit, ekle/kaldır)
- **İçerik**: name, short_desc, long_desc (markdown editor), tags
- **Görseller**: drag-drop sıralama, yeni yükleme (Supabase Storage)
- **SEO**: meta_title, meta_description, slug
- **Geçmiş**: son değişiklik kayıtları (v0.5)

Üst sağda: "Önizle" (siteyi yeni sekme aç) + "Kaydet" (sticky).

### 4.6 `/admin/musteriler` — Müşteriler (Yeni)

Sipariş veren email'lerden türetilir (auth user şart değil). Her müşteri:
- E-mail (key)
- Toplam sipariş sayısı
- Toplam ciro
- İlk/son sipariş tarihi
- Adresler (geçmiş siparişlerdeki adresler — dedupe edilir)

**Detay sayfası**: müşterinin tüm siparişleri listesi.

### 4.7 `/admin/analitik` — Analitik

- **Ciro grafiği** (günlük bar chart, 30/90/365 gün toggle)
- **Sipariş hacmi** (line chart)
- **Top ürünler** (revenue ve adet bazlı, son 30 gün)
- **Kategori dağılımı** (donut/bar)
- **Saat heatmap**: hangi saatlerde sipariş geliyor (7x24 grid, koyu hücreler yoğun)
- **Dönüşüm** (placeholder — ileride GA/Plausible bağlantısı)

Veri kaynağı: orders + order_items SQL aggregations (API endpoint'leri).

### 4.8 `/admin/stok` — Stok Takibi

Düşük stoktaki tüm varyantların tek listesi. Toplu güncelleme:
- Sayfanın üstünde her satır için input
- Altta "Hepsini Kaydet" butonu (tek API çağrısında batch update)
- Filtre: kritik (≤2), düşük (≤5), tükendi (=0)

### 4.9 `/admin/ayarlar` — Ayarlar

- **Genel**: site title, kargo eşiği, KDV varsayılan
- **Banka Bilgileri**: havale için IBAN/banka (siparis onay sayfasında gösterilen)
- **Telegram**: bot durumu (canlı kontrol), test mesajı gönder
- **Adminler**: admin_users listesi + yeni admin ekle/çıkar (sadece owner)
- **Webhook**: payment webhook URL'leri (v0.5)

---

## 5. Etkileşim Özellikleri

### 5.1 ⌘K Komut Paleti

Modal — fuzzy search üzerinde:
- **Sayfalar**: "go to" gibi (Sipariş listesi, Ürünler, …)
- **Eylemler**: "Yeni sipariş durumu güncelle", "CSV indir"
- **Aramalar**: "Müşteri: ahmet" → sonuç listesi inline

Klavye: ↑/↓ navigasyon, Enter, Esc kapat. Tüm shortcut'lar `?` ile listelenir.

### 5.2 Klavye Kısayolları

```
⌘K   Komut paleti
⌘1-6 Sidebar item'ları
g s  Go to Siparişler  (vim-style chord)
g u  Go to Ürünler
n    Yeni (bağlam-bağımlı)
e    Edit (detay sayfasında)
/    Search focus
?    Shortcut listesi
```

### 5.3 Real-time (Supabase Realtime)

- **Yeni sipariş geldiğinde**: top bar'da kırmızı nokta pulse + toast bildirimi + ses (opsiyonel toggle) + count-up animasyonu.
- **Düşük stok alarmı**: pano widget'ı anlık güncellenir.
- **Aktivite akışı**: olaylar geldikçe üstten ekleniyor.

Bağlantı durumu sürekli izlenir → top bar'daki dot:
- Yeşil: bağlı + son 30s'de event akışı yok ("BAĞLI")
- Kırmızı pulse: aktif event akışı veya yeni sipariş ("CANLI")
- Gri: bağlantı koptu ("ÇEVRİMDIŞI")

### 5.4 Tarih/Saat

Top bar sağında saniye saniye güncellenir:
```
Salı · 12 May · 14:32:47
```
Format: Türkçe locale, `tabular-nums`. Pazar günü altın renge döner (gün vurgusu).

### 5.5 Toast / Bildirim Sistemi

Sağ alttan slide-in. Üst üste yığılır (max 3). Otomatik dismiss 4s.
Çeşitler: `success`, `error`, `info`, `warning`.

### 5.6 Yardım Drawer

`?` tuşu → sağdan açılır kısayol cheat sheet.

---

## 6. Veri Görselleştirme

**Kütüphane kararı**: External library YOK — manuel SVG ile çiziyoruz.
Sebepler: bundle hafif, marka diline tam uyum, Tailwind yok zaten.

Bileşenler:
- `<Sparkline>` — 60×16 px ince line
- `<BarChart>` — Bugünün saat saat sipariş hacmi
- `<LineChart>` — 30 günlük ciro
- `<DonutChart>` — Kategori dağılımı
- `<HeatmapGrid>` — 7×24 saat heatmap

Hepsi a11y için `<title>`/`<desc>` ve klavyeyle gezilebilir.

---

## 7. Mobil & Responsive

Admin paneli **masaüstü-öncelikli** (yoğun veri tablo ihtiyacı), ama tablet (≥768px) için optimize edilecek.
Telefonda (<640px) "Sipariş listesi yalın", "Pano basitleştirilmiş" — full feature olmayacak.

Sidebar mobilde gizleniyor → hamburger menü.

---

## 8. Performans

- Server Component varsayılan (data fetch server tarafında, client'a minimum JS).
- Filtre değişimi → URL update → router.refresh (full RSC re-fetch, hızlı).
- Tablo virtualization (≥100 satır olursa).
- Image optimization (next/image her zaman).
- Realtime subscription tek bir top-level provider'da (her sayfa kendi sub açmıyor).

---

## 9. Dosya Mimarisi

```
src/
  components/
    admin/
      ui/                        ← atomlar
        Button.tsx
        IconButton.tsx
        Input.tsx
        Select.tsx
        Badge.tsx
        Kbd.tsx
        LiveDot.tsx
        Sparkline.tsx
        TrendChip.tsx
        Skeleton.tsx
        EmptyState.tsx
      shell/                     ← chrome
        TopBar.tsx
        Sidebar.tsx
        Breadcrumb.tsx
        UserMenu.tsx
        LiveStatus.tsx           ← canlı bağlantı widget'ı
        Clock.tsx                ← saniye saniye saat
        ConnectionProvider.tsx   ← realtime subscription holder
      tables/
        DataTable.tsx
        OrdersTable.tsx
        ProductsTable.tsx
      charts/
        Sparkline.tsx
        BarChart.tsx
        LineChart.tsx
        DonutChart.tsx
        Heatmap.tsx
      command/
        CommandPalette.tsx
        CommandProvider.tsx
      toast/
        Toaster.tsx
        toast.ts
      activity/
        ActivityFeed.tsx
  app/
    admin/
      layout.tsx                 ← yeni light tema layout
      page.tsx                   ← yeni pano
      globals.css                ← admin tema değişkenleri
      siparisler/...
      urunler/...
      musteriler/...
      analitik/...
      stok/...
      ayarlar/...
```

---

## 10. Implementation Aşamaları

Her aşama bağımsız push edilebilir. Onaylarsan sırayla giderim.

### Faz 1 — Tasarım Sistemi & Shell *(zorunlu temel)*
1. `src/app/admin/globals.css` veya scope'lu CSS — admin değişkenleri
2. UI atomik bileşenler: Button, Input, Select, Badge, Kbd, LiveDot, Sparkline
3. AdminTopBar (Clock + LiveStatus + UserMenu + Breadcrumb)
4. AdminSidebar (collapse + active state)
5. Yeni `/admin/layout.tsx`
6. Toast sistemi
7. Eski koyu tema'dan refactor (mevcut sayfalar yeni bileşenleri kullanır)

### Faz 2 — Pano (Yeniden)
1. MetricCard (sparkline ile)
2. Saat saat bar chart
3. Top satılan ürünler widget
4. Düşük stok widget'ı
5. Sistem durumu kartı (DB ping, telegram, storage)
6. `getDashboardStatsV2()` server function (zenginleştirilmiş)

### Faz 3 — Sipariş Sayfaları
1. DataTable bileşeni
2. FilterBar (URL state ile)
3. Toplu işlem & CSV export
4. Sipariş detay redesign + Timeline bileşeni
5. Müşteriye not / e-posta placeholder

### Faz 4 — Ürün Sayfaları
1. Ürün liste redesign + inline stok edit
2. Detay sayfası tab layout
3. Görsel yükleme (Supabase Storage)
4. Markdown editor (long_desc için, opsiyonel)

### Faz 5 — Yeni Sayfalar
1. Müşteriler
2. Analitik (chart'lar)
3. Stok takibi (toplu güncelleme)
4. Ayarlar (banka bilgileri, telegram test)

### Faz 6 — Real-time & Komut Paleti
1. ConnectionProvider (Supabase Realtime)
2. ActivityFeed
3. CommandPalette (⌘K)
4. Klavye kısayolları sistemi
5. Yardım drawer (`?` tuşu)

### Faz 7 — Polish
1. Sayım animasyonları (count-up)
2. Skeleton states
3. Empty states
4. Loading states
5. Error boundaries
6. Accessibility audit (a11y)

---

## 11. Riskler & Notlar

- **Realtime maliyeti**: Supabase free tier'da Realtime mesaj sayısı sınırlı. Sadece admin paneli için kullandığımızdan minimal — endişe yok.
- **Bundle boyutu**: Manuel chart'lar tutmak external lib eklemekten daha hafif ama bakım yükü var.
- **Eski admin sayfalarının refactor'ı**: Faz 1'de kırılma olmaması için eski sayfaları paralel tutuyorum, yeni shell'e geçince eskiyi siliyorum.
- **Mobile**: ilk MVP'de tablet+masaüstü hedef. Mobile için ayrı bir polish fazı (Faz 8 olarak ekleyebilirim) gerekiyorsa söyle.

---

## 12. Onay Bekleyen Soru(lar)

1. **Faz sayısı**: Hepsini tek seferde mi yoksa Faz 1 → onay → Faz 2 mi? Önerim: Faz 1+2 bir push, Faz 3+4 ikinci push, Faz 5+6+7 üçüncü push.
2. **Klavye kısayolları**: Linear/Vim-style (g s, g u) mu yoksa düz ⌘+harf mi? Önerim: her ikisi de var.
3. **Komut paleti ⌘K**: tüm sayfalardan erişilebilsin mi? Önerim: evet, Faz 6'da.
4. **Müşteriler sayfası**: auth gelmediği için sadece sipariş email'lerinden türetiliyor. Tamam mı?
5. **CSV export**: Hangi alanlar dahil olsun? Önerim: sipariş no, müşteri, toplam, durum, ödeme, tarih, ürünler (concat).

---

**Onayını bekliyorum.** "Başla" dersen Faz 1+2'den ilerleyeyim.
Yapılması gerekenler hakkında değişiklik/ekleme/iptal varsa söyle.
