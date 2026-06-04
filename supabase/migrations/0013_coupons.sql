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
