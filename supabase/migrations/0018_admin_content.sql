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
