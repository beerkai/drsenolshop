// ═══════════════════════════════════════════════════════════════
// POST /api/payments/paytr/callback — PayTR asenkron bildirim
// ═══════════════════════════════════════════════════════════════

import { handlePaytrCallback } from '@/lib/paytr-callback'

export async function POST(request: Request) {
  return handlePaytrCallback(request)
}
