-- ═══════════════════════════════════════════════════════════════
-- 0019 backfill ile eklenen yapay compare_price temizliği
-- (price * 1.12) — gerçek indirim yokken vitrinde -%11 göstermesin diye
-- İdempotent
-- ═══════════════════════════════════════════════════════════════

UPDATE product_variants
SET compare_price = NULL
WHERE discount_price IS NULL
  AND compare_price IS NOT NULL
  AND price IS NOT NULL
  AND price > 0
  AND compare_price = ROUND((price * 1.12)::numeric, 2);

UPDATE products p
SET compare_price = NULL
WHERE p.compare_price IS NOT NULL
  AND p.base_price IS NOT NULL
  AND p.base_price > 0
  AND p.compare_price = ROUND((p.base_price * 1.12)::numeric, 2);
