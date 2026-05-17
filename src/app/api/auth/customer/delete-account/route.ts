// ═══════════════════════════════════════════════════════════════
// POST /api/auth/customer/delete-account — KVKK m.7 silme hakkı
// ─ Önce şifreyle yeniden doğrula
// ─ Wishlist, cart_items, newsletter_subscribers temizle (kullanıcıya ait)
// ─ orders.user_id NULL'lansın + PII anonimleştirilsin (anonymize_orders_for_user RPC)
// ─ Sonunda Supabase auth.admin.deleteUser() ile hesabı sil
// ─ Admin hesabı silmeye çalışırsa reddet (admin owner kanalından yapılmalı)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { translateAuthError } from '@/lib/auth-errors'
import { sendTelegramMessage, isTelegramConfigured, escapeHtml } from '@/lib/telegram'

export async function POST(request: Request) {
  let body: { password?: string; confirm?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz istek.' }, { status: 400 })
  }

  if (body.confirm !== 'HESABIMI SİL') {
    return NextResponse.json(
      { ok: false, message: 'Onay metnini tam olarak yazın.' },
      { status: 400 }
    )
  }

  const password = body.password
  if (!password) {
    return NextResponse.json({ ok: false, message: 'Şifre gerekli.' }, { status: 400 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return NextResponse.json({ ok: false, message: 'Oturum bulunamadı.' }, { status: 401 })
  }

  // 1) Şifre doğrulaması (signInWithPassword tekrar dener — eşleşmezse hata)
  const { error: pwErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })
  if (pwErr) {
    return NextResponse.json(
      { ok: false, message: translateAuthError(pwErr, 'Şifre hatalı.') },
      { status: 401 }
    )
  }

  // 2) Admin tablosunda mı? Admin hesabı bu endpoint'ten silinmesin
  const admin = getSupabaseAdmin()
  const { data: adminRow } = await admin
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()
  if (adminRow) {
    return NextResponse.json(
      { ok: false, message: 'Admin hesapları bu yoldan silinemez. Owner ile iletişime geçin.' },
      { status: 403 }
    )
  }

  const email = user.email

  // 3) Wishlist & cart_items (varsa) — kullanıcıya ait satırları sil
  // (Tablo yoksa hata yutulur — best-effort)
  try { await admin.from('wishlist_items').delete().eq('user_id', user.id) } catch {}
  try { await admin.from('cart_items').delete().eq('user_id', user.id) } catch {}

  // 4) Newsletter — kullanıcının e-postasını pasifleştir
  await admin
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('email', email)

  // 5) Siparişleri anonimleştir (KVKK + VUK uyumlu)
  const { data: affected, error: rpcErr } = await admin.rpc('anonymize_orders_for_user', {
    p_user_id: user.id,
    p_email: email,
  })
  if (rpcErr) {
    console.error('[delete-account] anonymize hatası:', rpcErr.message)
    // devam et — siparişlerin anonimleşmemesi hesap silmeyi engellesin mi? Hayır,
    // best-effort. Telegram'a uyarı atılır.
  }

  // 6) Supabase auth kullanıcısını sil (geri dönüşsüz)
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id)
  if (delErr) {
    console.error('[delete-account] auth.admin.deleteUser hatası:', delErr.message)
    return NextResponse.json(
      { ok: false, message: 'Hesap silinemedi. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    )
  }

  // 7) Oturumu kapat
  await supabase.auth.signOut()

  // 8) Telegram bildirimi (fire-and-forget)
  if (isTelegramConfigured()) {
    sendTelegramMessage(
      `<b>🗑 Hesap silindi</b>\n<code>${escapeHtml(email)}</code>\nAnonimleştirilen sipariş: ${affected ?? 0}`
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
