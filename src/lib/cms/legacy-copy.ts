// ═══════════════════════════════════════════════════════════════
// Eski tema metinleri → güncel Türkçe karşılıkları
//
// Tema editörü tüm içeriği site_settings'e yazdığı için kod
// varsayılanını değiştirmek DB kaydındaki eski metni ezmez.
// Burada yalnızca eski varsayılanla BİREBİR eşleşen metinler
// değiştirilir; admin'in kendi yazdığı metne dokunulmaz.
// ═══════════════════════════════════════════════════════════════

const LEGACY_COPY: Record<string, string> = {
  // Hero
  'Tek Hasat Arıcılığı & Miras • Saitabat, 1985': "Saitabat Köyü • 1985'ten beri arıcılık",
  "Saitabat'ın sessiz dağlarından, 1985'ten bu yana tek hasat arı mucizeleri.":
    "Saitabat'ın sakin yamaçlarından, yılda bir kez hasat edilen ham bal.",
  'Uludağ eteklerinin el değmemiş 1100 metre rakım florası; pastörize edilmemiş, endüstriyel filtre görmemiş, saf apiterapi mirası.':
    'Uludağ eteklerinde, 1.100 metre rakımdaki doğal florada üretilir. Pastörize edilmez, endüstriyel filtreden geçirilmez.',
  '2025 Rezerve Hasat Koleksiyonu Keşfet': '2025 Hasadını İnceleyin',
  '2025 Hasadını Keşfet': '2025 Hasadını İnceleyin',
  'GPS Koor: 40.1683° N, 29.2155° E': 'Konum: 40.1683° K, 29.2155° D',
  'Rakım: 1100 Metre • Uludağ Endemik Flora Kuşağı': 'Rakım: 1.100 m • Uludağ endemik flora kuşağı',
  'Tek Hasat • Sınırlı Rezerv': 'Yılda Tek Hasat • Sınırlı Sayıda',
  'İşlenmemiş, pastörize edilmemiş, saf flora ile kovan sıcaklığında şişelendi.':
    'Pastörize edilmeden, ısıl işlem görmeden kovan sıcaklığında kavanoza alınır.',
  '2024–2025 Kestane & Karakovan Seçkisi Yayında': '2024–2025 kestane ve karakovan balları satışta',

  // Menü
  Miras: 'Hikâyemiz',
  'Arıcılık & Hikaye': 'Hikâyemiz',
  Çanta: 'Sepet',

  // Hasat metrikleri ve değerler şeridi
  '%100 Ham & Canlı': '%100 Ham',
  'Saflık Standardı': 'Saflık',
  'Isıl İşlemsiz • Filtresiz': 'Isıl işlemsiz • Filtresiz',
  'Doğal Flora Rakımı': 'Flora Rakımı',
  'Akredite Sertifika': 'Akredite Analiz',
  'TÜRKAK Onay': 'TÜRKAK Onaylı',
  'Saf & Canlı': 'Saflık',
  Lojistik: 'Paketleme',
  'Özel Isı Korumalı Paket': 'Isı Korumalı Kutu',

  // Editoryal akış (varsayılan olarak kapalı)
  'Küratör Seçkisi & Günlük Akış': 'Seçtiklerimiz',
  'Miras ve Hasat Günlüğü': 'Hasat Günlüğü',
  'Miras Fotoğrafı': 'Arşivden',
  'Arı Poleni & Saf Propolis İksiri': 'Arı Poleni ve Saf Propolis',
  'Hücresel canlılık için mevsimin ilk polen hasadı, elle ayıklanmış.':
    'Mevsimin ilk polen hasadı, elle ayıklanmış.',
  'Arı sütü ve yabani propolis içeren lüks cilt eliksiri.':
    'Arı sütü ve yabani propolis içeren cilt bakım yağı.',
  'Özel Rezerve Kutusu': 'Sınırlı Hediye Kutusu',
  'Mevsimlik Koleksiyoncu Sandığı': 'Mevsim Hediye Sandığı',
  'Kalan Rezerve: 14 Adet': 'Son 14 adet',
  'Rezerve Et': 'Sipariş Ver',

  // Günlük bölümü
  'Polen yoğunluğu: %88 Kestane & Ihlamur. Isıl işlem görmeden 38°C kovan sıcaklığında şişelenmiştir.':
    'Polen yoğunluğu: %88 Kestane & Ihlamur. Isıl işlem görmeden, 38°C kovan sıcaklığında kavanoza alınmıştır.',
  'Neden Ham Bal? Canlı enzimler, saf flora ve zamanın sabrı.':
    'Neden ham bal? Enzimleri bozulmamış, poleni ayrıştırılmamış, acele edilmemiş.',
  "Pastörize edilmemiş, endüstriyel filtrelerle polenleri ayrıştırılmamış canlı besin. Bursa'nın el değmemiş kestane ve çam florasından doğrudan cam kavanozlara aktarılır.":
    "Ham bal pastörize edilmez, endüstriyel filtreyle poleninden ayrılmaz. Bursa'nın kestane ve çam florasından geldiği gibi cam kavanoza alınır.",
  "Geleneksel market ballarının aksine, Dr. Şenol hasatlarında bal kristalleri kusur değil; yaşamın, saflığın ve polen zenginliğinin en berrak kanıtıdır. 1985'ten bu yana doğanın akışına müdahale etmiyoruz.":
    "Market ballarının aksine, Dr. Şenol ballarında kristalleşme bir kusur değil; saflığın ve polen zenginliğinin doğal bir işaretidir. 1985'ten beri doğanın işine karışmıyoruz.",
  '0.0%': '%0',
  'İlave Şeker / C4': 'İlave Şeker (C4)',
  '1100m': '1.100 m',
  'Arıcılık Hafızası': 'Arıcılık Tecrübesi',
  "Saitabat'a Yolculuk →": 'Saitabat Köyünü Tanıyın →',

  // Goldylium bloğu
  'Lüks Apiterapi Kozmetiği': 'Apiterapi Kozmetiği',
  'Arı sütünün gençleştirici biyomolekülleri ile yüksek dağ propolisinin hücresel onarım gücü, parizyen formülasyonla buluşuyor.':
    'Arı sütünün gençleştirici biyomolekülleri ile yüksek dağ propolisinin hücresel onarım gücü, Paris usulü formüllerle buluşuyor.',

  // Instagram ve bülten
  'Görsel Akış': 'Bizi Takip Edin',
  '@drsenol.shop Instagram Topluluğu': "Instagram'da @drsenol.shop",
  'Özel İletişim Hattı': 'E-Bülten',
  'Hasat Bildirimleri & Rezerve Seçkiler': 'Yeni hasatlardan ilk siz haberdar olun',
  'Yılda yalnızca birkaç kez, kovanlar açıldığında gönderilen sessiz hasat bültenine kaydolun. Reklamsız, yalnızca saf arıcılık kayıtları.':
    'Yılda yalnızca birkaç kez, yeni hasat çıktığında e-posta gönderiyoruz. Reklam yok, yalnızca arıcılık haberleri.',
  'Kayıt Ol →': 'Abone Ol →',
  'Dilediğiniz an tek tıkla üyelikten ayrılabilirsiniz.':
    'İstediğiniz zaman tek tıkla abonelikten çıkabilirsiniz.',

  // Footer
  'Saitabat Mirası & Laboratuvar': "Saitabat'tan Laboratuvara",
  "Uludağ eteklerinde, Saitabat Köyü'nün endemik florasında 1985'ten bu yana süregelen butik arıcılık, analiz sertifikalı saf bal ve biyoteknolojik apiterapi formülleri.":
    "1985'ten beri Uludağ eteklerindeki Saitabat Köyü'nde arıcılık yapıyoruz. Analiz raporlu ham bal ve apiterapi ürünleri.",
  'Editöryal Notlar': 'Bülten',
  'Sessiz Lüks & Saf Doğa': 'Saf doğa, titiz bilim',

  // Vitrin ve ürün etiketleri
  'Keşfet · Seçki': 'Çok Satanlar',
  Varyantta: 'Seçeneğe göre',
}

type NavLike = { id?: unknown; label?: unknown }

/** Mobil menüde ana sayfa sekmesi: "Keşfet" yalnızca bu id için değişir */
function fixNavItem<T extends NavLike>(item: T): T {
  if (item.id === 'kesfet' && item.label === 'Keşfet') return { ...item, label: 'Ana Sayfa' }
  return item
}

function replaceDeep(value: unknown): unknown {
  if (typeof value === 'string') return LEGACY_COPY[value] ?? value
  if (Array.isArray(value)) return value.map(replaceDeep)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = replaceDeep(v)
    return out
  }
  return value
}

export function normalizeLegacyCopy<T extends { editorial: { mobileNav: NavLike[] } }>(content: T): T {
  const next = replaceDeep(content) as T
  return {
    ...next,
    editorial: { ...next.editorial, mobileNav: next.editorial.mobileNav.map(fixNavItem) },
  }
}
