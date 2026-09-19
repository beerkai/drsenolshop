// ═══════════════════════════════════════════════════════════════
// Miras / Hikâye — statik hasat günlüğü (blog temeli, DB yok)
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
      '1100 metre rakımda kekik ve endemik çiçek florasından süzülen ilk damlalar laboratuvara gönderildi.',
    publishedAt: '2026-04-12',
    category: 'Hasat günlüğü',
    body: [
      'Bu yazı miras sayfasındaki hasat günlüğünün ilk kaydıdır. İçerik ileride genişletilecektir.',
      'Hasat ekibi, kovanlardan alınan peteklerin sıcaklık ve nem kontrolünden geçirildiğini, ardından soğuk süzüm hattına alındığını not etti.',
      'Analiz sonuçları onaylandığında ürün sayfalarındaki QR kodları güncellenecektir.',
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
      'Dr. Şenol laboratuvarında her hasat partisi için minimum kalite eşikleri tanımlıdır.',
      'Prolin ve diastaz aktivitesi balın tazeliğini; HMF ise ısıl işlem veya uzun beklemenin izlerini gösterir.',
      'Bu seride ilerleyen yazılarda örnek rapor ekran görüntüleri paylaşılacaktır.',
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
