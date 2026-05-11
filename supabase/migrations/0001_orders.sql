-- ═══════════════════════════════════════════════════════════════
-- 0001_orders.sql — Sipariş sistemi: orders + order_items
-- ═══════════════════════════════════════════════════════════════
--
-- v0.4.0 — Checkout / Sipariş akışı temeli
--
-- Bu migration TAM IDEMPOTENT:
--  * Önce ENUM tipleri (zaten varsa atla)
--  * Tablo yoksa minimal iskeletiyle oluştur
--  * Her kolon ALTER ADD COLUMN IF NOT EXISTS ile garantile
--    → Mevcut tabloda eksik kolonlar otomatik eklenir
--  * Constraint'ler DO $$ ile duplicate-safe
--  * Index'ler IF NOT EXISTS
--
-- Açıklama: Eski şemada (eğer önceden test orders tablosu varsa) eksik
-- kolonlar bu migration'da otomatik eklenir. Veri kaybı OLMAZ.
--
-- ═══════════════════════════════════════════════════════════════

-- ─── updated_at trigger fonksiyonu ───────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── ENUM tipleri ───────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending','paid','preparing','shipped','delivered','cancelled','refunded'
  );
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending','authorized','captured','failed','refunded'
  );
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'bank_transfer','iyzico','stripe','cash_on_delivery'
  );
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════
-- orders tablosu
-- ═══════════════════════════════════════════════════════════════

-- Minimal iskelet (yoksa oluştur)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tüm kolonları idempotent şekilde garantile
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status order_status DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'standard';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method payment_method DEFAULT 'bank_transfer';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_ref TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Default ve NOT NULL kısıtları (varsa atla)
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.orders ALTER COLUMN shipping_cost SET DEFAULT 0;
ALTER TABLE public.orders ALTER COLUMN tax_amount SET DEFAULT 0;
ALTER TABLE public.orders ALTER COLUMN discount_amount SET DEFAULT 0;
ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT 'bank_transfer';
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'pending';

-- UNIQUE constraint — order_number
DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- İndeksler
CREATE INDEX IF NOT EXISTS orders_status_idx          ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx  ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx  ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx      ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_id_idx         ON public.orders(user_id);

-- ═══════════════════════════════════════════════════════════════
-- order_items tablosu
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_id UUID;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_label TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_image TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) DEFAULT 0;

-- Foreign key constraints (idempotent)
DO $$ BEGIN
  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS order_items_order_id_idx   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- ═══════════════════════════════════════════════════════════════
-- order_number trigger — "DS-YYYY-NNNN" otomatik üretimi
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS orders_yearly_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_val INTEGER;
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
CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ═══════════════════════════════════════════════════════════════
-- Stok düşürme RPC'leri (atomic)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = COALESCE(stock_quantity, 0) - p_quantity
  WHERE id = p_variant_id
    AND COALESCE(stock_quantity, 0) >= p_quantity
  RETURNING stock_quantity INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Yetersiz stok: variant_id=%, istenen=%', p_variant_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET stock_quantity = COALESCE(stock_quantity, 0) - p_quantity
  WHERE id = p_product_id
    AND COALESCE(stock_quantity, 0) >= p_quantity
  RETURNING stock_quantity INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Yetersiz ürün stoğu: product_id=%, istenen=%', p_product_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- RLS — Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
CREATE POLICY "orders_anon_insert" ON public.orders
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_anon_insert" ON public.order_items;
CREATE POLICY "order_items_anon_insert" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

-- SELECT/UPDATE/DELETE policy YOK → anon erişemez. service_role bypass eder.

-- ═══════════════════════════════════════════════════════════════
-- Doğrulama (manuel çalıştır)
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items')
--   ORDER BY table_name, ordinal_position;
-- ═══════════════════════════════════════════════════════════════
