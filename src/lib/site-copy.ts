// ═══════════════════════════════════════════════════════════════
// Statik sayfa metinleri — site_settings.site_copy (admin /admin/icerik)
// ═══════════════════════════════════════════════════════════════

import { getSiteSetting, setSiteSetting } from '@/lib/site-settings'

export const SITE_COPY_KEY = 'site_copy'

export interface FaqItemCopy {
  id: string
  question: string
  answer: string
}

export interface FaqSectionCopy {
  id: string
  eyebrow: string
  items: FaqItemCopy[]
}

export interface FaqPageCopy {
  eyebrow: string
  title: string
  titleAccent: string
  intro: string
  sections: FaqSectionCopy[]
}

export interface SiteCopy {
  faq: FaqPageCopy
}

export const defaultSiteCopy: SiteCopy = {
  faq: {
    eyebrow: 'Yardım · Sıkça Sorulanlar',
    title: 'Sorularınızın',
    titleAccent: 'cevabı.',
    intro: 'Müşterilerimizin en çok merak ettiği konuların cevapları.',
    sections: [
      {
        id: 'products',
        eyebrow: 'Ürünlerimiz',
        items: [
          {
            id: 'organic',
            question: 'Ballarınız organik mi?',
            answer:
              "Ballarımız Saitabat Köyü'nde, kimyasal müdahale olmadan hasat edilir; pastörize edilmez ve endüstriyel filtre görmez. Organik sertifika iddiası yerine her partiyi akredite laboratuvarda HMF, prolin, diastaz, nem ve şeker profili ile belgeleriz.",
          },
          {
            id: 'crystal',
            question: 'Bal kristalleşince ne yapmalıyım?',
            answer:
              'Kristalleşme, gerçek balın doğal bir özelliğidir ve kalite göstergesidir. Kavanozu 35–40°C ılık suya koyarak balı yeniden akışkan hale getirebilirsiniz. Mikrodalga kullanmayın — enzimlere zarar verir.',
          },
          {
            id: 'storage',
            question: 'Saklama koşulları nelerdir?',
            answer:
              'Balı oda sıcaklığında, doğrudan güneş ışığından uzakta, kuru bir yerde saklayın. Buzdolabına koymayın. Arı sütü, polen ve Goldylium bakım ürünleri için etiket üzerindeki saklama talimatını izleyin.',
          },
          {
            id: 'lab',
            question: 'Analiz raporuna nasıl ulaşırım?',
            answer:
              'Yayımladığımız laboratuvar raporları analizler sayfasında PDF olarak yer alır.',
          },
        ],
      },
      {
        id: 'shipping',
        eyebrow: 'Sipariş ve Kargo',
        items: [
          {
            id: 'when',
            question: 'Kargom ne zaman gelir?',
            answer:
              "Hafta içi 14:00'e kadar ödemesi onaylanan siparişler aynı iş günü kargoya verilir. Türkiye içi teslimat tipik olarak 2–4 iş günü sürer.",
          },
          {
            id: 'fee',
            question: 'Kargo ücreti ne kadar?',
            answer:
              'Kargo ücreti ve ücretsiz eşik, Ayarlar → Kargo bölümünden yönetilir; bu sayfa güncel tutarları otomatik yansıtır.',
          },
          {
            id: 'invoice',
            question: 'Faturamı nasıl alırım?',
            answer:
              'Fatura, kargonun içinde veya e-posta ile iletilir. Kurumsal fatura için sipariş notuna unvan, vergi dairesi ve VKN bilgilerinizi ekleyin.',
          },
        ],
      },
      {
        id: 'returns',
        eyebrow: 'İade ve Değişim',
        items: [
          {
            id: 'right',
            question: 'İade hakkım var mı?',
            answer:
              'Teslimden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Açılmış gıda ve hijyen ürünlerinde Yönetmelik gereği cayma hakkı yoktur; hasarlı teslimatta ücretsiz değişim yapılır. Ayrıntı İade & Değişim sayfasındadır.',
          },
          {
            id: 'damage',
            question: 'Ürün bozuk veya hasarlı geldi, ne yapmalıyım?',
            answer:
              'Teslimatta ürünü kontrol edin. Hasar varsa 24 saat içinde destek@drsenol.shop adresine fotoğrafla bildirin. Hasarlı ürünü ücretsiz değiştiririz.',
          },
        ],
      },
    ],
  },
}

function mergeFaq(stored: Partial<FaqPageCopy> | undefined): FaqPageCopy {
  const d = defaultSiteCopy.faq
  if (!stored) return d
  return {
    eyebrow: stored.eyebrow ?? d.eyebrow,
    title: stored.title ?? d.title,
    titleAccent: stored.titleAccent ?? d.titleAccent,
    intro: stored.intro ?? d.intro,
    sections:
      Array.isArray(stored.sections) && stored.sections.length > 0
        ? stored.sections.map((sec, si) => {
            const defSec = d.sections[si] ?? d.sections[0]
            return {
              id: sec.id ?? defSec?.id ?? `sec-${si}`,
              eyebrow: sec.eyebrow ?? defSec?.eyebrow ?? '',
              items:
                Array.isArray(sec.items) && sec.items.length > 0
                  ? sec.items.map((item, ii) => {
                      const id = item.id ?? defSec?.items[ii]?.id ?? `item-${si}-${ii}`
                      const fallback = defSec?.items.find((row) => row.id === id)?.answer
                        ?? defSec?.items[ii]?.answer
                        ?? ''
                      const storedAnswer = item.answer ?? fallback
                      return {
                        id,
                        question: item.question ?? defSec?.items[ii]?.question ?? '',
                        answer: id === 'lab' && /QR/i.test(storedAnswer) ? fallback : storedAnswer,
                      }
                    })
                  : (defSec?.items ?? []),
            }
          })
        : d.sections,
  }
}

export async function getSiteCopy(): Promise<SiteCopy> {
  const stored = await getSiteSetting<Partial<SiteCopy>>(SITE_COPY_KEY)
  return {
    faq: mergeFaq(stored?.faq),
  }
}

export async function setSiteCopy(copy: SiteCopy): Promise<boolean> {
  return setSiteSetting(SITE_COPY_KEY, copy as unknown as Record<string, unknown>)
}
