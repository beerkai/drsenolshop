-- ═══════════════════════════════════════════════════════════════
-- 0017_stock_movement.sql — Stok düşüm idempotency + iade RPC'leri
--                          + kupon konsumpsiyon ayrıştırma
-- ═══════════════════════════════════════════════════════════════
--
-- Neden:
--   * Stok yalnız PayTR callback'inde düşüyordu. Admin havale siparişini
--     'paid' yapınca veya iptal/iade edince stok güncellenmiyordu.
--   * Aynı PayTR callback iki kez gelirse stok iki kez düşüyordu (idempotent
--     değil).
--   * Kupon kullanım sayacı sipariş oluşturulunca artıyordu; PayTR
--     ödenmese de kupon hakkı tükeniyordu.
--
-- Çözümler:
--   1) orders.stock_decremented_at  → düşüm yapılınca stamp'lenir; ikinci
--      kez düşüm yapılmaz. NULL'a çekilince stok geri eklenebilir.
--   2) increment_variant_stock / increment_product_stock RPC'leri →
--      iptal/iade durumunda atomic stok iadesi.
--   3) orders.coupon_code           → kupon kodunu notes alanından
--      ayırıp dedicated kolona koy (parse riski yok).
--   4) orders.coupon_consumed_at   → kupon sayacı artırma idempotency.
--      bank_transfer'da createOrder anında, paytr'da ilk başarılı ödemede
--      tek seferlik artırılır.
--
-- Tam idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ─── orders kolonları (idempotent) ───────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_decremented_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_consumed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS orders_stock_decremented_at_idx
  ON public.orders(stock_decremented_at)
  WHERE stock_decremented_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_coupon_code_idx
  ON public.orders(coupon_code)
  WHERE coupon_code IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- Stok iade RPC'leri (decrement'lerin tersi)
-- ─ Yalnız SECURITY DEFINER ile service_role çağırır.
-- ─ Negatif stoğa düşmez (NULL korunur — decrement de aynı şekilde).
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Varyant bulunamadı: variant_id=%', p_variant_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity
  WHERE id = p_product_id
  RETURNING stock_quantity INTO new_stock;

  IF new_stock IS NULL THEN
    RAISE EXCEPTION 'Ürün bulunamadı: product_id=%', p_product_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.increment_variant_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_variant_stock(UUID, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION public.increment_product_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INTEGER) TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- Doğrulama (manuel çalıştır):
--
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name = 'orders'
--     AND column_name IN ('stock_decremented_at','coupon_code','coupon_consumed_at');
--
--   SELECT proname FROM pg_proc
--   WHERE proname IN ('increment_variant_stock','increment_product_stock');
-- ═══════════════════════════════════════════════════════════════
