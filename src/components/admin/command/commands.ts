// ═══════════════════════════════════════════════════════════════
// Komut Paleti — komut tanımları
// ─ Her komutun bir id, label, action veya href olur
// ─ section ile grup'lanır, keywords arama için
// ═══════════════════════════════════════════════════════════════

export type CommandAction =
  | { type: 'navigate'; href: string }
  | { type: 'logout' }
  | { type: 'help' }

export interface AdminCommand {
  id: string
  label: string
  description?: string
  section: 'Sayfalar' | 'Hızlı Filtreler' | 'Hesap' | 'Yardım'
  keywords?: string[]
  shortcut?: string
  action: CommandAction
}

export const ADMIN_COMMANDS: AdminCommand[] = [
  // ── Sayfalar ───────────────────────────────────────────────
  { id: 'go:pano',       label: 'Pano',         section: 'Sayfalar', keywords: ['dashboard', 'ana', 'home'], shortcut: '⌘1', action: { type: 'navigate', href: '/admin' } },
  { id: 'go:siparisler', label: 'Siparişler',   section: 'Sayfalar', keywords: ['orders', 'sipariş'],         shortcut: '⌘2', action: { type: 'navigate', href: '/admin/siparisler' } },
  { id: 'go:urunler',    label: 'Ürünler',      section: 'Sayfalar', keywords: ['products', 'ürün', 'katalog'],shortcut: '⌘3', action: { type: 'navigate', href: '/admin/urunler' } },
  { id: 'go:musteriler', label: 'Müşteriler',   section: 'Sayfalar', keywords: ['customers', 'müşteri'],       shortcut: '⌘4', action: { type: 'navigate', href: '/admin/musteriler' } },
  { id: 'go:analitik',   label: 'Analitik',     section: 'Sayfalar', keywords: ['analytics', 'rapor'],         shortcut: '⌘5', action: { type: 'navigate', href: '/admin/analitik' } },
  { id: 'go:stok',       label: 'Stok',         section: 'Sayfalar', keywords: ['stock', 'inventory'],         shortcut: '⌘6', action: { type: 'navigate', href: '/admin/stok' } },
  { id: 'go:gunluk',     label: 'Günlük',       section: 'Sayfalar', keywords: ['journal', 'not', 'diary'],    shortcut: '⌘7', action: { type: 'navigate', href: '/admin/gunluk' } },
  { id: 'go:ayarlar',    label: 'Ayarlar',      section: 'Sayfalar', keywords: ['settings', 'config'],         shortcut: '⌘,', action: { type: 'navigate', href: '/admin/ayarlar' } },

  // ── Hızlı Filtreler ────────────────────────────────────────
  { id: 'filter:pending',   label: 'Bekleyen siparişleri göster',  description: 'Ödeme bekleyen siparişler',     section: 'Hızlı Filtreler', keywords: ['pending', 'bekleyen', 'ödeme'],        action: { type: 'navigate', href: '/admin/siparisler?status=pending' } },
  { id: 'filter:paid',      label: 'Ödenen siparişler',            description: 'Bugün/dün ödendi',              section: 'Hızlı Filtreler', keywords: ['paid', 'ödendi'],                       action: { type: 'navigate', href: '/admin/siparisler?status=paid' } },
  { id: 'filter:shipped',   label: 'Kargoda olan siparişler',      description: 'Kargoya verilenler',            section: 'Hızlı Filtreler', keywords: ['shipped', 'kargo'],                     action: { type: 'navigate', href: '/admin/siparisler?status=shipped' } },
  { id: 'filter:out',       label: 'Tükenen stok',                 description: 'Stok sıfırlanan varyantlar',    section: 'Hızlı Filtreler', keywords: ['out', 'tükendi', 'stok'],               action: { type: 'navigate', href: '/admin/stok?filter=out' } },
  { id: 'filter:low',       label: 'Düşük stok',                   description: 'Stok ≤5 olan varyantlar',       section: 'Hızlı Filtreler', keywords: ['low', 'az', 'düşük', 'stok'],           action: { type: 'navigate', href: '/admin/stok?filter=low' } },
  { id: 'filter:critical',  label: 'Kritik stok',                  description: 'Stok ≤2 olan varyantlar',       section: 'Hızlı Filtreler', keywords: ['critical', 'kritik', 'stok'],           action: { type: 'navigate', href: '/admin/stok?filter=critical' } },

  // ── Yardım ─────────────────────────────────────────────────
  { id: 'help:shortcuts',   label: 'Klavye kısayollarını göster',  section: 'Yardım', keywords: ['help', 'shortcuts', 'kısayol', 'klavye'], shortcut: '?', action: { type: 'help' } },

  // ── Hesap ──────────────────────────────────────────────────
  { id: 'account:logout',   label: 'Çıkış yap',                    section: 'Hesap', keywords: ['logout', 'çıkış', 'sign out'],            action: { type: 'logout' } },
]

/** Arama metnine göre komutları filtreler (fuzzy değil — basit prefix/contains) */
export function filterCommands(query: string): AdminCommand[] {
  const q = query.trim().toLowerCase()
  if (!q) return ADMIN_COMMANDS

  // Yaklaşık skorlama: label başlangıcı en yüksek, keyword/contains daha düşük
  type Scored = { cmd: AdminCommand; score: number }
  const scored: Scored[] = []

  for (const cmd of ADMIN_COMMANDS) {
    const label = cmd.label.toLowerCase()
    let score = 0
    if (label.startsWith(q)) score = 100
    else if (label.includes(q)) score = 60
    else {
      for (const kw of cmd.keywords ?? []) {
        if (kw.toLowerCase().includes(q)) {
          score = 40
          break
        }
      }
      if (score === 0 && cmd.description?.toLowerCase().includes(q)) score = 20
    }
    if (score > 0) scored.push({ cmd, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.cmd)
}
