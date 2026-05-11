'use client'

import { useEffect, useState } from 'react'

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function pad(n: number) { return n.toString().padStart(2, '0') }

function format(d: Date) {
  const day = DAYS[d.getDay()]
  const date = d.getDate()
  const month = MONTHS[d.getMonth()]
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return { day, date, month, time, isSunday: d.getDay() === 0 }
}

export function Clock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) {
    // SSR/hydration: boş placeholder
    return (
      <div className="ad-clock" style={{ width: '180px', height: '20px' }} />
    )
  }

  const { day, date, month, time, isSunday } = format(now)

  return (
    <div
      className="ad-clock"
      style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: isSunday ? 'var(--ad-gold-deep)' : 'var(--ad-fg-muted)',
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: 'var(--ad-fg)' }}>{day}</span>
      <span style={{ color: 'var(--ad-fg-faint)' }}>·</span>
      <span>{date} {month}</span>
      <span style={{ color: 'var(--ad-fg-faint)' }}>·</span>
      <span style={{ color: 'var(--ad-fg)', fontWeight: 500 }}>{time}</span>
    </div>
  )
}
