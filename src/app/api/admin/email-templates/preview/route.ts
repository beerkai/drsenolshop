// GET /api/admin/email-templates/preview?id=... — HTML önizleme (admin)
// GET format=json — subject + html JSON (kopyala paneli)

import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { renderEmailTemplateForApi } from '@/lib/email-template-catalog'

export async function GET(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, message: 'Yetkisiz' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')?.trim()
  if (!id) {
    return NextResponse.json({ ok: false, message: 'id gerekli' }, { status: 400 })
  }

  const rendered = await renderEmailTemplateForApi(id)
  if (!rendered) {
    return NextResponse.json({ ok: false, message: 'Şablon bulunamadı' }, { status: 404 })
  }

  const format = searchParams.get('format')
  if (format === 'json') {
    return NextResponse.json({
      ok: true,
      id: rendered.id,
      subject: rendered.subject,
      html: rendered.html,
      definition: rendered.definition,
    })
  }

  return new NextResponse(rendered.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  })
}
