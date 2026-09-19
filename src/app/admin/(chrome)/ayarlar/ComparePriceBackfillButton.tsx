'use client'

import { useState } from 'react'
import { toast } from '@/components/admin/toast/toast'

export default function ComparePriceBackfillButton() {
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pricing/backfill-compare', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Backfill başarısız.')
        return
      }
      toast.success(`Compare fiyat güncellendi (${data.updated ?? 0} kayıt).`)
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" className="ad-btn ad-btn-secondary" onClick={run} disabled={loading}>
      {loading ? 'Çalışıyor…' : 'Compare fiyat backfill çalıştır'}
    </button>
  )
}
