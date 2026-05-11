// ═══════════════════════════════════════════════════════════════
// Proxy — session refresh + admin route koruması + host izolasyonu
// ─ Next.js 16'da middleware → proxy oldu (dosya adı + export adı)
// ─ /admin ve /api/admin/* yalnızca ADMIN_HOSTS env'inde tanımlı
//   subdomain'lerden erişilebilir. Diğer host'lardan → ana sayfaya
//   redirect (HTML) veya 404 JSON (API).
// ─ /admin/giris hariç tüm /admin/* için auth + admin_users whitelist.
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** ADMIN_HOSTS env'inden virgüllü liste — undefined ise kısıt yok (dev için) */
function getAdminHosts(): Set<string> | null {
  const raw = process.env.ADMIN_HOSTS?.trim()
  if (!raw) return null
  const set = new Set(
    raw
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  )
  return set.size > 0 ? set : null
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/api/admin' ||
    pathname.startsWith('/api/admin/')
}

function isHostAllowedForAdmin(host: string, allowed: Set<string> | null): boolean {
  if (!allowed) return true // env yoksa kısıt yok
  return allowed.has(host.toLowerCase())
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── 1) HOST İZOLASYONU ─────────────────────────────────────────
  // /admin ve /api/admin/* yalnızca ADMIN_HOSTS'taki host'lardan
  const adminHosts = getAdminHosts()
  const host = (request.headers.get('host') ?? '').toLowerCase()

  if (isAdminPath(pathname) && !isHostAllowedForAdmin(host, adminHosts)) {
    // API çağrısı → 404 JSON (sızdırma yapma)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    // HTML sayfa → ana sayfaya redirect (sessizce yönlendir)
    const home = request.nextUrl.clone()
    home.pathname = '/'
    home.search = ''
    return NextResponse.redirect(home)
  }

  // ── 2) SUPABASE SESSION REFRESH ────────────────────────────────
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supaUrl || !anonKey) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supaUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // ── 3) ADMIN AUTH KORUMASI ─────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/giris') {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/giris'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('id, is_active, role')
      .eq('email', user.email ?? '')
      .maybeSingle()

    if (!admin || admin.is_active === false) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/giris'
      loginUrl.searchParams.set('error', 'yetki_yok')
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 4) GİRİŞ SAYFASINDA YETKİLİ KULLANICI → PANO ────────────────
  if (pathname === '/admin/giris' && user) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email ?? '')
      .maybeSingle()
    if (admin) {
      const dashUrl = request.nextUrl.clone()
      dashUrl.pathname = '/admin'
      dashUrl.search = ''
      return NextResponse.redirect(dashUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
