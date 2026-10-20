import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'

const DOORS = [
  {
    href: '/admin/tema',
    title: 'Duyuru ve tema',
    body: 'Üst şerit, menü ve anasayfa metinleri. Kargo duyurusu buradan değişir.',
  },
  {
    href: '/admin/gorseller',
    title: 'Görseller',
    body: 'Hero ve editoryal fotoğraflar. Vitrin kartlarının görseli değil, sayfa görselleri.',
  },
  {
    href: '/admin/seritler',
    title: 'Şeritler',
    body: 'Anasayfadaki HTML şeritleri.',
  },
  {
    href: '/admin/icerik',
    title: 'Sayfa metinleri',
    body: 'Sık sorulan sorular ve sabit sayfa kopyası.',
  },
  {
    href: '/admin/vitrin',
    title: 'Vitrin sırası',
    body: 'Koleksiyonda ürünlerin dizilişi.',
  },
  {
    href: '/admin/analizler',
    title: 'Laboratuvar',
    body: 'Yayımlanan analiz PDF’leri.',
  },
]

export default async function AdminSitePage() {
  await requireAdmin()

  return (
    <div className="ad-page">
      <header className="ad-page-head">
        <p className="ad-eyebrow">Site</p>
        <h1 className="ad-display ad-page-title">Vitrini buradan düzenle.</h1>
        <p className="ad-page-lead">
          Tema, görsel, şerit ve metin ayrı araçlardı. Hepsi bu kapının arkasında. Sipariş ve stok soldaki İşler bölümünde.
        </p>
      </header>

      <div className="ad-door-grid">
        {DOORS.map((door) => (
          <Link key={door.href} href={door.href} className="ad-door">
            <span className="ad-door-title">{door.title}</span>
            <span className="ad-door-body">{door.body}</span>
            <span className="ad-door-go">Aç</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
