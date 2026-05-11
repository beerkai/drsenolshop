-- ═══════════════════════════════════════════════════════════════
-- 0001_orders.sql — Sipariş sistemi: orders + order_items
-- ═══════════════════════════════════════════════════════════════
--
-- v0.4.0 — Checkout / Sipariş akışı temeli
--
-- Notlar:
--  * order_items satırları snapshot mantığıyla tutulur (product_name,
--    unit_price, tax_rate kopyalanır). Ürünün adı veya fiyatı sonradan
--    değişse bile geçmiş sipariş kaydı sabit kalır.
--  * Adresler JSONB; valid adres yapısını uygulama doğrular.
--  * Misafir checkout: anon INSERT açık, anon SELECT/UPDATE/DELETE yok.
--    Sipariş okuma her zaman service_role üzerinden API ile.
--  * Stok düşürme atomik bir RPC fonksiyonuyla yapılır (decrement_variant_stock).
--
-- ═══════════════════════════════════════════════════════════════

-- ─── updated_at trigger fonksiyonu (idempotent oluşturma) ────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── ENUM tipleri ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',     -- yeni oluşturuldu, ödeme bekleniyor
    'paid',        -- ödeme alındı
    'preparing',   -- hazırlanıyor
    'shipped',     -- kargolandı
    'delivered',   -- teslim edildi
    'cancelled',   -- iptal
    'refunded'     -- iade
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',     -- ödeme bekleniyor (havale/EFT)
    'authorized',  -- 3DS doğrulandı, çekim yapılmadı
    'captured',    -- ödeme alındı
    'failed',      -- başarısız
    'refunded'     -- iade edildi
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'bank_transfer',  -- havale / EFT
    'iyzico',         -- Iyzico (v0.5'te aktif)
    'stripe',         -- ileride
    'cash_on_delivery'-- kapıda ödeme (ileride)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── orders tablosu ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- İnsan-okunur sipariş numarası (DS-2026-0001 gibi)
  order_number TEXT NOT NULL UNIQUE,

  status order_status NOT NULL DEFAULT 'pending',

  -- Müşteri bilgileri (misafir checkout için zorunlu, kayıtlıysa kopya)
  customer_email TEXT NOT NULL CHECK (customer_email <> ''),
  customer_phone TEXT,
  customer_name  TEXT NOT NULL CHECK (customer_name <> ''),

  -- Auth kullanıcı bağlantısı (v0.6'da gelecek; şimdilik null)
  user_id UUID,

  -- Adresler JSONB: { full_name, phone, address_line1, address_line2, city, district, postal_code, country }
  shipping_address JSONB NOT NULL,
  billing_address  JSONB,  -- null ise shipping_address kullanılır

  shipping_method TEXT DEFAULT 'standard',
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),

  -- Toplamlar (kuruş değil, TL — 2 ondalık)
  subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount    NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),

  -- Ödeme
  payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_ref    TEXT,  -- provider'a göre değişir (iyzico paymentId, vs.)

  -- Operasyonel
  notes           TEXT,
  tracking_number TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ,
  shipped_at   TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- updated_at trigger
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- İndeksler
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);

-- ─── order_items tablosu ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- Ürün/varyant referansı (silinmiş olabilir, null'a düşer)
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,

  -- Snapshot — sipariş anındaki bilgi sabit kalır
  product_name  TEXT NOT NULL,
  variant_label TEXT,
  sku           TEXT,
  product_slug  TEXT,
  product_image TEXT,

  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate   NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- ─── order_number üretici sequence + trigger ────────────────────────
-- "DS-YYYY-NNNN" formatında. NNNN her yıl 1'den başlar.
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

-- ─── Stok düşürme — atomic RPC ──────────────────────────────────────
-- API tarafı bunu çağırır. Race condition'a karşı CHECK ile koşullu UPDATE.
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

-- Aynı fonksiyon variant yoksa product düzeyinde
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

-- ─── RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- orders: anon SELECT/UPDATE/DELETE YOK. INSERT açık (misafir checkout).
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
CREATE POLICY "orders_anon_insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- order_items: aynı şekilde, sadece INSERT.
DROP POLICY IF EXISTS "order_items_anon_insert" ON public.order_items;
CREATE POLICY "order_items_anon_insert" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (true);

-- SELECT/UPDATE/DELETE için policy YOK → anon erişemez.
-- service_role her zaman RLS bypass eder, API route oradan sorgular.

-- ═══════════════════════════════════════════════════════════════
-- Doğrulama sorguları (manuel çalıştırma için):
--   SELECT * FROM pg_policies WHERE tablename IN ('orders', 'order_items');
--   SELECT typname FROM pg_type WHERE typname IN ('order_status', 'payment_status', 'payment_method');
-- ═══════════════════════════════════════════════════════════════
