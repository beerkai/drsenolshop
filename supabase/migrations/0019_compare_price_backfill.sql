-- ═══════════════════════════════════════════════════════════════
-- compare_price backfill — kartlarda liste / indirim öncesi fiyat
-- İdempotent: yalnızca boş alanları doldurur
-- ═══════════════════════════════════════════════════════════════

-- İndirimli varyant: compare = liste fiyatı (price)
UPDATE product_variants
SET compare_price = price
WHERE discount_price IS NOT NULL
  AND discount_price > 0
  AND discount_price < price
  AND (compare_price IS NULL OR compare_price < price);

-- İndirimsiz aktif varyant: referans compare (%12 üst — yalnızca boşken)
UPDATE product_variants
SET compare_price = ROUND((price * 1.12)::numeric, 2)
WHERE price IS NOT NULL
  AND price > 0
  AND discount_price IS NULL
  AND compare_price IS NULL
  AND (is_active IS NULL OR is_active = true);

-- Ürün seviyesi compare (varyantsız veya base_price listeleme)
UPDATE products p
SET compare_price = ROUND((p.base_price * 1.12)::numeric, 2)
WHERE p.base_price IS NOT NULL
  AND p.base_price > 0
  AND p.compare_price IS NULL
  AND p.is_active = true;
