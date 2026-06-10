-- ═══════════════════════════════════════════════════════════════
-- Dr. Şenol Shop — Şema Snapshot
-- ═══════════════════════════════════════════════════════════════
--
-- Bu dosya CANLI ŞEMANIN snapshot'ıdır, doğru kaynak migration
-- dosyalarıdır (supabase/migrations/). DB değişikliklerini önce
-- migration olarak yaz, Supabase'e uygula, sonra bu dosyayı güncelle.
--
-- Migrationlar: 0001..0017 (uygulanmış sırasıyla)
--   0001 orders/order_items + ENUM + stok decrement RPC
--   0002 admin_users + RLS
--   0003 admin_users_self_read policy
--   0004 daily_logs
--   0005 ledger (employees + ledger_entries)
--   0006 site_settings (key/value)
--   0007 ledger plaka CHECK gevşetildi
--   0008 customer_auth — orders/order_items owner_read policy
--   0009 payment_method enum'a 'paytr'
--   0010 newsletter_subscribers
--   0011 anonymize_orders_for_user RPC (KVKK silme)
--   0012 product_reviews + review_stats view
--   0013 coupons + consume_coupon / increment_coupon_usage RPC
--   0014 orders.reminded_at, reminder_count (ödeme hatırlatma cron)
--   0015 customer_notes
--   0016 orders.paytr_response, paid_at, payment_ref index
--   0017 orders.stock_decremented_at, coupon_code, coupon_consumed_at
--        + increment_variant_stock / increment_product_stock RPC
--
-- ═══════════════════════════════════════════════════════════════

-- ─── Yardımcı fonksiyon ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ─── ENUM tipleri ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','paid','preparing','shipped','delivered','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('bank_transfer','iyzico','stripe','cash_on_delivery','paytr');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- 0009: paytr eklendi (ALTER TYPE ADD VALUE IF NOT EXISTS)

-- ─── categories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── products ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  -- ikas legacy
  ikas_id TEXT UNIQUE,
  description TEXT,
  metadata_title TEXT,
  metadata_description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  badge TEXT,
  default_variant_label TEXT,
  compare_price NUMERIC,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[],

  -- v0.2.0
  brand TEXT,
  short_desc TEXT,
  long_desc TEXT,
  base_price NUMERIC,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  sku TEXT,
  barcode TEXT,
  weight_grams NUMERIC,
  image_url TEXT,
  is_new BOOLEAN,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER,
  lab_report_url TEXT,
  lot_number TEXT,
  harvest_date DATE,
  origin_location TEXT,
  certifications TEXT[],
  lab_values JSONB,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  sale_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── product_variants ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,

  ikas_variant_id TEXT UNIQUE,
  variant_type TEXT,
  variant_value TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  stock INTEGER DEFAULT 0,

  sku TEXT,
  label TEXT,
  compare_price NUMERIC,
  weight_grams NUMERIC,
  volume_ml NUMERIC,
  stock_quantity INTEGER,
  is_default BOOLEAN,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── orders (v0.4.0 + sonraki migrationlar) ──────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending',
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_name TEXT NOT NULL,
  user_id UUID,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT DEFAULT 'standard',
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_ref TEXT,
  -- 0016
  paytr_response JSONB,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  tracking_number TEXT,
  -- 0014
  reminded_at TIMESTAMPTZ,
  reminder_count INT NOT NULL DEFAULT 0,
  -- 0017
  stock_decremented_at TIMESTAMPTZ,
  coupon_code TEXT,
  coupon_consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_payment_ref_idx ON public.orders(payment_ref);
CREATE INDEX IF NOT EXISTS orders_pending_reminder_idx
  ON public.orders(created_at)
  WHERE status = 'pending' AND payment_status = 'pending';
CREATE INDEX IF NOT EXISTS orders_stock_decremented_at_idx
  ON public.orders(stock_decremented_at)
  WHERE stock_decremented_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_coupon_code_idx
  ON public.orders(coupon_code)
  WHERE coupon_code IS NOT NULL;

-- ─── order_items (v0.4.0) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT,
  sku TEXT,
  product_slug TEXT,
  product_image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── daily_logs (v0.4.0) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE NOT NULL,
  author_email TEXT NOT NULL,
  notes TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT daily_logs_author_date_key UNIQUE (author_email, log_date)
);

-- ─── admin_users (v0.4.0) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── employees (0005) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  role TEXT DEFAULT 'satış',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── ledger_entries (0005 + 0007) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE,
  entry_time TIME,
  plate TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash','card')),
  sale_amount NUMERIC(10,2) DEFAULT 0,
  has_guide BOOLEAN DEFAULT false,
  guide_commission NUMERIC(10,2),
  customer_paid BOOLEAN DEFAULT false,
  guide_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  -- 0007: gevşetilmiş plaka formatı
  CONSTRAINT ledger_entries_plate_format_check
    CHECK (plate ~ '^([0-9]{2}[A-Z]{1,3}[0-9]{1,4}|[A-Z][A-Z0-9]*(-[A-Z0-9]+)*)$')
);

-- ─── site_settings (0006) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ─── newsletter_subscribers (0010) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS newsletter_email_idx ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_active_idx
  ON public.newsletter_subscribers(is_active) WHERE is_active = TRUE;

-- ─── product_reviews (0012) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS product_reviews_product_idx ON public.product_reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS product_reviews_user_idx ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS product_reviews_pending_idx ON public.product_reviews(created_at) WHERE is_approved = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_user_product_uidx
  ON public.product_reviews(product_id, user_id)
  WHERE user_id IS NOT NULL;

-- Onaylı yorum istatistikleri view'i
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

-- ─── coupons (0013) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
  min_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons(code);

-- ─── customer_notes (0015) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  admin_email TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_notes_email_idx ON public.customer_notes(customer_email, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- RPC fonksiyonları
-- ═══════════════════════════════════════════════════════════════

-- 0001: stok düşürme
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE new_stock INTEGER;
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = COALESCE(stock_quantity, 0) - p_quantity
  WHERE id = p_variant_id AND COALESCE(stock_quantity, 0) >= p_quantity
  RETURNING stock_quantity INTO new_stock;
  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Yetersiz stok: variant_id=%, istenen=%', p_variant_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET stock_quantity = COALESCE(stock_quantity, 0) - p_quantity
  WHERE id = p_product_id AND COALESCE(stock_quantity, 0) >= p_quantity
  RETURNING stock_quantity INTO new_stock;
  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Yetersiz ürün stoğu: product_id=%, istenen=%', p_product_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 0017: stok iade
CREATE OR REPLACE FUNCTION public.increment_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE new_stock INTEGER;
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO new_stock;
  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Varyant bulunamadı: variant_id=%', p_variant_id USING ERRCODE = 'P0001';
  END IF;
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity
  WHERE id = p_product_id
  RETURNING stock_quantity INTO new_stock;
  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Ürün bulunamadı: product_id=%', p_product_id USING ERRCODE = 'P0001';
  END IF;
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.increment_variant_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_variant_stock(UUID, INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.increment_product_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INTEGER) TO service_role;

-- 0011: KVKK — sipariş anonimleştirme
CREATE OR REPLACE FUNCTION public.anonymize_orders_for_user(p_user_id UUID, p_email TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE affected INT := 0;
BEGIN
  UPDATE public.orders
  SET
    customer_email = 'deleted+' || substr(md5(coalesce(customer_email, '')), 1, 8) || '@deleted.local',
    customer_name = 'Silinmiş Hesap',
    customer_phone = NULL,
    user_id = NULL,
    shipping_address = '{}'::jsonb,
    billing_address = NULL,
    notes = COALESCE(notes, '') || ' [hesap silindi: ' || to_char(NOW(), 'YYYY-MM-DD') || ']'
  WHERE
    (p_user_id IS NOT NULL AND user_id = p_user_id)
    OR (p_email IS NOT NULL AND LOWER(customer_email) = LOWER(p_email));
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
REVOKE ALL ON FUNCTION public.anonymize_orders_for_user(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_orders_for_user(UUID, TEXT) TO service_role;

-- 0013: kupon tüketimi (atomic) + sayaç artırma
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
  RETURN jsonb_build_object('ok', true, 'discount', discount, 'code', c.code,
    'discount_type', c.discount_type, 'discount_value', c.discount_value);
END;
$$;

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
-- Trigger'lar
-- ═══════════════════════════════════════════════════════════════

-- updated_at trigger'ları (her tablo için)
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS daily_logs_set_updated_at ON public.daily_logs;
CREATE TRIGGER daily_logs_set_updated_at BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS employees_set_updated_at ON public.employees;
CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS ledger_entries_set_updated_at ON public.ledger_entries;
CREATE TRIGGER ledger_entries_set_updated_at BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS newsletter_set_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_set_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS product_reviews_set_updated_at ON public.product_reviews;
CREATE TRIGGER product_reviews_set_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS coupons_set_updated_at ON public.coupons;
CREATE TRIGGER coupons_set_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 0001: order_number üretim trigger'ı
CREATE SEQUENCE IF NOT EXISTS orders_yearly_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE year_str TEXT; seq_val INTEGER;
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    year_str := TO_CHAR(NEW.created_at, 'YYYY');
    seq_val := nextval('orders_yearly_seq');
    NEW.order_number := 'DS-' || year_str || '-' || LPAD(seq_val::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_generate_number ON public.orders;
CREATE TRIGGER orders_generate_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ═══════════════════════════════════════════════════════════════
-- RLS politikaları
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Public okuma
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (true);

-- 0006: site_settings — anon SELECT açık (banka bilgisi gibi public veriler)
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (true);

-- Sipariş: misafir INSERT
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
CREATE POLICY "orders_anon_insert" ON public.orders FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_anon_insert" ON public.order_items;
CREATE POLICY "order_items_anon_insert" ON public.order_items FOR INSERT TO anon WITH CHECK (true);

-- 0008: authenticated user kendi siparişini okusun
DROP POLICY IF EXISTS "orders_owner_read" ON public.orders;
CREATE POLICY "orders_owner_read" ON public.orders
  FOR SELECT TO authenticated
  USING (
    LOWER(customer_email) = LOWER(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "order_items_owner_read" ON public.order_items;
CREATE POLICY "order_items_owner_read" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE LOWER(customer_email) = LOWER(COALESCE((auth.jwt() ->> 'email')::text, ''))
         OR user_id = auth.uid()
    )
  );

-- 0003: admin_users self read
DROP POLICY IF EXISTS "admin_users_self_read" ON public.admin_users;
CREATE POLICY "admin_users_self_read" ON public.admin_users
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = email);

-- daily_logs: yalnız service_role (policy yok)
-- employees / ledger_entries: yalnız service_role (policy yok)
-- coupons: yalnız service_role (policy yok)
-- customer_notes: yalnız service_role (policy yok)

-- 0010: newsletter — anon/authenticated INSERT açık
DROP POLICY IF EXISTS "newsletter_anon_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_anon_insert" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- 0012: product_reviews
DROP POLICY IF EXISTS "product_reviews_public_read" ON public.product_reviews;
CREATE POLICY "product_reviews_public_read" ON public.product_reviews
  FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "product_reviews_owner_read" ON public.product_reviews;
CREATE POLICY "product_reviews_owner_read" ON public.product_reviews
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "product_reviews_owner_insert" ON public.product_reviews;
CREATE POLICY "product_reviews_owner_insert" ON public.product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
