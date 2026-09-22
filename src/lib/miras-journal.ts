// ═══════════════════════════════════════════════════════════════
// Miras — statik hasat günlüğü. Liste: /blog, yazı: /blog/[slug]
// İleride MDX veya CMS ile genişletilebilir
// ═══════════════════════════════════════════════════════════════

export interface MirasJournalPost {
  slug: string
  title: string
  excerpt: string
  /** ISO date YYYY-MM-DD */
  publishedAt: string
  category: string
  /** Detay sayfası gövdesi — paragraflar */
  body: string[]
}

export const MIRAS_JOURNAL_POSTS: MirasJournalPost[] = [
  {
    slug: 'saitabat-2026-ilkbahar-hasadi',
    title: 'Saitabat 2026 ilkbahar hasadı',
    excerpt:
      '1.100 metre rakımda kekik ve endemik çiçek florasından süzülen ilk damlalar laboratuvara gönderildi.',
    publishedAt: '2026-04-12',
    category: 'Hasat günlüğü',
    body: [
      'Nisanın ikinci haftasında Saitabat yamaçlarında kekik ve erken çiçek kuşağı açıldı. Kovanlar, gece serinliği ve gündüz güneşinin net ayrıldığı 1.100 metre hattında; salgı henüz koyulaşmadan alındı.',
      'Petekler önce sıcaklık ve nem kontrolünden geçti, ardından soğuk süzüm hattına alındı. Pastörizasyon yok: bal, kovan sıcaklığına yakın bir bantta cam kavanoza aktarıldı. Bu partinin hasat kodu 26-STB-ILK olarak kayda geçti.',
      'Numuneler aynı gün bağımsız laboratuvara yola çıktı. Onay bekleyen panel HMF, prolin, diastaz, nem ve polen dağılımını kapsıyor.',
      'İlkbahar seçkisi sınırlıdır. Flora kapandığında o mevsimin kavanozu da kapanır; sonraki damla bir sonraki çiçeklenmeyi bekler.',
    ],
  },
  {
    slug: 'laboratuvar-prolin-olcumu',
    title: 'Laboratuvar notu: prolin ve diastaz',
    excerpt:
      'Her parti bal için prolin, diastaz ve HMF değerlerinin neden etiketin ayrılmaz parçası olduğu.',
    publishedAt: '2026-03-08',
    category: 'Bilim',
    body: [
      'Dr. Şenol laboratuvarında her hasat partisi için aynı minimum kalite eşiği geçerlidir. Rapor onaylanmadan lot satışa çıkmaz. Bu kural, 1985’ten beri köyde tutulan defterin laboratuvar diline çevrilmiş halidir.',
      'Prolin, balın olgunluğunu ve doğal protein izini gösterir. Düşük prolin, erken hasat veya sulandırma şüphesini açar. Diastaz (amilaz) ise canlı enzimdir; aşırı ısı veya uzun depolama aktiviteyi düşürür. Bu yüzden süzümü kovan sıcaklığına yakın tutar, balı pastörize etmeyiz.',
      'HMF, ısıl işlem veya uzun beklemenin kimyasal izidir. Yasal üst sınır 40 mg/kg’dır; hedefimiz 10 mg/kg’ın altıdır. Yüksek HMF, market rafında ısınmış veya uzun bekletilmiş balın tipik işaretidir.',
      'Bu üç değer, polen analizi ve şeker profiliyle birlikte okunur. Yayımlanan belgeler analizler sayfasında yer alır.',
    ],
  },
]

export function getMirasJournalPost(slug: string): MirasJournalPost | undefined {
  return MIRAS_JOURNAL_POSTS.find((p) => p.slug === slug)
}

export function listMirasJournalPosts(): MirasJournalPost[] {
  return [...MIRAS_JOURNAL_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function formatMirasJournalDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
