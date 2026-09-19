-- 0023 — products.display_order (0018 yedek / prod kaçırıldıysa)
-- İdempotent — 0018 ile aynı mantık

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS products_display_order_idx
  ON public.products(display_order NULLS LAST, created_at DESC);

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, name ASC) AS rn
  FROM public.products
  WHERE display_order IS NULL
)
UPDATE public.products p
SET display_order = o.rn
FROM ordered o
WHERE p.id = o.id;

COMMENT ON COLUMN public.products.display_order IS
  'Admin katalog sırası; küçük değer önce.';
