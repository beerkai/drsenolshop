-- ═══════════════════════════════════════════════════════════════
-- Dr. Şenol Shop — Şema Snapshot
-- ═══════════════════════════════════════════════════════════════
--
-- Bu dosya CANLI ŞEMANIN snapshot'ıdır, doğru kaynak migration
-- dosyalarıdır (supabase/migrations/). DB değişikliklerini önce
-- migration olarak yaz, Supabase'e uygula, sonra bu dosyayı güncelle.
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
  CREATE TYPE payment_method AS ENUM ('bank_transfer','iyzico','stripe','cash_on_delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- ─── orders (v0.4.0) ─────────────────────────────────────────────
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
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

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

-- ─── RLS politikaları ────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public okuma
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (true);

-- Sipariş: sadece misafir INSERT
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
CREATE POLICY "orders_anon_insert" ON public.orders FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_anon_insert" ON public.order_items;
CREATE POLICY "order_items_anon_insert" ON public.order_items FOR INSERT TO anon WITH CHECK (true);

-- admin_users: anon hiçbir şey yapamaz. Authenticated kendi satırını okur.
DROP POLICY IF EXISTS "admin_users_self_read" ON public.admin_users;
CREATE POLICY "admin_users_self_read" ON public.admin_users
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = email);
