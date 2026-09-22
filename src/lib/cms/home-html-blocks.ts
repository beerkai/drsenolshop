// ═══════════════════════════════════════════════════════════════
// Anasayfa HTML şeritleri — site_settings kaydı
// SUNUCU TARAFI. İstemci sanitizeHomeHtml için home-html.ts kullanır.
// ═══════════════════════════════════════════════════════════════

import { getSiteSetting, setSiteSetting } from '@/lib/site-settings'
import {
  HOME_HTML_BLOCKS_KEY,
  normalizeHomeHtmlBlocks,
  type HomeHtmlBlock,
} from './home-html'

export type { HomeHtmlBlock } from './home-html'

interface StoredHomeHtmlBlocks {
  blocks?: unknown
}

export async function getHomeHtmlBlocks(): Promise<HomeHtmlBlock[]> {
  const stored = await getSiteSetting<StoredHomeHtmlBlocks>(HOME_HTML_BLOCKS_KEY)
  return normalizeHomeHtmlBlocks(stored?.blocks)
}

export async function setHomeHtmlBlocks(blocks: HomeHtmlBlock[]): Promise<boolean> {
  const clean = normalizeHomeHtmlBlocks(blocks)
  return setSiteSetting(HOME_HTML_BLOCKS_KEY, { blocks: clean })
}
