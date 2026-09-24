// ═══════════════════════════════════════════════════════════════
// Proxy — session refresh + admin route koruması + host izolasyonu
// ─ Next.js 16'da middleware → proxy oldu (dosya adı + export adı)
// ─ /admin ve /api/admin/* yalnızca ADMIN_HOSTS env'inde tanımlı
//   subdomain'lerden erişilebilir. Diğer host'lardan → ana sayfaya
//   redirect (HTML) veya 404 JSON (API).
// ─ /admin/giris hariç tüm /admin/* için auth + admin_users whitelist.
// ─ i18n: /admin ve /api dışındaki tüm path'ler next-intl middleware'i
//   üzerinden geçer — TR prefix'siz (/koleksiyon → içeride /tr/koleksiyon'a
//   rewrite), EN /en/* prefix'li. Admin/API next-intl'e hiç girmez, her
//   zaman TR (ayrı root layout, bkz. src/app/admin/layout.tsx).
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { getSiteUrl } from '@/lib/site-url'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

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

/** lab.drsenol.shop gibi admin host'larda mağaza + genel API serve edilmez */
function isAdminOnlyHostExempt(pathname: string): boolean {
  if (isAdminPath(pathname)) return true
  if (pathname.startsWith('/_next/')) return true
  if (pathname === '/icon.svg' || pathname === '/favicon.ico') return true
  if (pathname === '/admin-sw.js') return true
  if (pathname === '/admin/manifest.webmanifest') return true
  return false
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const adminHosts = getAdminHosts()
  const host = (request.headers.get('host') ?? '').toLowerCase()

  // ── 0) ADMIN-ONLY HOST → mağaza canonical site'a (drsenol.shop) ─
  // ADMIN_HOSTS'ta tanımlı host'ta /admin dışı istekler vitrine gitmesin
  if (adminHosts && isHostAllowedForAdmin(host, adminHosts) && !isAdminOnlyHostExempt(pathname)) {
    const dest = new URL(pathname + request.nextUrl.search, `${getSiteUrl()}/`)
    return NextResponse.redirect(dest, 308)
  }

  // ── 1) HOST İZOLASYONU ─────────────────────────────────────────
  // /admin ve /api/admin/* yalnızca ADMIN_HOSTS'taki host'lardan
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

  const isAdminOrApi = isAdminPath(pathname) || pathname.startsWith('/api/')

  // ── 2) SUPABASE SESSION REFRESH ────────────────────────────────
  // Cookie yazımları `request`e uygulanır; nihai response'a (i18n
  // rewrite/redirect kararından SONRA) tek seferde taşınır — next-intl'in
  // rewrite hedefini bir NextResponse.next({request}) ile ezmemek için.
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  let pendingCookies: { name: string; value: string; options?: Parameters<NextResponse['cookies']['set']>[2] }[] = []
  let user: { email?: string | null } | null = null

  if (supaUrl && anonKey) {
    const supabase = createServerClient(supaUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          pendingCookies = cookiesToSet
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    user = data.user

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
  }

  // ── 5) i18n ROUTING (yalnızca admin/API dışı) ──────────────────
  const response = isAdminOrApi ? NextResponse.next({ request }) : intlMiddleware(request)

  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
