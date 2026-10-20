// ═══════════════════════════════════════════════════════════════
// Anasayfa CMS snapshot — Stitch editorial minimal (admin’e taşınacak)
// ═══════════════════════════════════════════════════════════════

import type { HeroProps } from '@/types/hero'
import type { EditorialHomeContent } from '@/types/editorial-home'
import { HEADER_ANNOUNCEMENT_TR } from '@/lib/shipping-policy'

const HERO_DESKTOP =
  '/design-preview/stitch-01.jpg'

const HERO_MOBILE =
  '/design-preview/stitch-02.jpg'

export const homeHeroProps: HeroProps = {
  image: {
    src: HERO_DESKTOP,
    alt: 'Amber cam kavanozda ham bal; doğal taş zemin, sinematik sabah ışığı.',
  },
  imageMobile: {
    src: HERO_MOBILE,
    alt: 'Saitabat ormanında amber bal kavanozu; sisli sabah ışığı.',
  },
  eyebrow: "Saitabat Köyü • 1985'ten beri arıcılık",
  title: "Saitabat'ın sakin yamaçlarından, yılda bir kez hasat edilen ham bal.",
  subtitle:
    'Uludağ eteklerinde, 1.100 metre rakımdaki doğal florada üretilir. Pastörize edilmez, endüstriyel filtreden geçirilmez.',
  cta: { label: '2025 Hasadını İnceleyin', href: '/koleksiyon' },
  metaLabel: 'Hasat Kodu: 25-STB-01',
  provenance: {
    gpsLine: 'Konum: 40.1683° K, 29.2155° D',
    elevationLine: 'Rakım: 1.100 m • Uludağ endemik flora kuşağı',
  },
  mobile: {
    badge: 'SAİTABAT • 1985',
    kicker: 'Yılda Tek Hasat • Sınırlı Sayıda',
    subtitle: 'Pastörize edilmeden, ısıl işlem görmeden kovan sıcaklığında kavanoza alınır.',
    cta: { label: '2025 Hasadını İnceleyin', href: '/koleksiyon' },
  },
  underlapHeader: true,
}

export const homeCurationStrip = {
  harvestTitle: 'HASAT DÖNEMİ:',
  harvestDetail: '2024–2025 kestane ve karakovan balları satışta',
  highlights: ['%100 Ham', 'HMF Değeri: <10 mg/kg', 'Akredite Laboratuvar Analizli'],
}

export const editorialHomeContent: EditorialHomeContent = {
  header: {
    announcement: HEADER_ANNOUNCEMENT_TR,
    // logo: gerçek logo görseli yüklendiğinde doldurulur (admin panel).
    // Boşken tipografik wordmark (DM Sans) kullanılır — Stitch wordmark.
    wordmark: { text: 'Dr. Şenol', year: '1985' },
    nav: [
      { id: 'koleksiyon', label: 'Koleksiyon', href: '/koleksiyon' },
      { id: 'aricilik', label: 'Hikâyemiz', href: '/hikaye' },
      { id: 'signature', label: 'Signature Series', href: '/kategori/signature', lang: 'en' },
      { id: 'goldylium', label: 'Goldylium Cosmetics', href: '/goldylium', lang: 'en' },
      { id: 'iletisim', label: 'İletişim', href: '/iletisim' },
    ],
    searchLabel: 'Arama',
    accountLabel: 'Hesabım',
    cartLabel: 'Sepet',
  },
  mobileNav: [
    { id: 'kesfet', label: 'Ana Sayfa', href: '/', icon: 'explore' },
    { id: 'koleksiyon', label: 'Koleksiyon', href: '/koleksiyon', icon: 'grid' },
    { id: 'miras', label: 'Hikâyemiz', href: '/hikaye', icon: 'book' },
    { id: 'canta', label: 'Sepet', href: '/odeme', icon: 'bag' },
    { id: 'hesap', label: 'Hesap', href: '/hesabim', icon: 'account' },
  ],
  harvestMetrics: [
    {
      label: 'Saflık',
      value: '%100 Ham',
      detail: 'Isıl işlemsiz • Filtresiz',
      detailAccent: true,
    },
    {
      label: 'HMF Değeri',
      value: '<10',
      detail: 'Yasal limit: 40 mg/kg',
    },
    {
      label: 'Flora Rakımı',
      value: '1.100 m',
      detail: 'Uludağ Güney Yamaçları',
    },
    {
      label: 'Akredite Analiz',
      value: 'TÜRKAK Onaylı',
      detail: 'Parti No: #25-STB',
      detailAccent: true,
    },
  ],
  feed: {
    header: {
      eyebrow: 'Seçtiklerimiz',
      title: 'Hasat Günlüğü',
      aside: 'Instagram Feed — @drsenol.shop / Saitabat Serisi No. 41',
    },
    items: [
      {
        type: 'product',
        id: 'p1',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-03.jpg',
          alt: 'Karakovan çam balı amber kavanoz.',
        },
        badge: { text: 'Sınırlı Hasat', position: 'left', variant: 'dark' },
        category: 'Saitabat Yüksek Rakım',
        title: 'Karakovan Çam Balı 450g',
        price: '₺1.250',
        ctaLabel: 'İncele',
      },
      {
        type: 'atmosphere-square',
        id: 'a1',
        image: {
          src: '/design-preview/stitch-04.jpg',
          alt: 'Ham bal damlası keten dokuda makro.',
        },
        overlayKicker: 'Arşivden',
        overlayTitle: 'Saitabat Köyü, 1100m',
        footerLeft: 'Hasat Notu 04',
        footerRight: '07:20 GÜNDOĞUMU',
      },
      {
        type: 'product',
        id: 'p2',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-05.jpg',
          alt: 'Ihlamur ve kestane balı cam kavanoz.',
        },
        badge: { text: 'Ham & Filtresiz', position: 'right', variant: 'light' },
        category: 'Uludağ Yamaçları',
        title: 'Ham Ihlamur & Kestane Balı 500g',
        price: '₺980',
        ctaLabel: 'İncele',
      },
      {
        type: 'editorial-square',
        id: 'e1',
        image: {
          src: '/design-preview/stitch-06.jpg',
          alt: 'Arı poleni ve propolis kase kompozisyonu.',
        },
        kicker: 'Apiterapi Konsantresi',
        title: 'Arı Poleni ve Saf Propolis',
        description: 'Mevsimin ilk polen hasadı, elle ayıklanmış.',
      },
      {
        type: 'product-dark',
        id: 'pd1',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-07.jpg',
          alt: 'Goldylium lüks serum şişesi.',
        },
        badge: 'Goldylium Care',
        category: 'Apiterapi Serum & Bakım',
        title: 'Huile Précieuse 30ml',
        description: 'Arı sütü ve yabani propolis içeren cilt bakım yağı.',
        price: '₺2.400',
        ctaLabel: 'Keşfet',
      },
      {
        type: 'product',
        id: 'p3',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-08.jpg',
          alt: 'Propolis ekstrakt damlalık şişe.',
        },
        category: 'Yüksek Biyoaktif',
        title: 'Saf Ham Propolis Ekstraktı %30',
        subtitle: '30ml Damlalıklı Amber Şişe',
        price: '₺850',
        ctaLabel: 'İncele',
      },
      {
        type: 'quote',
        id: 'q1',
        quote:
          'Doğanın dengesine saygı; laboratuvar hilesi yok, ısıl işlem yok, sadece zaman ve arılar.',
        author: 'Dr. Şenol',
        note: 'KÖY NOTU • 1985',
      },
      {
        type: 'atmosphere-portrait',
        id: 'ap1',
        image: {
          src: '/design-preview/stitch-09.jpg',
          alt: 'Saitabat çam ormanlarında kovan kareleri.',
        },
        kicker: 'Flora Kaydı',
        title: 'Saitabat Çam Ormanları',
        meta: 'Nem %58 • 16°C • Sessiz Hasat',
      },
      {
        type: 'product',
        id: 'p4',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-10.jpg',
          alt: 'Çiçek ve lavanta balı kavanoz.',
        },
        category: 'Yaban Çiçekleri',
        title: 'Saitabat Çiçek & Lavanta Balı 450g',
        price: '₺890',
        ctaLabel: 'İncele',
      },
      {
        type: 'square-caption',
        id: 'sc1',
        image: {
          src: '/design-preview/stitch-11.jpg',
          alt: 'Kristalize bal ve bal kaşığı.',
        },
        leftCaption: 'Doğal Kristalizasyon',
        rightCaption: 'Canlı Ferment',
      },
      {
        type: 'feature-wide',
        id: 'fw1',
        eyebrow: 'Sınırlı Hediye Kutusu',
        title: 'Mevsim Hediye Sandığı',
        description:
          'Karakovan çam, ham kestane, saf propolis ve ceviz ağacından oyma bal kaşığı ile el yapımı ahşap sandıkta sınırlı 100 adet.',
        price: '₺3.850',
        stockNote: 'Son 14 adet',
        ctaLabel: 'Sipariş Ver',
        href: '/koleksiyon',
      },
    ],
  },
  journal: {
    image: {
      src: '/design-preview/stitch-12.jpg',
      alt: 'Saitabat’ta petek kontrolü; dağ silueti.',
    },
    certificate: {
      title: 'Analiz Sertifikası #2024-STB',
      body: 'Polen yoğunluğu: %88 Kestane & Ihlamur. Isıl işlem görmeden, 38°C kovan sıcaklığında kavanoza alınmıştır.',
    },
    breadcrumb: ['Saitabat Günlüğü • Bölüm 03', 'Kovan No. 19'],
    title: 'Neden ham bal? Enzimleri bozulmamış, poleni ayrıştırılmamış, acele edilmemiş.',
    paragraphs: [
      "Ham bal pastörize edilmez, endüstriyel filtreyle poleninden ayrılmaz. Bursa'nın kestane ve çam florasından geldiği gibi cam kavanoza alınır.",
      "Market ballarının aksine, Dr. Şenol ballarında kristalleşme bir kusur değil; saflığın ve polen zenginliğinin doğal bir işaretidir. 1985'ten beri doğanın işine karışmıyoruz.",
    ],
    metrics: [
      { value: '%0', label: 'İlave Şeker (C4)' },
      { value: '1.100 m', label: 'Saitabat Rakımı', accent: true },
      { value: '40 Yıl', label: 'Arıcılık Tecrübesi' },
    ],
    primaryCta: { label: 'Hasat Raporunu İncele', href: '/analizler' },
    secondaryCta: { label: 'Saitabat Köyünü Tanıyın →', href: '/saitabat-koyu' },
  },
  goldylium: {
    eyebrow: 'Apiterapi Kozmetiği',
    title: 'Goldylium Apithérapie',
    intro:
      'Arı sütünün gençleştirici biyomolekülleri ile yüksek dağ propolisinin hücresel onarım gücü, Paris usulü formüllerle buluşuyor.',
    products: [
      {
        id: 'g1',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-13.jpg',
          alt: 'Goldylium arı sütü serumu.',
        },
        phaseBadge: 'FAZ I • YENİLENME',
        category: 'Konsantre Arı Sütü Serumu',
        title: 'Sérum Reine Royale 30ml',
        description: 'Kolajen sentezini destekleyen taze dondurulmuş arı sütü ve yabani lavanta özü.',
        price: '₺2.850',
        ctaLabel: 'İncele +',
      },
      {
        id: 'g2',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-14.jpg',
          alt: 'Goldylium propolis gece balsamı.',
        },
        phaseBadge: 'FAZ II • ONARIM',
        category: 'Bariyer Onarıcı Gece Balsamı',
        title: 'Baume Propolis Céleste 50ml',
        description: 'Uludağ kestane propolisi ve soğuk sıkım hodan yağı ile yoğun hücresel gece bakımı.',
        price: '₺2.200',
        ctaLabel: 'İncele +',
      },
      {
        id: 'g3',
        href: '/koleksiyon',
        image: {
          src: '/design-preview/stitch-15.jpg',
          alt: 'Goldylium botanik tonik.',
        },
        phaseBadge: 'FAZ 0 • ARINMA',
        category: 'Hücresel Çiçek Suyu Tonik',
        title: 'Brume Botanique Saitabat 100ml',
        description: 'Arıların tozlaştırdığı yabani dağ kekliği ve ıhlamur hidrosolü ile pH dengeleyici.',
        price: '₺1.450',
        ctaLabel: 'İncele +',
      },
    ],
    assurance: 'Laboratuvar Güvencesi: %100 Doğal Kökenli Biyoaktifler',
    collectionLink: {
      label: 'Goldylium Cosmetics Dünyasını İnceleyin',
      href: '/goldylium',
    },
  },
  instagram: {
    eyebrow: 'Bizi Takip Edin',
    title: "Instagram'da @drsenol.shop",
    followLink: {
      label: '@drsenol.shop',
      href: 'https://instagram.com/drsenol.shop',
    },
    tiles: [
      {
        id: 'ig1',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-16.jpg',
          alt: 'Kahvaltı masasında bal kavanozu.',
        },
      },
      {
        id: 'ig2',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-17.jpg',
          alt: 'Dağ lavantasında arı makro.',
        },
      },
      {
        id: 'ig3',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-18.jpg',
          alt: 'Bal kaşığı parşömen üzerinde.',
        },
      },
      {
        id: 'ig4',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-19.jpg',
          alt: 'El yapımı hediye paketi.',
        },
      },
      {
        id: 'ig5',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-20.jpg',
          alt: 'Laboratuvar camı ve bal.',
        },
      },
      {
        id: 'ig6',
        hoverLabel: 'Görüntüle',
        image: {
          src: '/design-preview/stitch-21.jpg',
          alt: 'Sisli Saitabat arılığı.',
        },
      },
    ],
    newsletter: {
      eyebrow: 'E-Bülten',
      title: 'Yeni hasatlardan ilk siz haberdar olun',
      description:
        'Yılda yalnızca birkaç kez, yeni hasat çıktığında e-posta gönderiyoruz. Reklam yok, yalnızca arıcılık haberleri.',
      placeholder: 'E-posta adresiniz...',
      submitLabel: 'Abone Ol →',
      disclaimer: 'İstediğiniz zaman tek tıkla abonelikten çıkabilirsiniz.',
    },
  },
  values: [
    { label: 'Menşei', value: 'Saitabat Köyü, Uludağ' },
    { label: 'Saflık', value: 'Isıl İşlemsiz Ham Bal' },
    { label: 'Analiz', value: 'Üniversite Onaylı Rapor' },
    { label: 'Paketleme', value: 'Isı Korumalı Kutu' },
  ],
  footer: {
    columns: [
      {
        title: "Saitabat'tan Laboratuvara",
        body: "1985'ten beri Uludağ eteklerindeki Saitabat Köyü'nde arıcılık yapıyoruz. Analiz raporlu ham bal ve apiterapi ürünleri.",
      },
      {
        title: 'Koleksiyon & Marka',
        links: [
          { label: 'Tüm Koleksiyon', href: '/koleksiyon' },
          { label: 'Goldylium Parfüm', href: '/goldylium' },
          { label: 'Analizler', href: '/analizler' },
          { label: 'Hikâyemiz', href: '/hikaye' },
          { label: 'Saitabat Köyü', href: '/saitabat-koyu' },
          { label: 'Bilim Yaklaşımımız', href: '/bilim-yaklasimimiz' },
        ],
      },
      {
        title: 'Müşteri Hizmetleri',
        links: [
          { label: 'Sipariş & Kargo Takibi', href: '/siparis-takibi' },
          { label: 'Gönderim Politikası', href: '/kargo-teslimat' },
          { label: 'İade & Değişim', href: '/iade-degisim' },
          { label: 'Sıkça Sorulanlar', href: '/sikca-sorulanlar' },
          { label: 'İletişim', href: '/iletisim' },
        ],
      },
      {
        title: 'Bülten',
        body: 'Hasat bültenleri ve sınırlı üretim duyuruları için abone olun. Genel sorularınız için hello@drsenol.shop adresine yazabilirsiniz.',
      },
    ],
    footerNewsletter: { placeholder: 'E-posta adresiniz', submitLabel: 'Gönder' },
    legalLinks: [
      { label: 'KVKK Aydınlatma Metni', href: '/kvkk-aydinlatma' },
      { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
      { label: 'Çerez Politikası', href: '/cerez-politikasi' },
      { label: 'İade & Değişim', href: '/iade-degisim' },
      { label: 'Kargo Takibi', href: '/siparis-takibi' },
      { label: 'Gönderim Politikası', href: '/kargo-teslimat' },
      { label: 'Mesafeli Satış Sözleşmesi', href: '/mesafeli-satis-sozlesmesi' },
      { label: 'Ön Bilgilendirme Formu', href: '/on-bilgilendirme-formu' },
    ],
    contactEmails: [
      { label: 'Genel', address: 'hello@drsenol.shop' },
      { label: 'Destek', address: 'destek@drsenol.shop' },
      { label: 'Sipariş', address: 'siparis@drsenol.shop' },
    ],
    copyright: '© 1985–2026 Dr. Şenol Natural Honey. Saitabat, Bursa.',
    instagramHandle: { label: '@drsenol.shop', href: 'https://instagram.com/drsenol.shop' },
    currency: { enabled: false, primary: 'TRY (₺)', secondary: 'EUR (€)' },
    tagline: 'Saf doğa, titiz bilim',
  },
}
