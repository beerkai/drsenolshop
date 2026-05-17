'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Props {
  iconStyle: React.CSSProperties
}

/**
 * Header'da hesap iconu.
 * ─ Giriş yapmamışsa → /giris
 * ─ Giriş yapmışsa → /hesabim, gold nokta gösterir
 * SSR'da tarafsız (her ikisi için aynı icon) ─ hydration sorunu olmaz.
 */
export default function HeaderAccountLink({ iconStyle }: Props) {
  const [authed, setAuthed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = getSupabaseBrowser()
    if (!supabase) return

    let alive = true
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setAuthed(Boolean(data.user))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user))
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const href = authed ? '/hesabim' : '/giris'
  const label = mounted && authed ? 'Hesabım (giriş yapılmış)' : 'Giriş yap / Hesap oluştur'

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="hover:text-gold relative flex items-center text-cream transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center px-1"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={iconStyle}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {mounted && authed && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '8px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#C9A961',
          }}
        />
      )}
    </Link>
  )
}
