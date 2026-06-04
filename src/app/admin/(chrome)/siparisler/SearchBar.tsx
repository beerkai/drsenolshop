'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SearchBar({ initial }: { initial: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initial)
  const [pending, startTransition] = useTransition()

  function applySearch(q: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) params.set('q', q.trim())
    else params.delete('q')
    params.delete('page')
    startTransition(() => {
      router.push(`/admin/siparisler${params.toString() ? '?' + params.toString() : ''}`)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    applySearch(value)
  }

  function clear() {
    setValue('')
    applySearch('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px', maxWidth: '520px' }}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Sipariş no, email, telefon veya isim ile ara…"
        className="ad-input"
        style={{ flex: 1, fontSize: '13px' }}
        aria-label="Sipariş ara"
      />
      <button type="submit" className="ad-btn ad-btn-primary" disabled={pending} style={{ fontSize: '11px' }}>
        {pending ? 'Aranıyor…' : 'Ara'}
      </button>
      {initial && (
        <button type="button" onClick={clear} className="ad-btn" style={{ fontSize: '11px' }}>
          Temizle
        </button>
      )}
    </form>
  )
}
