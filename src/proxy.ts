// ═══════════════════════════════════════════════════════════════
// Proxy — session refresh + admin route koruması + host izolasyonu
// ─ Next.js 16'da middleware → proxy oldu (dosya adı + export adı)
// ─ /admin ve /api/admin/* yalnızca ADMIN_HOSTS env'inde tanımlı
//   subdomain'lerden erişilebilir. Diğer host'lardan → ana sayfaya
//   redirect (HTML) veya 404 JSON (API).
// ─ /admin/giris hariç tüm /admin/* için auth + admin_users whitelist.
// ─ i18n: /en/* isteklerini prefix'siz path'e rewrite edip
//   `x-locale: en` header'ı ekler (src/lib/i18n/locale.ts okur).
//   TR prefix'siz kalır (varsayılan). /admin ve /api locale'den
//   muaf — admin panel her zaman TR.
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'
import type { Locale } from '@/lib/i18n/types'

interface LocaleResolution {
  locale: Locale
  /** /en prefix'i strip edilmiş, gerçekte render edilecek path */
  effectivePathname: string
}

/**
 * /en veya /en/* → locale 'en' + prefix'siz path. Admin ve API path'leri
 * KESİNLİKLE rewrite edilmez — aksi halde /en/admin/... gibi bir istek
 * host-izolasyon kontrolünü (aşağıdaki adım 0/1, orijinal `pathname`
 * üzerinden çalışır) atlayıp gerçek /admin/... rotasına sızabilir.
 */
function resolveLocale(pathname: string): LocaleResolution {
  const stripped = pathname === '/en' ? '/' : pathname.startsWith('/en/') ? pathname.slice('/en'.length) : null
  if (stripped === null) return { locale: 'tr', effectivePathname: pathname }
  if (isAdminPath(stripped) || stripped.startsWith('/api/')) return { locale: 'tr', effectivePathname: pathname }
  return { locale: 'en', effectivePathname: stripped }
}

/** Locale header'ını taşıyan response — gerekiyorsa prefix'siz path'e rewrite eder */
function localeResponse(request: NextRequest, resolution: LocaleResolution): NextResponse {
  const headers = new Headers(request.headers)
  headers.set('x-locale', resolution.locale)
  if (resolution.effectivePathname !== request.nextUrl.pathname) {
    const url = request.nextUrl.clone()
    url.pathname = resolution.effectivePathname
    return NextResponse.rewrite(url, { request: { headers } })
  }
  return NextResponse.next({ request: { headers } })
}

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

  // ── 2) i18n: /en/* PREFİX ÇÖZÜMLEME ────────────────────────────
  const localeResolution = resolveLocale(pathname)

  // ── 3) SUPABASE SESSION REFRESH ────────────────────────────────
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supaUrl || !anonKey) return localeResponse(request, localeResolution)

  let response = localeResponse(request, localeResolution)

  const supabase = createServerClient(supaUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = localeResponse(request, localeResolution)
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // ── 4) ADMIN AUTH KORUMASI ─────────────────────────────────────
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

  // ── 5) GİRİŞ SAYFASINDA YETKİLİ KULLANICI → PANO ────────────────
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
