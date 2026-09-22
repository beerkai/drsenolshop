// ═══════════════════════════════════════════════════════════════
// Editoryal yer tutucu görseller — admin yükleme slotları
// Stitch (/design-preview/stitch-NN.jpg) varsayılan; yükleme
// products bucket altında editorial/<slot>-<ts>.<ext> yazar.
// ═══════════════════════════════════════════════════════════════

import type { EditorialFeedItem, EditorialImage } from '@/types/editorial-home'
import { getEditorialImageUrl } from '@/lib/images'
import { EDITORIAL_IMAGE_TYPES } from '@/lib/cms/editorial-image-files'
import { defaultHomeContent, type HomeContent } from '@/lib/cms/home-content'

export const EDITORIAL_IMAGE_PREFIX = 'editorial/'

export type EditorialSlotGroup = 'hero' | 'header' | 'journal' | 'instagram' | 'feed' | 'goldylium'

export interface EditorialSlot {
  id: string
  group: EditorialSlotGroup
  groupLabel: string
  label: string
  hint: string
  alt: string
  /** CMS'te duran ham src (stitch path veya editorial/…) */
  src: string
  previewUrl: string
  /** Admin yüklemesi — Stitch yer tutucu değil */
  custom: boolean
}

const GROUP_LABEL: Record<EditorialSlotGroup, string> = {
  hero: 'Kahraman',
  header: 'Üst menü',
  journal: 'Günlük',
  instagram: 'Instagram yedek',
  feed: 'Günlük akış',
  goldylium: 'Goldylium vitrin',
}

export function isUploadedEditorialSrc(src: string | null | undefined): boolean {
  const v = (src ?? '').trim()
  if (!v) return false
  if (v.includes('/design-preview/stitch-')) return false
  if (v.includes('lh3.googleusercontent.com/aida-public/')) return false
  return true
}

export function isEditorialStoragePath(src: string | null | undefined): boolean {
  const v = (src ?? '').trim().replace(/^\/+/, '')
  return v.startsWith(EDITORIAL_IMAGE_PREFIX)
}

function slotBase(group: EditorialSlotGroup, id: string, label: string, hint: string, image: EditorialImage | null): EditorialSlot {
  const src = image?.src ?? ''
  return {
    id,
    group,
    groupLabel: GROUP_LABEL[group],
    label,
    hint,
    alt: image?.alt ?? '',
    src,
    previewUrl: src ? getEditorialImageUrl(src) : '',
    custom: isUploadedEditorialSrc(src),
  }
}

function feedLabel(item: EditorialFeedItem): string | null {
  if (!('image' in item)) return null
  if (item.type === 'atmosphere-square') return item.overlayTitle
  if (item.type === 'square-caption') return item.leftCaption
  return item.title
}

/** Anasayfa ve header'daki yer tutucu görseller, sabit sırada */
export function listEditorialSlots(content: HomeContent): EditorialSlot[] {
  const slots: EditorialSlot[] = [
    slotBase(
      'hero',
      'hero-desktop',
      'Masaüstü kahraman',
      'Anasayfa hero, geniş ekran.',
      content.hero.image,
    ),
    slotBase(
      'hero',
      'hero-mobile',
      'Mobil kahraman',
      'Anasayfa hero, dar ekran. Boşsa masaüstü görseli kullanılır.',
      content.hero.imageMobile ?? null,
    ),
    slotBase(
      'header',
      'header-logo',
      'Logo',
      'Boşken tipografik Dr. Şenol yazısı görünür.',
      content.editorial.header.logo ?? null,
    ),
    slotBase(
      'journal',
      'journal',
      content.editorial.journal.title || 'Günlük görseli',
      'Anasayfadaki günlük bölümünün fotoğrafı.',
      content.editorial.journal.image,
    ),
  ]

  for (const tile of content.editorial.instagram.tiles) {
    slots.push(
      slotBase(
        'instagram',
        `instagram-${tile.id}`,
        tile.image.alt || tile.id,
        'Canlı Instagram akışı yoksa bu kareler görünür.',
        tile.image,
      ),
    )
  }

  for (const item of content.editorial.feed.items) {
    const label = feedLabel(item)
    if (!label || !('image' in item)) continue
    slots.push(
      slotBase(
        'feed',
        `feed-${item.id}`,
        label,
        'Tema editöründe eski günlük akış açıksa anasayfada görünür.',
        item.image,
      ),
    )
  }

  for (const product of content.editorial.goldylium.products) {
    slots.push(
      slotBase(
        'goldylium',
        `goldylium-${product.id}`,
        product.title,
        'Goldylium vitrin bölümü anasayfada kapalı; açılırsa bu görseller kullanılır.',
        product.image,
      ),
    )
  }

  return slots
}

function imageOf(content: HomeContent, slotId: string): EditorialImage | null | undefined {
  if (slotId === 'hero-desktop') return content.hero.image
  if (slotId === 'hero-mobile') return content.hero.imageMobile ?? null
  if (slotId === 'header-logo') return content.editorial.header.logo ?? null
  if (slotId === 'journal') return content.editorial.journal.image

  if (slotId.startsWith('instagram-')) {
    const id = slotId.slice('instagram-'.length)
    return content.editorial.instagram.tiles.find((t) => t.id === id)?.image
  }
  if (slotId.startsWith('feed-')) {
    const id = slotId.slice('feed-'.length)
    const item = content.editorial.feed.items.find((x) => x.id === id)
    return item && 'image' in item ? item.image : undefined
  }
  if (slotId.startsWith('goldylium-')) {
    const id = slotId.slice('goldylium-'.length)
    return content.editorial.goldylium.products.find((p) => p.id === id)?.image
  }
  return undefined
}

export function hasEditorialSlot(content: HomeContent, slotId: string): boolean {
  return imageOf(content, slotId) !== undefined
}

function defaultImage(slotId: string): EditorialImage | null | undefined {
  return imageOf(defaultHomeContent, slotId)
}

/** Slot src'sini değiştirir. Bilinmeyen slotta false. */
export function setEditorialSlotSrc(content: HomeContent, slotId: string, src: string): boolean {
  if (slotId === 'hero-desktop') {
    content.hero.image = { ...content.hero.image, src }
    return true
  }
  if (slotId === 'hero-mobile') {
    const base = content.hero.imageMobile ?? defaultHomeContent.hero.imageMobile
    if (!base) return false
    content.hero.imageMobile = { ...base, src }
    return true
  }
  if (slotId === 'header-logo') {
    content.editorial.header.logo = {
      src,
      alt: content.editorial.header.logo?.alt?.trim() || 'Dr. Şenol',
    }
    return true
  }
  if (slotId === 'journal') {
    content.editorial.journal.image = { ...content.editorial.journal.image, src }
    return true
  }
  if (slotId.startsWith('instagram-')) {
    const id = slotId.slice('instagram-'.length)
    const tile = content.editorial.instagram.tiles.find((t) => t.id === id)
    if (!tile) return false
    tile.image = { ...tile.image, src }
    return true
  }
  if (slotId.startsWith('feed-')) {
    const id = slotId.slice('feed-'.length)
    const item = content.editorial.feed.items.find((x) => x.id === id)
    if (!item || !('image' in item)) return false
    item.image = { ...item.image, src }
    return true
  }
  if (slotId.startsWith('goldylium-')) {
    const id = slotId.slice('goldylium-'.length)
    const product = content.editorial.goldylium.products.find((p) => p.id === id)
    if (!product) return false
    product.image = { ...product.image, src }
    return true
  }
  return false
}

/**
 * Slotu Stitch varsayılanına döndürür.
 * Logo için görseli kaldırır (wordmark).
 * Dönüş: önceki src; slot yoksa null.
 */
export function resetEditorialSlot(content: HomeContent, slotId: string): string | null {
  const current = imageOf(content, slotId)
  if (current === undefined) return null

  if (slotId === 'header-logo') {
    delete content.editorial.header.logo
    return current?.src ?? ''
  }

  const fallback = defaultImage(slotId)
  if (!fallback?.src) return null
  setEditorialSlotSrc(content, slotId, fallback.src)
  return current?.src ?? ''
}

const SLOT_ID_RE = /^[a-z0-9-]+$/

export function isEditorialSlotId(slotId: string): boolean {
  return SLOT_ID_RE.test(slotId) && slotId.length <= 80
}

/** İmzalı yüklemenin yazdığı path bu slota ait mi */
export function isCommittedEditorialPath(slotId: string, path: string): boolean {
  if (!isEditorialSlotId(slotId)) return false
  const exts = Object.values(EDITORIAL_IMAGE_TYPES).join('|')
  const re = new RegExp(`^editorial/${slotId}-\\d+\\.(${exts})$`)
  return re.test(path)
}

export function slotView(content: HomeContent, slotId: string): EditorialSlot | null {
  return listEditorialSlots(content).find((slot) => slot.id === slotId) ?? null
}
