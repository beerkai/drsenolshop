// ═══════════════════════════════════════════════════════════════
// /api/admin/home-content — tema editörü içerik kaydı
// ─ GET  : mevcut içerik (DB → yoksa statik varsayılan)
// ─ POST : tüm içeriği kaydet (site_settings.home_content)
// ─ Yetki: oturum açmış admin (admin_users whitelist'i)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { getHomeContent, setHomeContent, type HomeContent } from '@/lib/cms/home-content'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  const content = await getHomeContent()
  return NextResponse.json({ ok: true, content })
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })

  let body: HomeContent
  try {
    body = (await request.json()) as HomeContent
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !body.editorial || !body.hero) {
    return NextResponse.json(
      { ok: false, message: 'İçerik şekli geçersiz (hero + editorial zorunlu).' },
      { status: 400 }
    )
  }

  const ok = await setHomeContent(body)
  if (!ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Kaydedilemedi. site_settings tablosu veritabanında yoksa supabase/apply/EKSIK_MIGRATIONS.sql dosyasını çalıştırın.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
