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
