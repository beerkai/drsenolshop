// ═══════════════════════════════════════════════════════════════
// Proxy — session refresh + admin route koruması
// ─ Next.js 16'da middleware → proxy oldu (dosya adı + export adı)
// ─ Tüm /admin/* için auth + admin_users whitelist kontrolü
// ─ /admin/giris hariç (login sayfası serbest)
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
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

  // Session'ı her istekte refresh et (token yakın zamanda dolacaksa yeniler)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Admin route koruması
  if (pathname.startsWith('/admin') && pathname !== '/admin/giris') {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/giris'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin whitelist kontrolü
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

  // ── Giriş sayfasındayken zaten admin ise dashboard'a yönlendir
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
  // Tüm route'larda çalışsın diye geniş matcher; performans için
  // statik asset'ler ve API'leri es geç
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
