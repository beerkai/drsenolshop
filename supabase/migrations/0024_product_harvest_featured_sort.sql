-- ═══════════════════════════════════════════════════════════════
-- 0024 — Koleksiyon sıraları: En Yeni Hasat / Öne Çıkanlar
-- Admin /admin/vitrin üzerinden ayrı ayrı yönetilir.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS harvest_sort_order INTEGER,
  ADD COLUMN IF NOT EXISTS featured_sort_order INTEGER;

CREATE INDEX IF NOT EXISTS products_harvest_sort_order_idx
  ON public.products(harvest_sort_order NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS products_featured_sort_order_idx
  ON public.products(featured_sort_order NULLS LAST, sale_count DESC NULLS LAST);

-- Başlangıç: mevcut display_order veya created_at sırası
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY display_order NULLS LAST, created_at DESC, name
    ) * 10 AS rn
  FROM public.products
  WHERE harvest_sort_order IS NULL
)
UPDATE public.products p
SET harvest_sort_order = o.rn
FROM ordered o
WHERE p.id = o.id;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN is_featured IS TRUE THEN 0 ELSE 1 END,
        display_order NULLS LAST,
        sale_count DESC NULLS LAST,
        created_at DESC
    ) * 10 AS rn
  FROM public.products
  WHERE featured_sort_order IS NULL
)
UPDATE public.products p
SET featured_sort_order = o.rn
FROM ordered o
WHERE p.id = o.id;

COMMENT ON COLUMN public.products.harvest_sort_order IS
  'Koleksiyon sıralaması: sort=newest (En Yeni Hasat). NULL ise created_at DESC.';
COMMENT ON COLUMN public.products.featured_sort_order IS
  'Koleksiyon sıralaması: sort=popular (Öne Çıkanlar). NULL ise sale_count DESC.';
