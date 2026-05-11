# Dr. Şenol Shop — Tasarım Danışmanlığı Komutu

Aşağıdaki komutu Claude'a (claude.ai) yapıştır.

---

Sen bir üst düzey UI/UX tasarımcısı ve marka danışmanısın. Premium doğal ürün markalarının dijital deneyimlerinde uzmanlaşmışsın (Aesop, Le Labo, Eğriçayır, Manuka Doctor, Harrods Food Hall gibi). Senden bir e-ticaret web sitesinin tasarım dilini değerlendirmeni ve somut öneriler sunmanı istiyorum.

## MARKA KİMLİĞİ

**Marka:** Dr. Şenol Shop (drsenol.shop)
**Slogan:** "The Honey Scientist"
**Kuruluş:** 1985, Saitabat Köyü, Bursa
**Ürün Gamı:**
- Premium bal çeşitleri (Kestane, Ihlamur, Çiçek, Yayla balları) — 180g ile 900g arası kavanozlar
- Superblend serisi (Arı sütü + propolis + polen + bal karışımları) — marka imza ürünleri
- Arı ürünleri (Propolis, Polen, Arı Sütü, Arı Ekmeği, Balmumu mumlar)
- Goldylium Cosmetics (alt marka) — Parfüm koleksiyonu
**Fiyat Aralığı:** 400 TL – 14.100 TL (premium segment)
**Hedef Kitle:** 30-55 yaş, bilinçli tüketici, sağlık odaklı, premium alışverişe yatkın
**Rakipler/İlham Kaynakları:** Eğriçayır, Balparmak (premium segmenti), Manuka Doctor

## MEVCUT CANLI SİTE

https://drsenol.shop (ikas altyapısında, Shopify benzeri)

Mevcut sitenin tasarım öğeleri:
- Koyu siyah hero alanları + altın (#D4AF37) aksanlar
- "Signature Series" rozetlemesi
- Güven barı: "40+ Yıllık Tecrübe · %100 Doğal · Lab Onaylı · Dr. Formülü"
- Kayan marquee ticker: "DR. ŞENOL NATURAL ✦ THE HONEY SCIENTIST ✦ PREMIUM RAW ✦ SAITABAT EST. 1985 ✦ LABORATUVAR ONAYLI"
- Superblend 5 showcase bölümü (koyu zemin, ürün hikayesi)
- Instagram feed bölümü
- Koyu footer

## YENİ SİTENİN MİMARİSİ

Next.js (App Router) + Supabase ile sıfırdan inşa ediyoruz.
**Kısıtlar:** Tailwind CSS YOK. Sadece vanilla CSS Modules + CSS Custom Properties kullanılıyor.

### Mevcut Sayfa Yapısı

**Anasayfa akışı (yukarıdan aşağı):**
1. Siyah anons barı (kargo bilgisi)
2. Beyaz sticky header (logo ortada, nav sol-sağ, cam efekti backdrop-filter)
3. Tam ekran koyu hero (100vh) — altın glow efekti, staggered fadeInUp animasyonlar, scroll indicator
4. Trust bar (tek satır: ✦ 40+ Yıl · Tecrübe ✦ %100 Doğal · Katkısız...)
5. Ürün grid (4 sütun) — "Öne Çıkanlar" başlığı ile
6. Superblend 5 showcase (koyu arka plan, numaralı özellik listesi, altın glow)
7. Brand story (sıcak krem zemin, istatistikler: 1985 / 40+ / %100)
8. Koyu footer (marquee ticker + link kolonları)

**Diğer sayfalar:**
- Ürün detay: Sol resim galerisi + sağ yapışkan detay paneli (varyant seçici, fiyat, sepete ekle)
- Kategori: Breadcrumb + başlık + ürün grid

### Mevcut Tasarım Tokenleri

```
Renkler:
  Arka plan: #FEFDFB (sıcak kırık beyaz), #F6F3EC (warm cream), #F0EBE0
  Koyu: #0A0A0A, #141414, #1E1E1E
  Metin: #111111, #3D3D3D, #7A7A7A, #A3A3A3
  Altın: #B8962E (ana), #D4B44A (açık), rgba(184,150,46,0.10) (subtle)
  Kenarlık: #E4E0D8, #EEEBE4

Fontlar:
  Serif: Playfair Display (başlıklar, fiyatlar, logo)
  Sans: Inter (gövde, etiketler, nav)

Tip Ölçeği:
  Display: clamp(3rem, 6vw, 5.5rem)
  H1: 3rem
  H2: 2.25rem
  Body: 0.9375rem
  Label/eyebrow: 0.625rem (uppercase, letter-spacing: 0.35em)
```

## SENDEN İSTEDİKLERİM

Lütfen aşağıdaki konularda detaylı ve somut öneriler sun. Her önerinde "neden" kısmını açıkla:

### 1. Renk Paleti Değerlendirmesi
- Mevcut altın tonu (#B8962E) bu marka için ideal mi? Alternatif önerilerin var mı?
- Koyu/açık denge doğru mu? Farklı section geçişlerinde sıcak-soğuk denge nasıl olmalı?
- Premium bal markası için eksik gördüğün renk katmanları var mı? (örn. bal amber tonu, petek dokusu renkleri)

### 2. Tipografi
- Playfair Display + Inter kombinasyonu bu marka için yeterince premium mi?
- Alternatif serif önerilerin neler? (Cormorant Garamond, Libre Baskerville, DM Serif Display, vs.)
- Tip ölçeğinde hiyerarşi yeterli mi? Display boyutu çok mu agresif yoksa az mı?

### 3. Anasayfa Akış Sırası ve Bölüm Tasarımı
- Mevcut 8 bölümlük akış optimal mi? Eksik veya gereksiz bölüm var mı?
- Hero bölümü: Sadece metin mi olmalı yoksa ürün görseli de olmalı mı?
- Güven barı yeterince etkili mi? Farklı bir format önerir misin?
- Superblend 5 showcase bölümü için daha etkileyici bir layout önerir misin?
- Bir "Yorumlar/Testimonial" bölümü eklemeli miyiz? Nasıl görünmeli?
- Instagram feed veya sosyal kanıt bölümü gerekli mi?

### 4. Ürün Kartı Tasarımı
- 3:4 aspekt oranı doğru mu?
- Hover efektleri (zoom + overlay + "Ürünü İncele" etiketi) yeterince lüks mü?
- Kart bilgi hiyerarşisi: marka etiketi → ürün adı → varyant → fiyat — bu sıralama ideal mi?
- "Sepete Ekle" butonu kart üzerinde olmalı mı yoksa sadece detay sayfasında mı?

### 5. Ürün Detay Sayfası
- Sol galeri + sağ yapışkan panel layout'u en iyi seçenek mi?
- Varyant seçici (gramaj butonları) nasıl daha premium görünebilir?
- "Sepete Ekle" butonu tasarımı nasıl olmalı? (soldan sağa altın dolgu animasyonu kullanıyoruz)
- Ürün açıklaması alanında güven sinyalleri (lab raporu ikonu, sertifika, vs.) nasıl entegre edilmeli?

### 6. Genel Tasarım Dili Önerileri
- Dekoratif elementler (✦ yıldız) yeterli mi yoksa farklı motifler önerir misin? (petek deseni, arı silüeti, bal damlaması vs.)
- Micro-animasyonlar hangi noktalarda eklenmeli?
- Mobil deneyimde özellikle neye dikkat etmeliyiz?
- Bu premium segmentte sıkça yapılan tasarım hataları neler?

### 7. İlham Panosu
- Bu marka için referans alabileceğim 5-10 web sitesi önerir misin? (bal/arı ürünleri dışından da olabilir — lüks gıda, premium kozmetik, artisan markalar)
- Her birinde neyi referans almamı önerirsin?

Lütfen cevabını Türkçe ver. Mümkünse önerilerini "hemen uygulanabilir" ve "uzun vadeli vizyon" olarak ikiye ayır.
