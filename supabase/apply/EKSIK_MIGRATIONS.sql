-- ═══════════════════════════════════════════════════════════════════════
-- DR. ŞENOL — CANLI VERİTABANINDA EKSİK OLAN MIGRATION'LAR
-- ═══════════════════════════════════════════════════════════════════════
--
-- NASIL UYGULANIR:
--   Supabase Dashboard → SQL Editor → New query → bu dosyanın TAMAMINI
--   yapıştır → Run.
--
-- Tamamı idempotent (IF NOT EXISTS / DROP-CREATE): birden fazla kez
-- çalıştırmak güvenlidir, mevcut veriyi bozmaz.
--
-- NEDEN GEREKLİ — bu tablolar olmadan sessizce çalışmayan özellikler:
--   site_settings          → banka bilgileri, kargo ayarları, Havale
--                            aç/kapat switch'i, TEMA EDİTÖRÜ
--   product_reviews        → ürün yorumları
--   coupons                → indirim kuponları
--   newsletter_subscribers → bülten kaydı
--   customer_notes         → admin müşteri notları
--   daily_logs             → admin günlük defteri
--   0018                   → ürün sıralaması (display_order)
-- ═══════════════════════════════════════════════════════════════════════


-- ── Ön koşul: updated_at trigger fonksiyonu (0001'de tanımlı; paketi
--    kendi kendine yeterli kılmak için burada da garantiye alınır) ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════
-- 0004_daily_logs.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0004_daily_logs.sql — Patron günlük not + özelleştirilebilir metrik
-- ═══════════════════════════════════════════════════════════════
--
-- Her admin için, her gün için tek kayıt (UNIQUE log_date + author_email).
-- notes = serbest metin, metrics = key/value JSONB (kovan skoru, hedef vb.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS log_date DATE;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- (author_email, log_date) UNIQUE — upsert için anahtar
DO $$ BEGIN
  ALTER TABLE public.daily_logs
    ADD CONSTRAINT daily_logs_author_date_key UNIQUE (author_email, log_date);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS daily_logs_log_date_idx ON public.daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS daily_logs_author_idx ON public.daily_logs(author_email);

-- updated_at trigger (set_updated_at fonksiyonu 0001'de tanımlandı)
DROP TRIGGER IF EXISTS daily_logs_set_updated_at ON public.daily_logs;
CREATE TRIGGER daily_logs_set_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — sadece service_role API üzerinden erişim. Anon hiçbir şey yapamaz.
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
-- Policy YOK.


-- ═══════════════════════════════════════════════════════════════
-- 0006_site_settings.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0006_site_settings.sql — Site-geneli ayarlar (key/value JSONB)
-- ═══════════════════════════════════════════════════════════════
--
-- Örnek key'ler:
--   bank_info       : { bank_name, account_holder, iban }
--   site_notice     : { title, message, level }
--
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Banka bilgileri gibi public okunabilir ayarlar için anon SELECT açık:
-- Hassas key'ler eklenirse o key'lere özel policy yazılır.
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);


-- ═══════════════════════════════════════════════════════════════
-- 0010_newsletter.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0010_newsletter.sql — Newsletter aboneleri
-- ═══════════════════════════════════════════════════════════════
--
-- Footer'daki "hasat bildirimi" formundan toplanan e-postalar.
-- Email unique — aynı e-postayı iki kez ekleme.
-- KVKK: pazarlama izni ayrıca consent_at ile saklanır.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,                                        -- footer, popup, checkout vb.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,            -- unsubscribe edilirse false
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),      -- KVKK pazarlama izni anı
  unsubscribed_at TIMESTAMPTZ,
  ip_address TEXT,                                    -- KVKK iz kaydı (opsiyonel)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS newsletter_email_idx ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_active_idx ON public.newsletter_subscribers(is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS newsletter_set_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_set_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anon INSERT açık (form submit) — tek email/saat rate-limit yok, ileride eklenebilir.
-- Idempotency: ON CONFLICT DO NOTHING ile API tarafında yönetilir.
DROP POLICY IF EXISTS "newsletter_anon_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_anon_insert" ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- SELECT kapalı (anon listeyi göremesin). Admin service_role ile okur.


-- ═══════════════════════════════════════════════════════════════
-- 0012_product_reviews.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0012_product_reviews.sql — Ürün yorumları + puanlama
-- ═══════════════════════════════════════════════════════════════
--
-- Akış:
--   * Logged-in müşteri yorum bırakır → is_approved = FALSE
--   * Admin /admin/yorumlar sayfasından onaylar → is_approved = TRUE
--   * Ürün sayfası yalnız is_approved = TRUE yorumları gösterir
--   * Her kullanıcı bir ürün için yalnız 1 aktif yorum (unique constraint)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,                                        -- auth.users.id (nullable: misafir izin verilmiyor şu an)
  customer_email TEXT NOT NULL,                        -- denormalize: kullanıcı silinse de yorum kalsın
  customer_name TEXT,                                  -- denormalize görünür isim
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE, -- siparişi geçmişten doğrulanmışsa
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS product_reviews_product_idx ON public.product_reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS product_reviews_user_idx ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS product_reviews_pending_idx ON public.product_reviews(created_at) WHERE is_approved = FALSE;

-- Kullanıcı başına ürün başına tek aktif yorum (user_id NULL ise email ile)
CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_user_product_uidx
  ON public.product_reviews(product_id, user_id)
  WHERE user_id IS NOT NULL;

DROP TRIGGER IF EXISTS product_reviews_set_updated_at ON public.product_reviews;
CREATE TRIGGER product_reviews_set_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- ─── Policy: onaylı yorumlar herkese açık ────────────────────────
DROP POLICY IF EXISTS "product_reviews_public_read" ON public.product_reviews;
CREATE POLICY "product_reviews_public_read" ON public.product_reviews
  FOR SELECT
  USING (is_approved = TRUE);

-- ─── Policy: kullanıcı kendi yorumunu okuyabilir (onay bekleyen) ─
DROP POLICY IF EXISTS "product_reviews_owner_read" ON public.product_reviews;
CREATE POLICY "product_reviews_owner_read" ON public.product_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ─── Policy: authenticated kullanıcı kendi adına insert ──────────
DROP POLICY IF EXISTS "product_reviews_owner_insert" ON public.product_reviews;
CREATE POLICY "product_reviews_owner_insert" ON public.product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE/DELETE: yalnız service_role (admin) — owner edit ileride eklenebilir

-- ─── Helper view: onaylı yorum istatistikleri ────────────────────
CREATE OR REPLACE VIEW public.product_review_stats AS
SELECT
  product_id,
  COUNT(*)::INT       AS review_count,
  AVG(rating)::FLOAT  AS avg_rating,
  COUNT(*) FILTER (WHERE rating = 5)::INT AS count_5,
  COUNT(*) FILTER (WHERE rating = 4)::INT AS count_4,
  COUNT(*) FILTER (WHERE rating = 3)::INT AS count_3,
  COUNT(*) FILTER (WHERE rating = 2)::INT AS count_2,
  COUNT(*) FILTER (WHERE rating = 1)::INT AS count_1
FROM public.product_reviews
WHERE is_approved = TRUE
GROUP BY product_id;

GRANT SELECT ON public.product_review_stats TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════
-- 0013_coupons.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0013_coupons.sql — İndirim kuponları
-- ═══════════════════════════════════════════════════════════════
--
-- Yapılandırma:
--   * code          → unique kupon kodu (büyük harfle saklanır)
--   * discount_type → 'percent' veya 'fixed'
--   * discount_value→ yüzde için 0-100, fixed için TL
--   * min_subtotal  → bu tutarın altındaki sepetlerde geçersiz (0 = sınır yok)
--   * max_uses      → toplam kullanım limiti (0 = sınırsız)
--   * used_count    → atomik artırma; orders.notes'a kupon yansıtılır
--   * valid_from / valid_until → tarih aralığı (NULL = sınır yok)
--   * is_active     → admin manuel kapama
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
  min_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 0,        -- 0 = sınırsız
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons(code);

DROP TRIGGER IF EXISTS coupons_set_updated_at ON public.coupons;
CREATE TRIGGER coupons_set_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- SELECT yalnız service_role (admin). Anon kupon kodu listesi göremez —
-- sadece doğrulamayla erişebilir.

-- ─── Atomik kupon kullanımı için RPC ─────────────────────────────
CREATE OR REPLACE FUNCTION public.consume_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  discount NUMERIC := 0;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE code = UPPER(p_code) FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Geçersiz kupon kodu.');
  END IF;
  IF NOT c.is_active THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INACTIVE', 'message', 'Bu kupon kullanımda değil.');
  END IF;
  IF c.valid_from IS NOT NULL AND NOW() < c.valid_from THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_YET', 'message', 'Kupon henüz aktif değil.');
  END IF;
  IF c.valid_until IS NOT NULL AND NOW() > c.valid_until THEN
    RETURN jsonb_build_object('ok', false, 'code', 'EXPIRED', 'message', 'Kuponun süresi dolmuş.');
  END IF;
  IF c.max_uses > 0 AND c.used_count >= c.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'code', 'EXHAUSTED', 'message', 'Kupon kullanım kotası dolmuş.');
  END IF;
  IF p_subtotal < c.min_subtotal THEN
    RETURN jsonb_build_object('ok', false, 'code', 'MIN_SUBTOTAL',
      'message', 'Bu kupon için minimum sepet tutarı: ' || c.min_subtotal::TEXT || ' TL.');
  END IF;

  IF c.discount_type = 'percent' THEN
    discount := ROUND(p_subtotal * c.discount_value / 100, 2);
  ELSE
    discount := LEAST(c.discount_value, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'discount', discount,
    'code', c.code,
    'discount_type', c.discount_type,
    'discount_value', c.discount_value
  );
END;
$$;

-- Atomik kullanım sayacını artıran ayrı RPC (sipariş başarıyla kaydedildiğinde çağrılır)
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons SET used_count = used_count + 1 WHERE code = UPPER(p_code);
$$;

REVOKE ALL ON FUNCTION public.consume_coupon(TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_coupon(TEXT, NUMERIC) TO service_role;

REVOKE ALL ON FUNCTION public.increment_coupon_usage(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO service_role;


-- ═══════════════════════════════════════════════════════════════
-- 0015_customer_notes.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0015_customer_notes.sql — Müşteri başına admin notları
-- ═══════════════════════════════════════════════════════════════
--
-- Email tabanlı: müşteri hesabı sonradan oluşturulsa bile (veya silinse)
-- not orada kalır. Admin görüntüler, müşteri görmez.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  admin_email TEXT,                     -- not bırakan admin'in email'i (denormalize)
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_notes_email_idx ON public.customer_notes(customer_email, created_at DESC);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
-- Yalnız service_role erişebilir; policy YOK (default deny).


-- ═══════════════════════════════════════════════════════════════
-- 0018_admin_content.sql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 0018_admin_content.sql — Tema editörü + ürün sıralaması
-- ═══════════════════════════════════════════════════════════════
--
-- 1) products.display_order  : admin panelinden manuel sıralama
-- 2) site_settings 'home_content' : tema editörünün yazdığı anasayfa
--    içeriği (JSONB). Kayıt yoksa uygulama statik varsayılana düşer.
--
-- Idempotent: tekrar çalıştırılabilir.
-- ═══════════════════════════════════════════════════════════════

-- ── 1) Ürün sıralaması ──────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Sıralama + aktiflik birlikte filtrelendiği için bileşik index
CREATE INDEX IF NOT EXISTS products_display_order_idx
  ON public.products(display_order NULLS LAST, created_at DESC);

-- Mevcut ürünlere başlangıç sırası ver (yalnızca NULL olanlara).
-- created_at sırasını koruyarak 10'ar artan değer atar; araya ürün
-- eklemek için boşluk bırakır.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) * 10 AS rn
  FROM public.products
  WHERE display_order IS NULL
)
UPDATE public.products p
SET display_order = o.rn
FROM ordered o
WHERE p.id = o.id;

-- ── 2) Tema editörü içerik anahtarı ─────────────────────────────
-- Boş kayıt açmıyoruz: satır yoksa uygulama statik varsayılanı
-- kullanır. Admin ilk kaydettiğinde upsert ile oluşur.

COMMENT ON COLUMN public.products.display_order IS
  'Admin panelinden manuel sıralama. NULL ise created_at DESC sırası.';

